package com.expensetracker.repository;

import com.expensetracker.model.CustomerPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerPaymentRepository extends JpaRepository<CustomerPayment, Integer> {

    List<CustomerPayment> findByCustomerIdOrderByPaymentDateDescIdDesc(Integer customerId);

    List<CustomerPayment> findByUserIdAndCustomerIdOrderByPaymentDateDescIdDesc(String userId, Integer customerId);

    List<CustomerPayment> findByUserIdOrderByPaymentDateDescIdDesc(String userId);

    List<CustomerPayment> findByExpenseId(Integer expenseId);

    List<CustomerPayment> findAllByOrderByPaymentDateDescIdDesc();
}
