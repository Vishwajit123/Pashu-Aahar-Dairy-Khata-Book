package com.expensetracker.repository;

import com.expensetracker.model.ExpenseData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Spring Data JPA Repository for ExpenseData entity in MySQL.
 */
@Repository
public interface ExpenseRepository extends JpaRepository<ExpenseData, Integer> {

    List<ExpenseData> findByUserId(String userId);

    List<ExpenseData> findByCategoryIgnoreCase(String category);

    List<ExpenseData> findByExpenseDate(LocalDate expenseDate);

    List<ExpenseData> findByModeOfPaymentIgnoreCase(String modeOfPayment);
}
