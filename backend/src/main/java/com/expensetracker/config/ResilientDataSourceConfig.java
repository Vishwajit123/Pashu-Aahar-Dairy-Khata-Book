package com.expensetracker.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.io.File;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.URI;

/**
 * Resilient DataSource configuration that guarantees Spring Boot starts up successfully
 * on port 8080 under all circumstances:
 * 1. Connects to primary cloud database (Supabase PostgreSQL) when available.
 * 2. If offline, network disconnected, or Supabase is paused/unreachable, automatically
 *    falls back to a local persistent H2 database so the backend NEVER crashes on startup!
 */
@Configuration
public class ResilientDataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(ResilientDataSourceConfig.class);

    @Value("${spring.datasource.url:}")
    private String primaryUrl;

    @Value("${spring.datasource.username:}")
    private String username;

    @Value("${spring.datasource.password:}")
    private String password;

    @Value("${spring.datasource.driver-class-name:}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        if (primaryUrl != null && !primaryUrl.isBlank() && !primaryUrl.contains("h2:mem") && !primaryUrl.contains("h2:file")) {
            boolean isReachable = testReachability(primaryUrl);
            if (isReachable) {
                try {
                    log.info("Testing connection to cloud database: {}", sanitizeUrl(primaryUrl));
                    HikariConfig config = new HikariConfig();
                    config.setJdbcUrl(primaryUrl);
                    config.setUsername(username);
                    config.setPassword(password);
                    if (driverClassName != null && !driverClassName.isBlank()) {
                        config.setDriverClassName(driverClassName);
                    }
                    config.setMaximumPoolSize(5);
                    config.setMinimumIdle(1);
                    config.setConnectionTimeout(8000); // 8s timeout to avoid blocking forever
                    config.setIdleTimeout(30000);
                    config.setMaxLifetime(60000);
                    config.setPoolName("ExpenseTracker-CloudHikariPool");

                    HikariDataSource ds = new HikariDataSource(config);
                    log.info("Cloud PostgreSQL database connected successfully!");
                    return ds;
                } catch (Exception e) {
                    log.warn("Failed to initialize cloud database ({}). Activating local fallback...", e.getMessage());
                }
            } else {
                log.warn("Cloud database host is currently unreachable (offline/slow DNS). Activating local fallback...");
            }
        }

        return createFallbackH2DataSource();
    }

    private DataSource createFallbackH2DataSource() {
        log.warn("================================================================================");
        log.warn(" [RESILIENCE FALLBACK ACTIVATED] Using persistent local H2 file database!");
        log.warn(" Backend server will start up normally on port 8080 without interruption.");
        log.warn(" Database file location: ./data/expensedb.mv.db");
        log.warn("================================================================================");

        // Ensure data directory exists
        File dataDir = new File("./data");
        if (!dataDir.exists()) {
            dataDir.mkdirs();
        }

        HikariConfig h2Config = new HikariConfig();
        h2Config.setJdbcUrl("jdbc:h2:file:./data/expensedb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;AUTO_RECONNECT=TRUE;MODE=PostgreSQL");
        h2Config.setDriverClassName("org.h2.Driver");
        h2Config.setUsername("sa");
        h2Config.setPassword("");
        h2Config.setMaximumPoolSize(10);
        h2Config.setPoolName("ExpenseTracker-LocalH2Pool");

        return new HikariDataSource(h2Config);
    }

    private boolean testReachability(String jdbcUrl) {
        try {
            // Strip jdbc: protocol to parse URI
            String clean = jdbcUrl.replace("jdbc:", "");
            int queryIdx = clean.indexOf('?');
            if (queryIdx > 0) {
                clean = clean.substring(0, queryIdx);
            }
            URI uri = URI.create(clean);
            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;

            if (host == null || host.isBlank()) {
                return false;
            }

            try (Socket socket = new Socket()) {
                socket.connect(new InetSocketAddress(host, port), 2500); // 2.5s quick probe
                return true;
            }
        } catch (Exception e) {
            log.debug("Reachability probe failed for {}: {}", jdbcUrl, e.getMessage());
            return false;
        }
    }

    private String sanitizeUrl(String url) {
        if (url == null) return "";
        return url.replaceAll("://.*@", "://***:***@");
    }
}
