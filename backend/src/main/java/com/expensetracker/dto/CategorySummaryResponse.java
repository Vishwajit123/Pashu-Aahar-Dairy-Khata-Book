package com.expensetracker.dto;

import java.math.BigDecimal;

public class CategorySummaryResponse {
    private String category;
    private BigDecimal totalSpent;
    private int count;
    private double percentage;

    public CategorySummaryResponse() {
    }

    public CategorySummaryResponse(String category, BigDecimal totalSpent, int count, double percentage) {
        this.category = category;
        this.totalSpent = totalSpent;
        this.count = count;
        this.percentage = percentage;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
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

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }
}
