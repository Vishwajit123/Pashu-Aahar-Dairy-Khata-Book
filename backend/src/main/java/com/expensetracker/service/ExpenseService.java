package com.expensetracker.service;

import com.expensetracker.dto.*;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.CustomerPayment;
import com.expensetracker.model.ExpenseData;
import com.expensetracker.repository.CustomerPaymentRepository;
import com.expensetracker.security.SecurityUtils;
import com.expensetracker.storage.ExpenseStorage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.stream.Collectors;

/**
 * Core business service managing Expense records with thread-safety,
 * BigDecimal financial precision, and multi-tenant user isolation.
 */
@Service
public class ExpenseService {

    private static final Logger logger = LoggerFactory.getLogger(ExpenseService.class);

    private final ExpenseStorage expenseStorage;
    private final CustomerPaymentRepository customerPaymentRepository;
    private final List<ExpenseData> expenseList = new ArrayList<>();
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private int nextId = 1;

    public ExpenseService(ExpenseStorage expenseStorage, CustomerPaymentRepository customerPaymentRepository) {
        this.expenseStorage = expenseStorage;
        this.customerPaymentRepository = customerPaymentRepository;
        loadInitialData();
        backfillHistoricalPaymentsIfEmpty();
    }

    private void loadInitialData() {
        rwLock.writeLock().lock();
        try {
            List<ExpenseData> loaded = expenseStorage.loadExpenses();
            expenseList.clear();
            expenseList.addAll(loaded);

            for (ExpenseData expense : expenseList) {
                if (expense.getId() != null && expense.getId() >= nextId) {
                    nextId = expense.getId() + 1;
                }
            }
            logger.info("Loaded {} expenses into memory. nextId is {}", expenseList.size(), nextId);
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    private void backfillHistoricalPaymentsIfEmpty() {
        try {
            if (customerPaymentRepository.count() == 0) {
                logger.info("Customer payment history is empty. Checking for existing customer sales with paid amounts...");
                int backfilledCount = 0;
                for (ExpenseData exp : expenseList) {
                    if (exp.getCustomerId() != null && exp.getPaidAmount() != null && exp.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
                        CustomerPayment cp = new CustomerPayment(
                                exp.getCustomerId(),
                                exp.getCustomerName(),
                                exp.getId(),
                                exp.getExpenseName(),
                                exp.getPaidAmount(),
                                exp.getModeOfPayment() != null ? exp.getModeOfPayment() : "Cash",
                                exp.getExpenseDate() != null ? exp.getExpenseDate() : LocalDate.now(),
                                "Initial payment recorded on bill #" + exp.getId(),
                                exp.getUserId()
                        );
                        customerPaymentRepository.save(cp);
                        backfilledCount++;
                    }
                }
                logger.info("Backfilled {} historical customer payment records.", backfilledCount);
            }
        } catch (Exception ex) {
            logger.warn("Could not run payment backfill: {}", ex.getMessage());
        }
    }

    public String resolveEffectiveUserId(String userId) {
        if (userId != null && !userId.trim().isEmpty()) {
            return userId.trim();
        }
        String current = SecurityUtils.getCurrentUserId();
        return (current != null && !current.trim().isEmpty()) ? current.trim() : "guest";
    }

    private boolean isUserMatch(String recordUserId, String effectiveUserId) {
        if (effectiveUserId == null || "guest".equalsIgnoreCase(effectiveUserId)) {
            return recordUserId == null || recordUserId.trim().isEmpty() || "guest".equalsIgnoreCase(recordUserId);
        }
        return Objects.equals(recordUserId, effectiveUserId);
    }

    public List<ExpenseData> getAllExpenses() {
        return getAllExpenses(SecurityUtils.getCurrentUserId());
    }

    public List<ExpenseData> getAllExpenses(String userId) {
        String effectiveUserId = resolveEffectiveUserId(userId);

        rwLock.readLock().lock();
        try {
            return expenseList.stream()
                    .filter(e -> isUserMatch(e.getUserId(), effectiveUserId))
                    .collect(Collectors.toList());
        } finally {
            rwLock.readLock().unlock();
        }
    }

    public ExpenseData getExpenseById(int id) {
        return getExpenseById(id, SecurityUtils.getCurrentUserId());
    }

    public ExpenseData getExpenseById(int id, String userId) {
        String effectiveUserId = resolveEffectiveUserId(userId);
        rwLock.readLock().lock();
        try {
            return expenseList.stream()
                    .filter(e -> e.getId() != null && e.getId() == id && isUserMatch(e.getUserId(), effectiveUserId))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Expense with ID " + id + " was not found."));
        } finally {
            rwLock.readLock().unlock();
        }
    }

    public ExpenseData addExpense(ExpenseRequest request) {
        return addExpense(request, SecurityUtils.getCurrentUserId());
    }

    public ExpenseData addExpense(ExpenseRequest request, String userId) {
        String effectiveUserId = resolveEffectiveUserId(userId);
        rwLock.writeLock().lock();
        try {
            ExpenseData expense = new ExpenseData(
                    nextId++,
                    request.getExpenseName(),
                    request.getDescription(),
                    request.getAmount(),
                    request.getExpenseDate(),
                    request.getCategory(),
                    request.getModeOfPayment(),
                    request.getCustomerId(),
                    request.getCustomerName(),
                    request.getCustomerPhone(),
                    request.getPaymentStatus(),
                    request.getPaidAmount(),
                    effectiveUserId
            );

            expenseStorage.saveExpense(expense);
            expenseList.add(expense);
            logger.info("Added expense ID {} for user {}: {}", expense.getId(), effectiveUserId, expense.getExpenseName());

            if (expense.getCustomerId() != null && expense.getPaidAmount() != null &&
                    expense.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
                try {
                    CustomerPayment cp = new CustomerPayment(
                            expense.getCustomerId(),
                            expense.getCustomerName(),
                            expense.getId(),
                            expense.getExpenseName(),
                            expense.getPaidAmount(),
                            expense.getModeOfPayment() != null ? expense.getModeOfPayment() : "Cash",
                            expense.getExpenseDate() != null ? expense.getExpenseDate() : LocalDate.now(),
                            "Advance / down-payment on sale generation",
                            effectiveUserId
                    );
                    customerPaymentRepository.save(cp);
                } catch (Exception ex) {
                    logger.warn("Could not log CustomerPayment on sale creation: {}", ex.getMessage());
                }
            }

            return expense;
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    public ExpenseData updateExpense(int id, ExpenseRequest request) {
        return updateExpense(id, request, SecurityUtils.getCurrentUserId());
    }

    public ExpenseData updateExpense(int id, ExpenseRequest request, String userId) {
        String effectiveUserId = resolveEffectiveUserId(userId);
        rwLock.writeLock().lock();
        try {
            ExpenseData existing = expenseList.stream()
                    .filter(e -> e.getId() != null && e.getId() == id && isUserMatch(e.getUserId(), effectiveUserId))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Cannot update: Transaction with ID " + id + " was not found."));

            existing.setExpenseName(request.getExpenseName());
            existing.setDescription(request.getDescription());
            existing.setAmount(request.getAmount());
            existing.setExpenseDate(request.getExpenseDate());
            existing.setCategory(request.getCategory());
            existing.setModeOfPayment(request.getModeOfPayment());
            existing.setCustomerId(request.getCustomerId());
            existing.setCustomerName(request.getCustomerName());
            existing.setCustomerPhone(request.getCustomerPhone());

            if (request.getPaidAmount() != null) {
                existing.setPaidAmount(request.getPaidAmount());
            } else if (request.getPaymentStatus() != null) {
                existing.setPaymentStatus(request.getPaymentStatus());
                if ("UNPAID".equalsIgnoreCase(request.getPaymentStatus())) {
                    existing.setPaidAmount(BigDecimal.ZERO);
                } else if ("PAID".equalsIgnoreCase(request.getPaymentStatus())) {
                    existing.setPaidAmount(existing.getAmount());
                }
            }

            expenseStorage.saveExpense(existing);
            logger.info("Updated transaction ID: {} for user: {}", id, effectiveUserId);
            return existing;
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    public ExpenseData updatePaymentStatus(int id, String status) {
        return updatePaymentStatus(id, status, null, SecurityUtils.getCurrentUserId());
    }

    public ExpenseData updatePaymentStatus(int id, String status, BigDecimal paidAmount) {
        return updatePaymentStatus(id, status, paidAmount, SecurityUtils.getCurrentUserId());
    }

    public ExpenseData updatePaymentStatus(int id, String status, BigDecimal paidAmount, String userId) {
        String effectiveUserId = resolveEffectiveUserId(userId);
        rwLock.writeLock().lock();
        try {
            ExpenseData existing = expenseList.stream()
                    .filter(e -> e.getId() != null && e.getId() == id && isUserMatch(e.getUserId(), effectiveUserId))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Cannot update: Transaction with ID " + id + " was not found."));

            if (paidAmount != null) {
                existing.setPaidAmount(paidAmount);
            } else {
                String newStatus = (status != null && status.equalsIgnoreCase("UNPAID")) ? "UNPAID" : "PAID";
                existing.setPaymentStatus(newStatus);
                if ("UNPAID".equalsIgnoreCase(newStatus)) {
                    existing.setPaidAmount(BigDecimal.ZERO);
                } else {
                    existing.setPaidAmount(existing.getAmount());
                }
            }
            expenseStorage.saveExpense(existing);
            return existing;
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    public ExpenseData recordExpensePayment(int id, PaymentRequest request) {
        return recordExpensePayment(id, request, SecurityUtils.getCurrentUserId());
    }

    public ExpenseData recordExpensePayment(int id, PaymentRequest request, String userId) {
        String effectiveUserId = resolveEffectiveUserId(userId);
        rwLock.writeLock().lock();
        try {
            ExpenseData existing = expenseList.stream()
                    .filter(e -> e.getId() != null && e.getId() == id && isUserMatch(e.getUserId(), effectiveUserId))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Cannot record payment: Transaction with ID " + id + " was not found."));

            if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Payment amount must be greater than zero.");
            }

            BigDecimal currentPaid = existing.getPaidAmount();
            BigDecimal newPaid = currentPaid.add(request.getAmount());
            if (newPaid.compareTo(existing.getAmount()) > 0) {
                newPaid = existing.getAmount();
            }
            existing.setPaidAmount(newPaid);
            if (request.getPaymentMode() != null && !request.getPaymentMode().trim().isEmpty()) {
                existing.setModeOfPayment(request.getPaymentMode().trim());
            }
            expenseStorage.saveExpense(existing);

            if (existing.getCustomerId() != null) {
                try {
                    CustomerPayment cp = new CustomerPayment(
                            existing.getCustomerId(),
                            existing.getCustomerName(),
                            existing.getId(),
                            existing.getExpenseName(),
                            request.getAmount(),
                            request.getPaymentMode() != null && !request.getPaymentMode().trim().isEmpty() ? request.getPaymentMode().trim() : "Cash",
                            request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now(),
                            request.getNotes() != null && !request.getNotes().trim().isEmpty() ? request.getNotes().trim() : "Direct payment on bill #" + existing.getId(),
                            effectiveUserId
                    );
                    customerPaymentRepository.save(cp);
                } catch (Exception ex) {
                    logger.warn("Could not log CustomerPayment on bill payment: {}", ex.getMessage());
                }
            }

            return existing;
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    public void saveExpenseEntity(ExpenseData expense) {
        rwLock.writeLock().lock();
        try {
            expenseStorage.saveExpense(expense);
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    public void deleteExpense(int id) {
        deleteExpense(id, SecurityUtils.getCurrentUserId());
    }

    public void deleteExpense(int id, String userId) {
        String effectiveUserId = resolveEffectiveUserId(userId);
        rwLock.writeLock().lock();
        try {
            ExpenseData existing = expenseList.stream()
                    .filter(e -> e.getId() != null && e.getId() == id && isUserMatch(e.getUserId(), effectiveUserId))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Cannot delete: Expense with ID " + id + " was not found."));

            expenseList.remove(existing);
            expenseStorage.deleteExpense(id);
            expenseStorage.saveAllExpenses(expenseList);
            logger.info("Deleted expense ID: {} for user: {}", id, effectiveUserId);
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    public List<ExpenseData> searchExpenses(String query) {
        return searchExpenses(query, SecurityUtils.getCurrentUserId());
    }

    public List<ExpenseData> searchExpenses(String query, String userId) {
        List<ExpenseData> userExpenses = getAllExpenses(userId);
        if (query == null || query.trim().isEmpty()) {
            return userExpenses;
        }
        String cleanQuery = query.trim().toLowerCase();
        return userExpenses.stream()
                .filter(e -> (e.getId() != null && String.valueOf(e.getId()).equals(cleanQuery)) ||
                        (e.getExpenseName() != null && e.getExpenseName().toLowerCase().contains(cleanQuery)) ||
                        (e.getDescription() != null && e.getDescription().toLowerCase().contains(cleanQuery)) ||
                        (e.getCustomerName() != null && e.getCustomerName().toLowerCase().contains(cleanQuery)))
                .collect(Collectors.toList());
    }

    public List<ExpenseData> getExpensesByCategory(String category) {
        return getExpensesByCategory(category, SecurityUtils.getCurrentUserId());
    }

    public List<ExpenseData> getExpensesByCategory(String category, String userId) {
        List<ExpenseData> userExpenses = getAllExpenses(userId);
        if (category == null || category.trim().isEmpty()) {
            return userExpenses;
        }
        String target = category.trim();
        return userExpenses.stream()
                .filter(e -> e.getCategory() != null && e.getCategory().equalsIgnoreCase(target))
                .collect(Collectors.toList());
    }

    public List<ExpenseData> getExpensesByDate(LocalDate date) {
        return getExpensesByDate(date, SecurityUtils.getCurrentUserId());
    }

    public List<ExpenseData> getExpensesByDate(LocalDate date, String userId) {
        List<ExpenseData> userExpenses = getAllExpenses(userId);
        if (date == null) {
            return userExpenses;
        }
        return userExpenses.stream()
                .filter(e -> e.getExpenseDate() != null && e.getExpenseDate().equals(date))
                .collect(Collectors.toList());
    }

    public List<ExpenseData> getExpensesByPaymentMode(String mode) {
        return getExpensesByPaymentMode(mode, SecurityUtils.getCurrentUserId());
    }

    public List<ExpenseData> getExpensesByPaymentMode(String mode, String userId) {
        List<ExpenseData> userExpenses = getAllExpenses(userId);
        if (mode == null || mode.trim().isEmpty()) {
            return userExpenses;
        }
        String target = mode.trim();
        return userExpenses.stream()
                .filter(e -> e.getModeOfPayment() != null && e.getModeOfPayment().equalsIgnoreCase(target))
                .collect(Collectors.toList());
    }

    public List<ExpenseData> filterExpenses(String search, String category, String mode,
                                           LocalDate startDate, LocalDate endDate,
                                           String sortBy, String sortDir) {
        return filterExpenses(search, category, mode, null, null, startDate, endDate, sortBy, sortDir, SecurityUtils.getCurrentUserId());
    }

    public List<ExpenseData> filterExpenses(String search, String category, String mode,
                                           String paymentStatus, Integer customerId,
                                           LocalDate startDate, LocalDate endDate,
                                           String sortBy, String sortDir) {
        return filterExpenses(search, category, mode, paymentStatus, customerId, startDate, endDate, sortBy, sortDir, SecurityUtils.getCurrentUserId());
    }

    public List<ExpenseData> filterExpenses(String search, String category, String mode,
                                           String paymentStatus, Integer customerId,
                                           LocalDate startDate, LocalDate endDate,
                                           String sortBy, String sortDir, String userId) {
        String effectiveUserId = resolveEffectiveUserId(userId);

        rwLock.readLock().lock();
        try {
            return expenseList.stream()
                    .filter(e -> isUserMatch(e.getUserId(), effectiveUserId))
                    .filter(e -> {
                        if (search != null && !search.trim().isEmpty()) {
                            String q = search.trim().toLowerCase();
                            boolean idMatch = e.getId() != null && String.valueOf(e.getId()).equals(q);
                            boolean nameMatch = e.getExpenseName() != null && e.getExpenseName().toLowerCase().contains(q);
                            boolean descMatch = e.getDescription() != null && e.getDescription().toLowerCase().contains(q);
                            boolean customerMatch = (e.getCustomerName() != null && e.getCustomerName().toLowerCase().contains(q)) ||
                                    (e.getCustomerPhone() != null && e.getCustomerPhone().contains(q));
                            if (!idMatch && !nameMatch && !descMatch && !customerMatch) {
                                return false;
                            }
                        }
                        if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("all")) {
                            if (e.getCategory() == null || !e.getCategory().equalsIgnoreCase(category.trim())) {
                                return false;
                            }
                        }
                        if (mode != null && !mode.trim().isEmpty() && !mode.equalsIgnoreCase("all")) {
                            if (e.getModeOfPayment() == null || !e.getModeOfPayment().equalsIgnoreCase(mode.trim())) {
                                return false;
                            }
                        }
                        if (paymentStatus != null && !paymentStatus.trim().isEmpty() && !paymentStatus.equalsIgnoreCase("all")) {
                            if (e.getPaymentStatus() == null || !e.getPaymentStatus().equalsIgnoreCase(paymentStatus.trim())) {
                                return false;
                            }
                        }
                        if (customerId != null) {
                            if (e.getCustomerId() == null || !e.getCustomerId().equals(customerId)) {
                                return false;
                            }
                        }
                        if (startDate != null && e.getExpenseDate() != null && e.getExpenseDate().isBefore(startDate)) {
                            return false;
                        }
                        if (endDate != null && e.getExpenseDate() != null && e.getExpenseDate().isAfter(endDate)) {
                            return false;
                        }
                        return true;
                    })
                    .sorted((e1, e2) -> {
                        int comparison = 0;
                        String sortField = sortBy != null ? sortBy.toLowerCase() : "date";
                        switch (sortField) {
                            case "amount":
                                comparison = (e1.getAmount() != null && e2.getAmount() != null)
                                        ? e1.getAmount().compareTo(e2.getAmount()) : 0;
                                break;
                            case "name":
                                comparison = (e1.getExpenseName() != null && e2.getExpenseName() != null)
                                        ? e1.getExpenseName().compareToIgnoreCase(e2.getExpenseName()) : 0;
                                break;
                            case "category":
                                comparison = (e1.getCategory() != null && e2.getCategory() != null)
                                        ? e1.getCategory().compareToIgnoreCase(e2.getCategory()) : 0;
                                break;
                            case "customer":
                                String c1 = e1.getCustomerName() != null ? e1.getCustomerName() : "";
                                String c2 = e2.getCustomerName() != null ? e2.getCustomerName() : "";
                                comparison = c1.compareToIgnoreCase(c2);
                                break;
                            case "status":
                                String s1 = e1.getPaymentStatus() != null ? e1.getPaymentStatus() : "";
                                String s2 = e2.getPaymentStatus() != null ? e2.getPaymentStatus() : "";
                                comparison = s1.compareToIgnoreCase(s2);
                                break;
                            case "id":
                                int id1 = e1.getId() != null ? e1.getId() : 0;
                                int id2 = e2.getId() != null ? e2.getId() : 0;
                                comparison = Integer.compare(id1, id2);
                                break;
                            case "date":
                            default:
                                if (e1.getExpenseDate() != null && e2.getExpenseDate() != null) {
                                    comparison = e1.getExpenseDate().compareTo(e2.getExpenseDate());
                                } else {
                                    comparison = 0;
                                }
                                break;
                        }
                        boolean isDesc = sortDir != null && sortDir.equalsIgnoreCase("desc");
                        return isDesc ? -comparison : comparison;
                    })
                    .collect(Collectors.toList());
        } finally {
            rwLock.readLock().unlock();
        }
    }

    public SummaryResponse getSummary() {
        return getSummary(SecurityUtils.getCurrentUserId());
    }

    public SummaryResponse getSummary(String userId) {
        List<ExpenseData> userExpenses = getAllExpenses(userId);
        if (userExpenses.isEmpty()) {
            return new SummaryResponse(
                    BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                    BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                    BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                    0,
                    BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                    null,
                    null
            );
        }

        BigDecimal total = BigDecimal.ZERO;
        BigDecimal paid = BigDecimal.ZERO;
        BigDecimal unpaid = BigDecimal.ZERO;
        ExpenseData highest = userExpenses.get(0);
        ExpenseData lowest = userExpenses.get(0);

        for (ExpenseData e : userExpenses) {
            total = total.add(e.getAmount());
            paid = paid.add(e.getPaidAmount());
            unpaid = unpaid.add(e.getDueAmount());
            if (e.getAmount().compareTo(highest.getAmount()) > 0) {
                highest = e;
            }
            if (e.getAmount().compareTo(lowest.getAmount()) < 0) {
                lowest = e;
            }
        }

        BigDecimal avg = total.divide(BigDecimal.valueOf(userExpenses.size()), 2, RoundingMode.HALF_UP);
        return new SummaryResponse(total, paid, unpaid, userExpenses.size(), avg, highest, lowest);
    }

    public List<CategorySummaryResponse> getCategorySummary() {
        return getCategorySummary(SecurityUtils.getCurrentUserId());
    }

    public List<CategorySummaryResponse> getCategorySummary(String userId) {
        List<ExpenseData> userExpenses = getAllExpenses(userId);
        if (userExpenses.isEmpty()) {
            return Collections.emptyList();
        }

        BigDecimal grandTotal = userExpenses.stream()
                .map(ExpenseData::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, List<ExpenseData>> grouped = userExpenses.stream()
                .collect(Collectors.groupingBy(e -> e.getCategory() != null ? e.getCategory() : "Other"));

        List<CategorySummaryResponse> summaries = new ArrayList<>();
        for (Map.Entry<String, List<ExpenseData>> entry : grouped.entrySet()) {
            BigDecimal categoryTotal = entry.getValue().stream()
                    .map(ExpenseData::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            double percentage = grandTotal.compareTo(BigDecimal.ZERO) > 0 ?
                    categoryTotal.multiply(BigDecimal.valueOf(100))
                            .divide(grandTotal, 2, RoundingMode.HALF_UP)
                            .doubleValue() : 0.0;

            summaries.add(new CategorySummaryResponse(
                    entry.getKey(),
                    categoryTotal,
                    entry.getValue().size(),
                    percentage
            ));
        }

        summaries.sort((a, b) -> b.getTotalSpent().compareTo(a.getTotalSpent()));
        return summaries;
    }

    public MonthlySummaryResponse getMonthlySummary(YearMonth yearMonth) {
        return getMonthlySummary(yearMonth, SecurityUtils.getCurrentUserId());
    }

    public MonthlySummaryResponse getMonthlySummary(YearMonth yearMonth, String userId) {
        List<ExpenseData> userExpenses = getAllExpenses(userId);
        List<ExpenseData> filtered = userExpenses.stream()
                .filter(e -> e.getExpenseDate() != null && YearMonth.from(e.getExpenseDate()).equals(yearMonth))
                .sorted(Comparator.comparing(ExpenseData::getExpenseDate).reversed())
                .collect(Collectors.toList());

        BigDecimal total = filtered.stream()
                .map(ExpenseData::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new MonthlySummaryResponse(yearMonth.toString(), total, filtered.size(), filtered);
    }

    public List<MonthlySummaryResponse> getAllMonthlySummaries() {
        return getAllMonthlySummaries(SecurityUtils.getCurrentUserId());
    }

    public List<MonthlySummaryResponse> getAllMonthlySummaries(String userId) {
        List<ExpenseData> userExpenses = getAllExpenses(userId);
        Map<YearMonth, List<ExpenseData>> grouped = new TreeMap<>();
        for (ExpenseData e : userExpenses) {
            if (e.getExpenseDate() != null) {
                YearMonth ym = YearMonth.from(e.getExpenseDate());
                grouped.computeIfAbsent(ym, k -> new ArrayList<>()).add(e);
            }
        }

        List<MonthlySummaryResponse> results = new ArrayList<>();
        for (Map.Entry<YearMonth, List<ExpenseData>> entry : grouped.entrySet()) {
            BigDecimal total = entry.getValue().stream()
                    .map(ExpenseData::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            results.add(new MonthlySummaryResponse(entry.getKey().toString(), total, entry.getValue().size(), entry.getValue()));
        }
        return results;
    }

    public List<PaymentModeSummaryResponse> getPaymentModeSummary() {
        return getPaymentModeSummary(SecurityUtils.getCurrentUserId());
    }

    public List<PaymentModeSummaryResponse> getPaymentModeSummary(String userId) {
        List<ExpenseData> userExpenses = getAllExpenses(userId);
        if (userExpenses.isEmpty()) {
            return Collections.emptyList();
        }

        BigDecimal grandTotal = userExpenses.stream()
                .map(ExpenseData::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, List<ExpenseData>> grouped = userExpenses.stream()
                .collect(Collectors.groupingBy(e -> e.getModeOfPayment() != null ? e.getModeOfPayment() : "Other"));

        List<PaymentModeSummaryResponse> summaries = new ArrayList<>();
        for (Map.Entry<String, List<ExpenseData>> entry : grouped.entrySet()) {
            BigDecimal modeTotal = entry.getValue().stream()
                    .map(ExpenseData::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            double percentage = grandTotal.compareTo(BigDecimal.ZERO) > 0 ?
                    modeTotal.multiply(BigDecimal.valueOf(100))
                            .divide(grandTotal, 2, RoundingMode.HALF_UP)
                            .doubleValue() : 0.0;

            summaries.add(new PaymentModeSummaryResponse(
                    entry.getKey(),
                    modeTotal,
                    entry.getValue().size(),
                    percentage
            ));
        }

        summaries.sort((a, b) -> b.getTotalSpent().compareTo(a.getTotalSpent()));
        return summaries;
    }

    public ExpenseData getHighestExpense() {
        return getHighestExpense(SecurityUtils.getCurrentUserId());
    }

    public ExpenseData getHighestExpense(String userId) {
        List<ExpenseData> userExpenses = getAllExpenses(userId);
        return userExpenses.stream()
                .max(Comparator.comparing(ExpenseData::getAmount))
                .orElse(null);
    }

    public ExpenseData getLowestExpense() {
        return getLowestExpense(SecurityUtils.getCurrentUserId());
    }

    public ExpenseData getLowestExpense(String userId) {
        List<ExpenseData> userExpenses = getAllExpenses(userId);
        return userExpenses.stream()
                .min(Comparator.comparing(ExpenseData::getAmount))
                .orElse(null);
    }

    public String exportExpensesToCsv() {
        return exportExpensesToCsv(SecurityUtils.getCurrentUserId());
    }

    public String exportExpensesToCsv(String userId) {
        List<ExpenseData> userExpenses = getAllExpenses(userId);
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Expense Name,Description,Amount,Date,Category,Payment Mode\n");
        for (ExpenseData e : userExpenses) {
            sb.append(e.getId()).append(",")
                    .append(escapeCsv(e.getExpenseName())).append(",")
                    .append(escapeCsv(e.getDescription())).append(",")
                    .append(e.getAmount().toPlainString()).append(",")
                    .append(e.getExpenseDate()).append(",")
                    .append(escapeCsv(e.getCategory())).append(",")
                    .append(escapeCsv(e.getModeOfPayment())).append("\n");
        }
        return sb.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "\"\"";
        String clean = value.replace("\"", "\"\"");
        if (clean.contains(",") || clean.contains("\n") || clean.contains("\r") || clean.contains("\"")) {
            return "\"" + clean + "\"";
        }
        return clean;
    }
}
