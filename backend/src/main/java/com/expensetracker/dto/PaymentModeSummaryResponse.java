package com.expensetracker.dto;

import java.math.BigDecimal;

public class PaymentModeSummaryResponse {
    private String paymentMode;
    private BigDecimal totalSpent;
    private int count;
    private double percentage;

    public PaymentModeSummaryResponse() {
    }

    public PaymentModeSummaryResponse(String paymentMode, BigDecimal totalSpent, int count, double percentage) {
        this.paymentMode = paymentMode;
        this.totalSpent = totalSpent;
        this.count = count;
        this.percentage = percentage;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
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
