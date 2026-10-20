package com.example.employee_management;

@SuppressWarnings("serial")
public class EmployeeNotFoundException extends RuntimeException {

    // Constructor for searching by employee ID
    public EmployeeNotFoundException(Long id) {
        super("Employee not found with ID: " + id);
    }

    // Constructor for custom error messages, such as email search
    public EmployeeNotFoundException(String message) {
        super(message);
    }
}