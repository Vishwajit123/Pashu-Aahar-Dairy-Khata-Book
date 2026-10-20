package com.expensetracker.dto;

import com.expensetracker.model.ExpenseData;

import java.math.BigDecimal;

public class SummaryResponse {
    private BigDecimal totalMoneySpent;
    private BigDecimal totalPaid;
    private BigDecimal totalUnpaid;
    private int totalExpenses;
    private BigDecimal averageExpense;
    private ExpenseData highestExpense;
    private ExpenseData lowestExpense;

    public SummaryResponse() {
        this.totalMoneySpent = BigDecimal.ZERO;
        this.totalPaid = BigDecimal.ZERO;
        this.totalUnpaid = BigDecimal.ZERO;
        this.totalExpenses = 0;
        this.averageExpense = BigDecimal.ZERO;
    }

    public SummaryResponse(BigDecimal totalMoneySpent, BigDecimal totalPaid, BigDecimal totalUnpaid,
                           int totalExpenses, BigDecimal averageExpense,
                           ExpenseData highestExpense, ExpenseData lowestExpense) {
        this.totalMoneySpent = totalMoneySpent != null ? totalMoneySpent : BigDecimal.ZERO;
        this.totalPaid = totalPaid != null ? totalPaid : BigDecimal.ZERO;
        this.totalUnpaid = totalUnpaid != null ? totalUnpaid : BigDecimal.ZERO;
        this.totalExpenses = totalExpenses;
        this.averageExpense = averageExpense != null ? averageExpense : BigDecimal.ZERO;
        this.highestExpense = highestExpense;
        this.lowestExpense = lowestExpense;
    }

    public BigDecimal getTotalMoneySpent() {
        return totalMoneySpent;
    }

    public void setTotalMoneySpent(BigDecimal totalMoneySpent) {
        this.totalMoneySpent = totalMoneySpent;
    }

    public BigDecimal getTotalPaid() {
        return totalPaid;
    }

    public void setTotalPaid(BigDecimal totalPaid) {
        this.totalPaid = totalPaid;
    }

    public BigDecimal getTotalUnpaid() {
        return totalUnpaid;
    }

    public void setTotalUnpaid(BigDecimal totalUnpaid) {
        this.totalUnpaid = totalUnpaid;
    }

    public int getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(int totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public BigDecimal getAverageExpense() {
        return averageExpense;
    }

    public void setAverageExpense(BigDecimal averageExpense) {
        this.averageExpense = averageExpense;
    }

    public ExpenseData getHighestExpense() {
        return highestExpense;
    }

    public void setHighestExpense(ExpenseData highestExpense) {
        this.highestExpense = highestExpense;
    }

    public ExpenseData getLowestExpense() {
        return lowestExpense;
    }

    public void setLowestExpense(ExpenseData lowestExpense) {
        this.lowestExpense = lowestExpense;
    }
}
