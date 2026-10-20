package com.expensetracker.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Objects;

/**
 * Domain model & JPA Entity representing an Expense record.
 * Supports partial payments (e.g. Total 2000, Paid 1200, Due 800)
 * with BigDecimal precision.
 */
@Entity
@Table(name = "expenses")
public class ExpenseData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "expense_name", nullable = false, length = 100)
    private String expenseName;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "mode_of_payment", nullable = false, length = 50)
    private String modeOfPayment;

    @Column(name = "customer_id")
    private Integer customerId;

    @Column(name = "customer_name", length = 100)
    private String customerName = "Walk-in Customer";

    @Column(name = "customer_phone", length = 20)
    private String customerPhone = "";

    @Column(name = "payment_status", length = 20, nullable = false)
    private String paymentStatus = "PAID"; // PAID, PARTIAL, UNPAID

    @Column(name = "paid_amount", precision = 12, scale = 2)
    private BigDecimal paidAmount;

    @Column(name = "user_id", length = 100)
    private String userId;

    public ExpenseData() {
        this.paymentStatus = "PAID";
        this.customerName = "Walk-in Customer";
    }

    public ExpenseData(Integer id, String expenseName, String description, BigDecimal amount,
                       LocalDate expenseDate, String category, String modeOfPayment) {
        this(id, expenseName, description, amount, expenseDate, category, modeOfPayment, null, "Walk-in Customer", "", "PAID", null, null);
    }

    public ExpenseData(Integer id, String expenseName, String description, BigDecimal amount,
                       LocalDate expenseDate, String category, String modeOfPayment,
                       Integer customerId, String customerName, String customerPhone, String paymentStatus) {
        this(id, expenseName, description, amount, expenseDate, category, modeOfPayment, customerId, customerName, customerPhone, paymentStatus, null, null);
    }

    public ExpenseData(Integer id, String expenseName, String description, BigDecimal amount,
                       LocalDate expenseDate, String category, String modeOfPayment,
                       Integer customerId, String customerName, String customerPhone,
                       String paymentStatus, BigDecimal paidAmount) {
        this(id, expenseName, description, amount, expenseDate, category, modeOfPayment, customerId, customerName, customerPhone, paymentStatus, paidAmount, null);
    }

    public ExpenseData(Integer id, String expenseName, String description, BigDecimal amount,
                       LocalDate expenseDate, String category, String modeOfPayment,
                       Integer customerId, String customerName, String customerPhone,
                       String paymentStatus, BigDecimal paidAmount, String userId) {
        this.id = id;
        this.expenseName = expenseName != null ? expenseName.trim() : "";
        this.description = description != null ? description.trim() : "";
        this.amount = amount != null ? amount.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        this.expenseDate = expenseDate != null ? expenseDate : LocalDate.now();
        this.category = category != null ? category.trim() : "Other";
        this.modeOfPayment = modeOfPayment != null ? modeOfPayment.trim() : "Cash";
        this.customerId = customerId;
        this.customerName = customerName != null && !customerName.trim().isEmpty() ? customerName.trim() : "Walk-in Customer";
        this.customerPhone = customerPhone != null ? customerPhone.trim() : "";
        this.userId = userId;

        if (paidAmount != null) {
            this.paidAmount = paidAmount.setScale(2, RoundingMode.HALF_UP);
            updatePaymentStatusFromPaidAmount();
        } else {
            this.paymentStatus = paymentStatus != null ? paymentStatus.toUpperCase() : "PAID";
            if ("UNPAID".equalsIgnoreCase(this.paymentStatus)) {
                this.paidAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
            } else if ("PAID".equalsIgnoreCase(this.paymentStatus)) {
                this.paidAmount = this.amount;
            } else {
                this.paidAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
            }
        }
    }

    // Convenience constructor for legacy integer amounts
    public ExpenseData(Integer id, String expenseName, String description, int amount,
                       LocalDate expenseDate, String category, String modeOfPayment) {
        this(id, expenseName, description, BigDecimal.valueOf(amount).setScale(2, RoundingMode.HALF_UP),
             expenseDate, category, modeOfPayment, null, "Walk-in Customer", "", "PAID", null);
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getExpenseName() {
        return expenseName;
    }

    public void setExpenseName(String expenseName) {
        this.expenseName = expenseName != null ? expenseName.trim() : "";
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description != null ? description.trim() : "";
    }

    public BigDecimal getAmount() {
        return amount != null ? amount.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount != null ? amount.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        updatePaymentStatusFromPaidAmount();
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate != null ? expenseDate : LocalDate.now();
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category != null ? category.trim() : "Other";
    }

    public String getModeOfPayment() {
        return modeOfPayment;
    }

    public void setModeOfPayment(String modeOfPayment) {
        this.modeOfPayment = modeOfPayment != null ? modeOfPayment.trim() : "Cash";
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
        this.customerName = customerName != null && !customerName.trim().isEmpty() ? customerName.trim() : "Walk-in Customer";
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone != null ? customerPhone.trim() : "";
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus != null ? paymentStatus.toUpperCase() : "PAID";
    }

    public BigDecimal getPaidAmount() {
        if (paidAmount != null) {
            return paidAmount.setScale(2, RoundingMode.HALF_UP);
        }
        if ("UNPAID".equalsIgnoreCase(paymentStatus)) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return getAmount();
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        if (paidAmount == null) {
            this.paidAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        } else {
            this.paidAmount = paidAmount.setScale(2, RoundingMode.HALF_UP);
        }
        updatePaymentStatusFromPaidAmount();
    }

    @JsonProperty("dueAmount")
    public BigDecimal getDueAmount() {
        BigDecimal total = getAmount();
        BigDecimal paid = getPaidAmount();
        BigDecimal due = total.subtract(paid);
        return due.compareTo(BigDecimal.ZERO) > 0 ? due.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }

    public void updatePaymentStatusFromPaidAmount() {
        BigDecimal total = getAmount();
        BigDecimal paid = this.paidAmount != null ? this.paidAmount : BigDecimal.ZERO;

        if (paid.compareTo(BigDecimal.ZERO) <= 0) {
            this.paymentStatus = "UNPAID";
            this.paidAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        } else if (paid.compareTo(total) >= 0) {
            this.paymentStatus = "PAID";
            this.paidAmount = total;
        } else {
            this.paymentStatus = "PARTIAL";
        }
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ExpenseData that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "ID: " + id +
                ", Expense Name: " + expenseName +
                ", Description: " + description +
                ", Amount: " + amount +
                ", Paid: " + getPaidAmount() +
                ", Due: " + getDueAmount() +
                ", Date: " + expenseDate +
                ", Category: " + category +
                ", Mode: " + modeOfPayment +
                ", Status: " + paymentStatus;
    }
}
