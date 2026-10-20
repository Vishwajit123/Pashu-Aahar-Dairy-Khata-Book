package com.expensetracker.controller;

import com.expensetracker.dto.ExpenseRequest;
import com.expensetracker.dto.PagedResponse;
import com.expensetracker.dto.PaymentRequest;
import com.expensetracker.model.ExpenseData;
import com.expensetracker.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    /**
     * Get expenses with optional filtering, sorting, and pagination.
     */
    @GetMapping
    public ResponseEntity<?> getExpenses(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String mode,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) Integer customerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "date") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        List<ExpenseData> expenses = expenseService.filterExpenses(search, category, mode, paymentStatus, customerId, startDate, endDate, sortBy, sortDir);

        // If pagination parameters are provided
        if (page != null && size != null && size > 0) {
            int total = expenses.size();
            int totalPages = (int) Math.ceil((double) total / size);
            int fromIndex = Math.min(page * size, total);
            int toIndex = Math.min(fromIndex + size, total);
            List<ExpenseData> pagedList = expenses.subList(fromIndex, toIndex);

            return ResponseEntity.ok(new PagedResponse<>(pagedList, page, size, total, totalPages));
        }

        return ResponseEntity.ok(expenses);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ExpenseData> updatePaymentStatus(
            @PathVariable int id,
            @RequestParam(required = false, defaultValue = "PAID") String status,
            @RequestParam(required = false) BigDecimal paidAmount) {
        ExpenseData updated = expenseService.updatePaymentStatus(id, status, paidAmount);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<ExpenseData> recordExpensePayment(
            @PathVariable int id,
            @Valid @RequestBody PaymentRequest request) {
        ExpenseData updated = expenseService.recordExpensePayment(id, request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseData> getExpenseById(@PathVariable int id) {
        return ResponseEntity.ok(expenseService.getExpenseById(id));
    }

    @PostMapping
    public ResponseEntity<ExpenseData> createExpense(@Valid @RequestBody ExpenseRequest request) {
        ExpenseData created = expenseService.addExpense(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseData> updateExpense(@PathVariable int id, @Valid @RequestBody ExpenseRequest request) {
        ExpenseData updated = expenseService.updateExpense(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable int id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<ExpenseData>> searchExpenses(@RequestParam(required = false, defaultValue = "") String q) {
        return ResponseEntity.ok(expenseService.searchExpenses(q));
    }

    @GetMapping("/category")
    public ResponseEntity<List<ExpenseData>> getByCategoryParam(@RequestParam String category) {
        return ResponseEntity.ok(expenseService.getExpensesByCategory(category));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ExpenseData>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(expenseService.getExpensesByCategory(category));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<ExpenseData>> getByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(expenseService.getExpensesByDate(date));
    }

    @GetMapping("/payment-mode")
    public ResponseEntity<List<ExpenseData>> getByPaymentModeParam(@RequestParam String mode) {
        return ResponseEntity.ok(expenseService.getExpensesByPaymentMode(mode));
    }

    @GetMapping("/payment-mode/{mode}")
    public ResponseEntity<List<ExpenseData>> getByPaymentMode(@PathVariable String mode) {
        return ResponseEntity.ok(expenseService.getExpensesByPaymentMode(mode));
    }
}
