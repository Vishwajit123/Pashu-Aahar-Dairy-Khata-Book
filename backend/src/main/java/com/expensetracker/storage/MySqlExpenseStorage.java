package com.expensetracker.storage;

import com.expensetracker.model.ExpenseData;
import com.expensetracker.repository.ExpenseRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * MySQL Database implementation of ExpenseStorage utilizing Spring Data JPA.
 * Automatically initializes and migrates legacy records from expense.txt if the database table is empty.
 */
@Component
@Primary
public class MySqlExpenseStorage implements ExpenseStorage {

    private static final Logger logger = LoggerFactory.getLogger(MySqlExpenseStorage.class);

    private final ExpenseRepository repository;
    private final FileExpenseStorage fileExpenseStorage;

    public MySqlExpenseStorage(ExpenseRepository repository, FileExpenseStorage fileExpenseStorage) {
        this.repository = repository;
        this.fileExpenseStorage = fileExpenseStorage;
    }

    /**
     * Seeds the MySQL database with existing records from expense.txt on initial startup.
     */
    @PostConstruct
    public void initAndSeed() {
        try {
            long count = repository.count();
            if (count == 0) {
                logger.info("MySQL 'expenses' table is empty. Migrating records from expense.txt...");
                List<ExpenseData> legacyExpenses = fileExpenseStorage.loadExpenses();
                if (!legacyExpenses.isEmpty()) {
                    repository.saveAll(legacyExpenses);
                    logger.info("Successfully imported {} expenses from expense.txt into MySQL database!", legacyExpenses.size());
                } else {
                    logger.info("No legacy expenses found in expense.txt to migrate.");
                }
            } else {
                logger.info("MySQL database already contains {} expenses.", count);
            }
        } catch (Exception e) {
            logger.warn("Could not auto-seed MySQL on startup: {}", e.getMessage());
        }
    }

    @Override
    public List<ExpenseData> loadExpenses() {
        return repository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    @Override
    public void saveExpense(ExpenseData expense) {
        repository.save(expense);
    }

    @Override
    public void saveAllExpenses(List<ExpenseData> expenseList) {
        repository.saveAll(expenseList);
    }

    @Override
    public void deleteExpense(int id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            logger.info("Deleted expense with ID {} from MySQL database", id);
        }
    }
}
