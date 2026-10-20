package com.expensetracker.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Utility to extract and resolve current authenticated user ID
 * from HTTP request headers (X-User-Id or Supabase JWT Authorization Bearer).
 */
public class SecurityUtils {

    public static String getCurrentUserId() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            return null;
        }
        return resolveUserId(attrs.getRequest());
    }

    public static String resolveUserId(HttpServletRequest request) {
        if (request == null) return null;

        // 1. Explicit Header X-User-Id (passed by frontend)
        String headerUserId = request.getHeader("X-User-Id");
        if (headerUserId != null && !headerUserId.trim().isEmpty()) {
            return headerUserId.trim();
        }

        // 2. Decode Supabase JWT Authorization Bearer <token>
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7).trim();
            String sub = extractSubFromJwt(token);
            if (sub != null && !sub.trim().isEmpty()) {
                return sub.trim();
            }
        }

        return null;
    }

    private static String extractSubFromJwt(String jwt) {
        try {
            String[] parts = jwt.split("\\.");
            if (parts.length < 2) return null;
            byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
            String json = new String(decoded, StandardCharsets.UTF_8);
            // Locate "sub":"<uuid>" in JSON payload
            int subIdx = json.indexOf("\"sub\":");
            if (subIdx == -1) return null;
            int startQuote = json.indexOf("\"", subIdx + 6);
            if (startQuote == -1) return null;
            int endQuote = json.indexOf("\"", startQuote + 1);
            if (endQuote == -1) return null;
            return json.substring(startQuote + 1, endQuote);
        } catch (Exception e) {
            return null;
        }
    }
}
