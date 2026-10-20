package com.expensetracker.dto;

import com.expensetracker.model.ExpenseData;

import java.math.BigDecimal;
import java.util.List;

public class MonthlySummaryResponse {
    private String yearMonth;
    private BigDecimal totalSpent;
    private int count;
    private List<ExpenseData> expenses;

    public MonthlySummaryResponse() {
        this.totalSpent = BigDecimal.ZERO;
        this.count = 0;
    }

    public MonthlySummaryResponse(String yearMonth, BigDecimal totalSpent, int count, List<ExpenseData> expenses) {
        this.yearMonth = yearMonth;
        this.totalSpent = totalSpent;
        this.count = count;
        this.expenses = expenses;
    }

    public String getYearMonth() {
        return yearMonth;
    }

    public void setYearMonth(String yearMonth) {
        this.yearMonth = yearMonth;
    }

    public BigDecimal getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(BigDecimal totalSpent) {
        this.totalSpent = totalSpent;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public List<ExpenseData> getExpenses() {
        return expenses;
    }

    public void setExpenses(List<ExpenseData> expenses) {
        this.expenses = expenses;
    }
}
