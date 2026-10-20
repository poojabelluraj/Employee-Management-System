package com.example.employee_management;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    List<Employee> findByDepartment(String department);

    List<Employee> findByNameContainingIgnoreCase(String name);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    Optional<Employee> findByEmail(String email);
    
    List<Employee> findBySalaryGreaterThan(double salary);

    List<Employee> findBySalaryLessThan(double salary);
    
    long countByDepartment(String department);
    
    
}