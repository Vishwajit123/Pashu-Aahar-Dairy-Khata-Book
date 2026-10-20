package com.expensetracker.controller;

import com.expensetracker.dto.CustomerRequest;
import com.expensetracker.dto.CustomerSummaryResponse;
import com.expensetracker.dto.PaymentRequest;
import com.expensetracker.model.Customer;
import com.expensetracker.model.CustomerPayment;
import com.expensetracker.model.ExpenseData;
import com.expensetracker.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public ResponseEntity<List<CustomerSummaryResponse>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerSummaryResponse> getCustomerById(@PathVariable int id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PostMapping
    public ResponseEntity<Customer> createCustomer(@Valid @RequestBody CustomerRequest request) {
        Customer created = customerService.createCustomer(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable int id, @Valid @RequestBody CustomerRequest request) {
        Customer updated = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable int id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<ExpenseData>> getCustomerTransactions(@PathVariable int id) {
        return ResponseEntity.ok(customerService.getCustomerTransactions(id));
    }

    @GetMapping("/payments")
    public ResponseEntity<List<CustomerPayment>> getAllCustomerPayments() {
        return ResponseEntity.ok(customerService.getAllCustomerPayments());
    }

    @GetMapping("/{id}/payments")
    public ResponseEntity<List<CustomerPayment>> getCustomerPayments(@PathVariable int id) {
        return ResponseEntity.ok(customerService.getCustomerPayments(id));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<CustomerSummaryResponse> recordCustomerPayment(
            @PathVariable int id,
            @Valid @RequestBody PaymentRequest request) {
        CustomerSummaryResponse updated = customerService.recordCustomerPayment(id, request);
        return ResponseEntity.ok(updated);
    }
}
