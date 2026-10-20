package com.expensetracker.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity representing an individual payment receipt collected from a customer
 * towards their Khata account or a specific purchase bill.
 */
@Entity
@Table(name = "customer_payments")
public class CustomerPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "customer_id", nullable = false)
    private Integer customerId;

    @Column(name = "customer_name", length = 100)
    private String customerName;

    @Column(name = "expense_id")
    private Integer expenseId;

    @Column(name = "bill_name", length = 100)
    private String billName;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_mode", nullable = false, length = 50)
    private String paymentMode = "Cash";

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "notes", length = 255)
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "user_id", length = 100)
    private String userId;

    public CustomerPayment() {
        this.paymentDate = LocalDate.now();
        this.createdAt = LocalDateTime.now();
        this.paymentMode = "Cash";
    }

    public CustomerPayment(Integer customerId, String customerName, Integer expenseId,
                           String billName, BigDecimal amount, String paymentMode,
                           LocalDate paymentDate, String notes) {
        this(customerId, customerName, expenseId, billName, amount, paymentMode, paymentDate, notes, null);
    }

    public CustomerPayment(Integer customerId, String customerName, Integer expenseId,
                           String billName, BigDecimal amount, String paymentMode,
                           LocalDate paymentDate, String notes, String userId) {
        this.customerId = customerId;
        this.customerName = customerName;
        this.expenseId = expenseId;
        this.billName = billName != null ? billName.trim() : "Khata Settlement";
        this.amount = amount != null ? amount.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        this.paymentMode = paymentMode != null && !paymentMode.trim().isEmpty() ? paymentMode.trim() : "Cash";
        this.paymentDate = paymentDate != null ? paymentDate : LocalDate.now();
        this.notes = notes != null ? notes.trim() : "";
        this.createdAt = LocalDateTime.now();
        this.userId = userId;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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

    public Integer getExpenseId() {
        return expenseId;
    }

    public void setExpenseId(Integer expenseId) {
        this.expenseId = expenseId;
    }

    public String getBillName() {
        return billName;
    }

    public void setBillName(String billName) {
        this.billName = billName;
    }

    public BigDecimal getAmount() {
        return amount != null ? amount.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount != null ? amount.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }

    public String getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(String paymentMode) {
        this.paymentMode = paymentMode != null && !paymentMode.trim().isEmpty() ? paymentMode.trim() : "Cash";
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate != null ? paymentDate : LocalDate.now();
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
