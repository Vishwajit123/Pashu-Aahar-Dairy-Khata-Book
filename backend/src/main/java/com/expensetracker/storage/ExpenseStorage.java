package com.expensetracker.storage;

import com.expensetracker.model.ExpenseData;

import java.util.List;

/**
 * Storage interface decoupling business logic from the underlying persistence mechanism.
 * Allows effortless substitution with Oracle SQL / JDBC / JPA in future iterations.
 */
public interface ExpenseStorage {

    /**
     * Loads all persisted expense records into memory.
     * @return List of ExpenseData records
     */
    List<ExpenseData> loadExpenses();

    /**
     * Persists a single newly created expense record.
     * @param expense ExpenseData to append
     */
    void saveExpense(ExpenseData expense);

    /**
     * Persists the entire list of expense records (used on update/delete/re-sort).
     * @param expenseList List of ExpenseData to save
     */
    void saveAllExpenses(List<ExpenseData> expenseList);

    /**
     * Deletes an expense by its ID from storage.
     * @param id The ID of the expense to delete
     */
    default void deleteExpense(int id) {}
}
