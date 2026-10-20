package com.expensetracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseRequest {

    @NotBlank(message = "Expense name is required.")
    @Size(max = 100, message = "Expense name cannot exceed 100 characters.")
    private String expenseName;

    @Size(max = 255, message = "Description cannot exceed 255 characters.")
    private String description;

    @NotNull(message = "Amount is required.")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero.")
    private BigDecimal amount;

    @NotNull(message = "Expense date is required.")
    private LocalDate expenseDate;

    @NotBlank(message = "Category is required.")
    private String category;

    @NotBlank(message = "Mode of payment is required.")
    private String modeOfPayment;

    private Integer customerId;

    @Size(max = 100, message = "Customer name cannot exceed 100 characters.")
    private String customerName;

    @Size(max = 20, message = "Customer phone cannot exceed 20 characters.")
    private String customerPhone;

    private String paymentStatus; // PAID, PARTIAL, UNPAID

    private BigDecimal paidAmount;

    public ExpenseRequest() {
        this.paymentStatus = "PAID";
        this.customerName = "Walk-in Customer";
    }

    public ExpenseRequest(String expenseName, String description, BigDecimal amount,
                          LocalDate expenseDate, String category, String modeOfPayment) {
        this(expenseName, description, amount, expenseDate, category, modeOfPayment, null, "Walk-in Customer", "", "PAID", null);
    }

    public ExpenseRequest(String expenseName, String description, BigDecimal amount,
                          LocalDate expenseDate, String category, String modeOfPayment,
                          Integer customerId, String customerName, String customerPhone, String paymentStatus) {
        this(expenseName, description, amount, expenseDate, category, modeOfPayment, customerId, customerName, customerPhone, paymentStatus, null);
    }

    public ExpenseRequest(String expenseName, String description, BigDecimal amount,
                          LocalDate expenseDate, String category, String modeOfPayment,
                          Integer customerId, String customerName, String customerPhone, String paymentStatus, BigDecimal paidAmount) {
        this.expenseName = expenseName;
        this.description = description;
        this.amount = amount;
        this.expenseDate = expenseDate;
        this.category = category;
        this.modeOfPayment = modeOfPayment;
        this.customerId = customerId;
        this.customerName = customerName != null && !customerName.trim().isEmpty() ? customerName.trim() : "Walk-in Customer";
        this.customerPhone = customerPhone != null ? customerPhone.trim() : "";
        this.paymentStatus = paymentStatus != null ? paymentStatus.toUpperCase() : "PAID";
        this.paidAmount = paidAmount;
    }

    public String getExpenseName() {
        return expenseName;
    }

    public void setExpenseName(String expenseName) {
        this.expenseName = expenseName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getModeOfPayment() {
        return modeOfPayment;
    }

    public void setModeOfPayment(String modeOfPayment) {
        this.modeOfPayment = modeOfPayment;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }
}
