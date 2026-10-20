package com.expensetracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.Objects;

/**
 * Entity representing a Customer profile in the Grocery / Khata store.
 */
@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "notes", length = 255)
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDate createdAt;

    @Column(name = "user_id", length = 100)
    private String userId;

    public Customer() {
        this.createdAt = LocalDate.now();
    }

    public Customer(Integer id, String name, String phone, String address, String notes) {
        this(id, name, phone, address, notes, null);
    }

    public Customer(Integer id, String name, String phone, String address, String notes, String userId) {
        this.id = id;
        this.name = name != null ? name.trim() : "";
        this.phone = phone != null ? phone.trim() : "";
        this.address = address != null ? address.trim() : "";
        this.notes = notes != null ? notes.trim() : "";
        this.createdAt = LocalDate.now();
        this.userId = userId;
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
        this.name = name != null ? name.trim() : "";
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone != null ? phone.trim() : "";
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address != null ? address.trim() : "";
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes != null ? notes.trim() : "";
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt != null ? createdAt : LocalDate.now();
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
        if (!(o instanceof Customer customer)) return false;
        return Objects.equals(id, customer.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
