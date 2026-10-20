package com.expensetracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CustomerRequest {

    @NotBlank(message = "Customer name is required.")
    @Size(max = 100, message = "Customer name cannot exceed 100 characters.")
    private String name;

    @Size(max = 20, message = "Phone number cannot exceed 20 characters.")
    private String phone;

    @Size(max = 255, message = "Address cannot exceed 255 characters.")
    private String address;

    @Size(max = 255, message = "Notes cannot exceed 255 characters.")
    private String notes;

    public CustomerRequest() {
    }

    public CustomerRequest(String name, String phone, String address, String notes) {
        this.name = name;
        this.phone = phone;
        this.address = address;
        this.notes = notes;
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
}
