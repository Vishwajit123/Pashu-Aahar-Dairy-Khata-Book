package com.expensetracker.controller;

import com.expensetracker.dto.CategorySummaryResponse;
import com.expensetracker.dto.MonthlySummaryResponse;
import com.expensetracker.dto.PaymentModeSummaryResponse;
import com.expensetracker.dto.SummaryResponse;
import com.expensetracker.model.ExpenseData;
import com.expensetracker.service.ExpenseService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ExpenseService expenseService;

    public ReportController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping("/summary")
    public ResponseEntity<SummaryResponse> getSummary() {
        return ResponseEntity.ok(expenseService.getSummary());
    }

    @GetMapping("/category")
    public ResponseEntity<List<CategorySummaryResponse>> getCategorySummary() {
        return ResponseEntity.ok(expenseService.getCategorySummary());
    }

    @GetMapping("/monthly")
    public ResponseEntity<MonthlySummaryResponse> getMonthlySummary(
            @RequestParam(required = false) String yearMonth) {

        YearMonth ym;
        if (yearMonth != null && !yearMonth.trim().isEmpty()) {
            ym = YearMonth.parse(yearMonth.trim());
        } else {
            ym = YearMonth.now();
        }

        return ResponseEntity.ok(expenseService.getMonthlySummary(ym));
    }

    @GetMapping("/monthly-trend")
    public ResponseEntity<List<MonthlySummaryResponse>> getMonthlyTrend() {
        return ResponseEntity.ok(expenseService.getAllMonthlySummaries());
    }

    @GetMapping("/payment-mode")
    public ResponseEntity<List<PaymentModeSummaryResponse>> getPaymentModeSummary() {
        return ResponseEntity.ok(expenseService.getPaymentModeSummary());
    }

    @GetMapping("/highest")
    public ResponseEntity<ExpenseData> getHighestExpense() {
        return ResponseEntity.ok(expenseService.getHighestExpense());
    }

    @GetMapping("/lowest")
    public ResponseEntity<ExpenseData> getLowestExpense() {
        return ResponseEntity.ok(expenseService.getLowestExpense());
    }

    @GetMapping("/export-csv")
    public ResponseEntity<byte[]> exportCsv() {
        String csv = expenseService.exportExpensesToCsv();
        byte[] csvBytes = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        String filename = "expenses-" + LocalDate.now().format(DateTimeFormatter.ISO_DATE) + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvBytes);
    }
}
