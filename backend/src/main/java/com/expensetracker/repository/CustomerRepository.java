package com.expensetracker.repository;

import com.expensetracker.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    List<Customer> findByUserId(String userId);

    List<Customer> findByUserIdOrUserIdIsNull(String userId);

    List<Customer> findByNameContainingIgnoreCase(String name);

    List<Customer> findByPhoneContaining(String phone);
}
