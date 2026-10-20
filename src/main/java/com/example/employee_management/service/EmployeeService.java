package com.example.employee_management.service;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;

import com.example.employee_management.Employee;
import com.example.employee_management.EmployeeNotFoundException;
import com.example.employee_management.EmployeeRepository;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    // 1. Get all employees
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // 2. Get employee by ID
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));
    }
 // 3. Add a new employee
    public Employee addEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }
 // 4. Update an existing employee
    public Employee updateEmployee(Long id, Employee updatedEmployee) {

        Employee employee = getEmployeeById(id);

        employee.setName(updatedEmployee.getName());
        employee.setEmail(updatedEmployee.getEmail());
        employee.setDepartment(updatedEmployee.getDepartment());
        employee.setSalary(updatedEmployee.getSalary());

        return employeeRepository.save(employee);
    }
 // 5. Delete an employee
    public void deleteEmployee(Long id) {
        Employee employee = getEmployeeById(id);
        employeeRepository.delete(employee);
    }
 // Get employees with pagination and sorting
    public Page<Employee> getEmployees(Pageable pageable) {
        return employeeRepository.findAll(pageable);
    }
 // Search employee by email
    public Employee getEmployeeByEmail(String email) {
        return employeeRepository.findByEmail(email)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                "Employee not found with email: " + email));
    }
 // 8. Get total employee count
    public long getEmployeeCount() {
        return employeeRepository.count();
    }

    // 9. Get employee count by department
    public long getEmployeeCountByDepartment(String department) {
        return employeeRepository.countByDepartment(department);
    }
 // 10. Calculate average employee salary
    public double getAverageSalary() {
        return employeeRepository.findAll()
                .stream()
                .mapToDouble(Employee::getSalary)
                .average()
                .orElse(0.0);
    }
}