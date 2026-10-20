package com.example.employee_management;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.employee_management.service.EmployeeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/employees")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final EmployeeRepository employeeRepository;

    // Constructor
    public EmployeeController(
            EmployeeService employeeService,
            EmployeeRepository employeeRepository) {

        this.employeeService = employeeService;
        this.employeeRepository = employeeRepository;
    }

    // 1. GET - Retrieve all employees
    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    // 2. GET - Retrieve employee by ID
    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                employeeService.getEmployeeById(id));
    }

    // 3. POST - Add a new employee
    @PostMapping
    public ResponseEntity<String> addEmployee(
            @Valid @RequestBody Employee employee) {

        if (employeeRepository.existsByEmail(employee.getEmail())) {
            return ResponseEntity.badRequest()
                    .body("Email already exists!");
        }

        employeeService.addEmployee(employee);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Employee added successfully!");
    }

    // 4. PUT - Update an existing employee
    @PutMapping("/{id}")
    public ResponseEntity<String> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody Employee updatedEmployee) {

        if (employeeRepository.existsByEmailAndIdNot(
                updatedEmployee.getEmail(), id)) {

            return ResponseEntity.badRequest()
                    .body("Email already exists!");
        }

        employeeService.updateEmployee(id, updatedEmployee);

        return ResponseEntity.ok(
                "Employee updated successfully");
    }

    // 5. DELETE - Delete an employee
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEmployee(
            @PathVariable Long id) {

        employeeService.deleteEmployee(id);

        return ResponseEntity.ok(
                "Employee deleted successfully");
    }

    // 6. GET - Search employees by department
    @GetMapping("/department/{department}")
    public List<Employee> getEmployeesByDepartment(
            @PathVariable String department) {

        return employeeRepository.findByDepartment(department);
    }

    // 7. GET - Search employees by name
    @GetMapping("/search/{name}")
    public List<Employee> searchEmployeesByName(
            @PathVariable String name) {

        return employeeRepository.findByNameContainingIgnoreCase(name);
    }

    // 8. GET - Retrieve employees with pagination and sorting
    @GetMapping("/page")
    public Page<Employee> getEmployees(
            @PageableDefault(size = 5, sort = "id")
            Pageable pageable) {

        return employeeService.getEmployees(pageable);
    }

    // 9. GET - Search employee by email
    @GetMapping("/email/{email}")
    public ResponseEntity<Employee> getEmployeeByEmail(
            @PathVariable String email) {

        return ResponseEntity.ok(
                employeeService.getEmployeeByEmail(email));
    }
 // 10. Search employees earning above a salary
    @GetMapping("/salary/above/{salary}")
    public List<Employee> getEmployeesAboveSalary(
            @PathVariable double salary) {

        return employeeRepository.findBySalaryGreaterThan(salary);
    }

    // 11. Search employees earning below a salary
    @GetMapping("/salary/below/{salary}")
    public List<Employee> getEmployeesBelowSalary(
            @PathVariable double salary) {

        return employeeRepository.findBySalaryLessThan(salary);
    }
 // 12. Get total employee count
    @GetMapping("/count")
    public ResponseEntity<Long> getEmployeeCount() {
        return ResponseEntity.ok(employeeService.getEmployeeCount());
    }

    // 13. Get employee count by department
    @GetMapping("/count/department/{department}")
    public ResponseEntity<Long> getEmployeeCountByDepartment(
            @PathVariable String department) {

        return ResponseEntity.ok(
                employeeService.getEmployeeCountByDepartment(department));
    }
 // 14. Get average employee salary
    @GetMapping("/average-salary")
    public ResponseEntity<Double> getAverageSalary() {
        return ResponseEntity.ok(employeeService.getAverageSalary());
    }
}