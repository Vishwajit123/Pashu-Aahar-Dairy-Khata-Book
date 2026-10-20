package com.expensetracker.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CustomerSummaryResponse {

    private Integer id;
    private String name;
    private String phone;
    private String address;
    private String notes;
    private LocalDate createdAt;
    private BigDecimal totalPurchases;
    private BigDecimal totalPaid;
    private BigDecimal totalUnpaid;
    private int transactionCount;

    public CustomerSummaryResponse() {
        this.totalPurchases = BigDecimal.ZERO;
        this.totalPaid = BigDecimal.ZERO;
        this.totalUnpaid = BigDecimal.ZERO;
    }

    public CustomerSummaryResponse(Integer id, String name, String phone, String address, String notes,
                                   LocalDate createdAt, BigDecimal totalPurchases, BigDecimal totalPaid,
                                   BigDecimal totalUnpaid, int transactionCount) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.address = address;
        this.notes = notes;
        this.createdAt = createdAt;
        this.totalPurchases = totalPurchases != null ? totalPurchases : BigDecimal.ZERO;
        this.totalPaid = totalPaid != null ? totalPaid : BigDecimal.ZERO;
        this.totalUnpaid = totalUnpaid != null ? totalUnpaid : BigDecimal.ZERO;
        this.transactionCount = transactionCount;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }

    public BigDecimal getTotalPurchases() {
        return totalPurchases;
    }

    public void setTotalPurchases(BigDecimal totalPurchases) {
        this.totalPurchases = totalPurchases;
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

    public int getTransactionCount() {
        return transactionCount;
    }

    public void setTransactionCount(int transactionCount) {
        this.transactionCount = transactionCount;
    }
}
