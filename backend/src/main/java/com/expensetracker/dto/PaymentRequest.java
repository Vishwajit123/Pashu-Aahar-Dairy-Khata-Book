package com.expensetracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request payload for recording a customer payment or bill payment settlement.
 */
public class PaymentRequest {

    @NotNull(message = "Payment amount is required.")
    @DecimalMin(value = "0.01", message = "Payment amount must be greater than zero.")
    private BigDecimal amount;

    private String paymentMode = "Cash";

    private String notes;

    private LocalDate paymentDate;

    public PaymentRequest() {
        this.paymentDate = LocalDate.now();
        this.paymentMode = "Cash";
    }

    public PaymentRequest(BigDecimal amount, String paymentMode, String notes, LocalDate paymentDate) {
        this.amount = amount;
        this.paymentMode = paymentMode != null ? paymentMode : "Cash";
        this.notes = notes;
        this.paymentDate = paymentDate != null ? paymentDate : LocalDate.now();
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }
}
