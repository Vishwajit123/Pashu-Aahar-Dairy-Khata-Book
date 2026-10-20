package com.expensetracker.service;

import com.expensetracker.dto.CustomerRequest;
import com.expensetracker.dto.CustomerSummaryResponse;
import com.expensetracker.dto.PaymentRequest;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.Customer;
import com.expensetracker.model.CustomerPayment;
import com.expensetracker.model.ExpenseData;
import com.expensetracker.repository.CustomerPaymentRepository;
import com.expensetracker.repository.CustomerRepository;
import com.expensetracker.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private static final Logger logger = LoggerFactory.getLogger(CustomerService.class);

    private final CustomerRepository customerRepository;
    private final CustomerPaymentRepository customerPaymentRepository;
    private final ExpenseService expenseService;

    public CustomerService(CustomerRepository customerRepository,
                           CustomerPaymentRepository customerPaymentRepository,
                           ExpenseService expenseService) {
        this.customerRepository = customerRepository;
        this.customerPaymentRepository = customerPaymentRepository;
        this.expenseService = expenseService;
    }

    private String resolveEffectiveUserId(String userId) {
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

    public List<CustomerSummaryResponse> getAllCustomers() {
        return getAllCustomers(SecurityUtils.getCurrentUserId());
    }

    public List<CustomerSummaryResponse> getAllCustomers(String userId) {
        String effectiveUserId = resolveEffectiveUserId(userId);

        List<Customer> customers;
        if ("guest".equalsIgnoreCase(effectiveUserId)) {
            customers = customerRepository.findByUserIdOrUserIdIsNull(effectiveUserId);
        } else {
            customers = customerRepository.findByUserId(effectiveUserId);
        }
        List<ExpenseData> userExpenses = expenseService.getAllExpenses(effectiveUserId);

        List<CustomerSummaryResponse> summaries = new ArrayList<>();
        for (Customer c : customers) {
            summaries.add(calculateSummary(c, userExpenses));
        }

        return summaries;
    }

    public CustomerSummaryResponse getCustomerById(int id) {
        return getCustomerById(id, SecurityUtils.getCurrentUserId());
    }

    public CustomerSummaryResponse getCustomerById(int id, String userId) {
        String effectiveUserId = resolveEffectiveUserId(userId);
        Customer customer = customerRepository.findById(id)
                .filter(c -> isUserMatch(c.getUserId(), effectiveUserId))
                .orElseThrow(() -> new ResourceNotFoundException("Customer with ID " + id + " not found."));

        List<ExpenseData> userExpenses = expenseService.getAllExpenses(effectiveUserId);
        return calculateSummary(customer, userExpenses);
    }

    public Customer createCustomer(CustomerRequest request) {
        return createCustomer(request, SecurityUtils.getCurrentUserId());
    }

    public Customer createCustomer(CustomerRequest request, String userId) {
        String effectiveUserId = resolveEffectiveUserId(userId);
        Customer customer = new Customer(
                null,
                request.getName(),
                request.getPhone(),
                request.getAddress(),
                request.getNotes(),
                effectiveUserId
        );
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(int id, CustomerRequest request) {
        return updateCustomer(id, request, SecurityUtils.getCurrentUserId());
    }

    public Customer updateCustomer(int id, CustomerRequest request, String userId) {
        String effectiveUserId = resolveEffectiveUserId(userId);
        Customer customer = customerRepository.findById(id)
                .filter(c -> isUserMatch(c.getUserId(), effectiveUserId))
                .orElseThrow(() -> new ResourceNotFoundException("Customer with ID " + id + " not found."));

        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setNotes(request.getNotes());

        return customerRepository.save(customer);
    }

    public void deleteCustomer(int id) {
        deleteCustomer(id, SecurityUtils.getCurrentUserId());
    }

    public void deleteCustomer(int id, String userId) {
        String effectiveUserId = resolveEffectiveUserId(userId);
        Customer customer = customerRepository.findById(id)
                .filter(c -> isUserMatch(c.getUserId(), effectiveUserId))
                .orElseThrow(() -> new ResourceNotFoundException("Customer with ID " + id + " not found."));

        customerRepository.delete(customer);
    }

    public List<ExpenseData> getCustomerTransactions(int customerId) {
        return getCustomerTransactions(customerId, SecurityUtils.getCurrentUserId());
    }

    public List<ExpenseData> getCustomerTransactions(int customerId, String userId) {
        String effectiveUserId = resolveEffectiveUserId(userId);
        return expenseService.getAllExpenses(effectiveUserId).stream()
                .filter(e -> e.getCustomerId() != null && e.getCustomerId().equals(customerId))
                .collect(Collectors.toList());
    }

    public CustomerSummaryResponse recordCustomerPayment(int customerId, PaymentRequest request) {
        return recordCustomerPayment(customerId, request, SecurityUtils.getCurrentUserId());
    }

    public CustomerSummaryResponse recordCustomerPayment(int customerId, PaymentRequest request, String userId) {
        String effectiveUserId = resolveEffectiveUserId(userId);
        Customer customer = customerRepository.findById(customerId)
                .filter(c -> isUserMatch(c.getUserId(), effectiveUserId))
                .orElseThrow(() -> new ResourceNotFoundException("Customer with ID " + customerId + " not found."));

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero.");
        }

        List<ExpenseData> pendingExpenses = expenseService.getAllExpenses(effectiveUserId).stream()
                .filter(e -> (e.getCustomerId() != null && e.getCustomerId().equals(customerId)) ||
                             (e.getCustomerName() != null && e.getCustomerName().equalsIgnoreCase(customer.getName())))
                .filter(e -> e.getDueAmount().compareTo(BigDecimal.ZERO) > 0)
                .sorted(Comparator.comparing(ExpenseData::getExpenseDate).thenComparing(ExpenseData::getId))
                .collect(Collectors.toList());

        BigDecimal remainingToAllocate = request.getAmount();
        List<String> settledBillNames = new ArrayList<>();
        Integer firstExpenseId = null;

        for (ExpenseData exp : pendingExpenses) {
            if (remainingToAllocate.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }
            if (firstExpenseId == null) {
                firstExpenseId = exp.getId();
            }
            BigDecimal due = exp.getDueAmount();
            BigDecimal toAllocate = remainingToAllocate.min(due);
            BigDecimal newPaid = exp.getPaidAmount().add(toAllocate);
            exp.setPaidAmount(newPaid);
            if (request.getPaymentMode() != null && !request.getPaymentMode().trim().isEmpty()) {
                exp.setModeOfPayment(request.getPaymentMode().trim());
            }
            expenseService.saveExpenseEntity(exp);
            remainingToAllocate = remainingToAllocate.subtract(toAllocate);
            settledBillNames.add(exp.getExpenseName());
        }

        String billRef = settledBillNames.isEmpty() ? "Khata Udhaar Settlement" : "Khata Settlement: " + String.join(", ", settledBillNames);
        CustomerPayment payment = new CustomerPayment(
                customer.getId(),
                customer.getName(),
                firstExpenseId,
                billRef,
                request.getAmount(),
                request.getPaymentMode(),
                request.getPaymentDate(),
                request.getNotes(),
                effectiveUserId
        );
        customerPaymentRepository.save(payment);

        return calculateSummary(customer, expenseService.getAllExpenses(effectiveUserId));
    }

    public List<CustomerPayment> getCustomerPayments(int customerId) {
        return getCustomerPayments(customerId, SecurityUtils.getCurrentUserId());
    }

    public List<CustomerPayment> getCustomerPayments(int customerId, String userId) {
        String effectiveUserId = resolveEffectiveUserId(userId);
        if ("guest".equalsIgnoreCase(effectiveUserId)) {
            return customerPaymentRepository.findByCustomerIdOrderByPaymentDateDescIdDesc(customerId);
        }
        return customerPaymentRepository.findByUserIdAndCustomerIdOrderByPaymentDateDescIdDesc(effectiveUserId, customerId);
    }

    public List<CustomerPayment> getAllCustomerPayments() {
        return getAllCustomerPayments(SecurityUtils.getCurrentUserId());
    }

    public List<CustomerPayment> getAllCustomerPayments(String userId) {
        String effectiveUserId = resolveEffectiveUserId(userId);
        if ("guest".equalsIgnoreCase(effectiveUserId)) {
            return customerPaymentRepository.findAllByOrderByPaymentDateDescIdDesc();
        }
        return customerPaymentRepository.findByUserIdOrderByPaymentDateDescIdDesc(effectiveUserId);
    }

    private CustomerSummaryResponse calculateSummary(Customer customer, List<ExpenseData> allExpenses) {
        List<ExpenseData> customerExpenses = allExpenses.stream()
                .filter(e -> (e.getCustomerId() != null && e.getCustomerId().equals(customer.getId())) ||
                             (e.getCustomerName() != null && e.getCustomerName().equalsIgnoreCase(customer.getName())))
                .collect(Collectors.toList());

        BigDecimal total = BigDecimal.ZERO;
        BigDecimal paid = BigDecimal.ZERO;
        BigDecimal unpaid = BigDecimal.ZERO;

        for (ExpenseData e : customerExpenses) {
            total = total.add(e.getAmount());
            paid = paid.add(e.getPaidAmount());
            unpaid = unpaid.add(e.getDueAmount());
        }

        return new CustomerSummaryResponse(
                customer.getId(),
                customer.getName(),
                customer.getPhone(),
                customer.getAddress(),
                customer.getNotes(),
                customer.getCreatedAt() != null ? customer.getCreatedAt() : LocalDate.now(),
                total,
                paid,
                unpaid,
                customerExpenses.size()
        );
    }
}
