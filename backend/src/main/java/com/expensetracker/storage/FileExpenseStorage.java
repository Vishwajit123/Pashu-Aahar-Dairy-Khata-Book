package com.expensetracker.storage;

import com.expensetracker.exception.StorageException;
import com.expensetracker.model.ExpenseData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

/**
 * File-based implementation of ExpenseStorage reusing and extending
 * the original ExpenseFileFormat logic.
 * Reads and writes pipe-delimited format:
 * id|expenseName|description|amount|expenseDate|category|modeOfPayment
 */
@Component
public class FileExpenseStorage implements ExpenseStorage {

    private static final Logger logger = LoggerFactory.getLogger(FileExpenseStorage.class);

    private final String filePath;
    private final Object fileLock = new Object();

    public FileExpenseStorage(@Value("${expense.storage.filepath:../expense.txt}") String filePath) {
        this.filePath = resolveFilePath(filePath);
        logger.info("Initialized FileExpenseStorage with target file: {}", this.filePath);
    }

    /**
     * Resolves the target file path, checking existing parent / working directory locations.
     */
    private String resolveFilePath(String configuredPath) {
        File directFile = new File(configuredPath);
        if (directFile.exists()) {
            return directFile.getAbsolutePath();
        }

        // Check if expense.txt is in current directory
        File localFile = new File("expense.txt");
        if (localFile.exists()) {
            return localFile.getAbsolutePath();
        }

        // Check if expense.txt is in parent directory
        File parentFile = new File("../expense.txt");
        if (parentFile.exists()) {
            return parentFile.getAbsolutePath();
        }

        // Fallback to configured path
        return directFile.getAbsolutePath();
    }

    private String convertToFileFormat(ExpenseData expenseData) {
        String name = expenseData.getExpenseName() != null ? expenseData.getExpenseName().trim() : "";
        String desc = expenseData.getDescription() != null ? expenseData.getDescription().trim() : "";
        String amount = expenseData.getAmount() != null ?
                expenseData.getAmount().setScale(2, RoundingMode.HALF_UP).toPlainString() : "0.00";
        String date = expenseData.getExpenseDate() != null ? expenseData.getExpenseDate().toString() : LocalDate.now().toString();
        String category = expenseData.getCategory() != null ? expenseData.getCategory().trim() : "Other";
        String mode = expenseData.getModeOfPayment() != null ? expenseData.getModeOfPayment().trim() : "Cash";

        return expenseData.getId() + "|" + name + "|" + desc + "|" + amount + "|" + date + "|" + category + "|" + mode;
    }

    @Override
    public List<ExpenseData> loadExpenses() {
        synchronized (fileLock) {
            List<ExpenseData> list = new ArrayList<>();
            File file = new File(filePath);

            if (!file.exists()) {
                logger.warn("Storage file does not exist at {}. Returning empty list.", file.getAbsolutePath());
                return list;
            }

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(new FileInputStream(file), StandardCharsets.UTF_8))) {

                String line;
                int lineNumber = 0;
                while ((line = reader.readLine()) != null) {
                    lineNumber++;
                    String trimmedLine = line.trim();
                    if (trimmedLine.isEmpty()) {
                        continue;
                    }

                    String[] parts = line.split("\\|", -1);
                    if (parts.length != 7) {
                        logger.warn("Skipping invalid line #{}: {}", lineNumber, line);
                        continue;
                    }

                    try {
                        int id = Integer.parseInt(parts[0].trim());
                        String name = parts[1].trim();
                        String description = parts[2].trim();
                        BigDecimal amount = new BigDecimal(parts[3].trim());
                        LocalDate date = LocalDate.parse(parts[4].trim());
                        String category = parts[5].trim();
                        String paymentMode = parts[6].trim();

                        ExpenseData expense = new ExpenseData(id, name, description, amount, date, category, paymentMode);
                        list.add(expense);
                    } catch (NumberFormatException | DateTimeParseException e) {
                        logger.error("Failed to parse expense on line #{}: {} - Error: {}", lineNumber, line, e.getMessage());
                    }
                }
            } catch (IOException e) {
                logger.error("Error reading file: {}", filePath, e);
                throw new StorageException("Failed to read expenses from file: " + e.getMessage(), e);
            }

            logger.info("Successfully loaded {} expenses from {}", list.size(), filePath);
            return list;
        }
    }

    @Override
    public void saveExpense(ExpenseData expense) {
        synchronized (fileLock) {
            File file = new File(filePath);
            ensureParentDirectoryExists(file);

            try (BufferedWriter writer = new BufferedWriter(
                    new OutputStreamWriter(new FileOutputStream(file, true), StandardCharsets.UTF_8))) {

                String line = convertToFileFormat(expense);
                writer.write(line);
                writer.newLine();
                writer.flush();
            } catch (IOException e) {
                logger.error("Error appending expense to file: {}", filePath, e);
                throw new StorageException("Failed to append expense to file: " + e.getMessage(), e);
            }
        }
    }

    @Override
    public void saveAllExpenses(List<ExpenseData> expenseDataList) {
        synchronized (fileLock) {
            File file = new File(filePath);
            ensureParentDirectoryExists(file);

            try (BufferedWriter writer = new BufferedWriter(
                    new OutputStreamWriter(new FileOutputStream(file, false), StandardCharsets.UTF_8))) {

                for (ExpenseData expense : expenseDataList) {
                    String line = convertToFileFormat(expense);
                    writer.write(line);
                    writer.newLine();
                }
                writer.flush();
            } catch (IOException e) {
                logger.error("Error saving all expenses to file: {}", filePath, e);
                throw new StorageException("Failed to save all expenses to file: " + e.getMessage(), e);
            }
        }
    }

    private void ensureParentDirectoryExists(File file) {
        File parent = file.getParentFile();
        if (parent != null && !parent.exists()) {
            parent.mkdirs();
        }
    }

    public String getFilePath() {
        return filePath;
    }
}
