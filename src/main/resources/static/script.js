"use strict";

// ========================================
// 1. Backend API URL
// ========================================

const API_URL = "/employees";

// ========================================
// 2. Get HTML Elements
// ========================================

const employeeForm = document.getElementById("employeeForm");
const employeeIdInput = document.getElementById("employeeId");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const departmentInput = document.getElementById("department");
const salaryInput = document.getElementById("salary");

const employeeTableBody = document.getElementById("employeeTableBody");
const searchInput = document.getElementById("searchInput");

const totalEmployeesElement = document.getElementById("totalEmployees");
const averageSalaryElement = document.getElementById("averageSalary");
const systemStatusElement = document.getElementById("systemStatus");

const messageElement = document.getElementById("message");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");

// ========================================
// 3. Store Employee Data
// ========================================

let employees = [];
let messageTimer;

// ========================================
// 4. Display Messages
// ========================================

function showMessage(message, type) {
    messageElement.textContent = message;
    messageElement.className = "message " + type;

    clearTimeout(messageTimer);

    messageTimer = setTimeout(function () {
        messageElement.textContent = "";
        messageElement.className = "message";
    }, 4000);
}

// ========================================
// 5. Send Requests to Spring Boot
// ========================================

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const responseText = await response.text();

    let responseData = responseText;

    if (responseText) {
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = responseText;
        }
    }

    if (!response.ok) {
        if (typeof responseData === "string") {
            throw new Error(
                responseData || "Request failed. Please try again."
            );
        }

        if (responseData && typeof responseData === "object") {
            const errorMessage = Object.values(responseData)
                .filter(value => typeof value === "string")
                .join(", ");

            throw new Error(
                errorMessage || "Request failed. Please try again."
            );
        }

        throw new Error("Request failed. Please try again.");
    }

    return responseData;
}

// ========================================
// 6. Format Salary
// ========================================

function formatSalary(salary) {
    const amount = Number(salary);

    if (!Number.isFinite(amount)) {
        return "₹0.00";
    }

    return amount.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// ========================================
// 7. Load All Employees
// ========================================

async function loadEmployees() {
    employeeTableBody.innerHTML = `
        <tr>
            <td colspan="6" class="empty-state">
                Loading employees...
            </td>
        </tr>
    `;

    try {
        const data = await apiRequest(API_URL);

        if (!Array.isArray(data)) {
            throw new Error("The server returned an unexpected response.");
        }

        employees = data;

        systemStatusElement.textContent = "Connected";

        renderEmployees(employees);
        updateStatistics();

    } catch (error) {
        employees = [];

        employeeTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    Unable to load employees. Check whether Spring Boot is running.
                </td>
            </tr>
        `;

        totalEmployeesElement.textContent = "—";
        averageSalaryElement.textContent = "—";
        systemStatusElement.textContent = "Disconnected";

        showMessage(error.message, "error");

        console.error("Error loading employees:", error);
    }
}

// ========================================
// 8. Display Employees in the Table
// ========================================

function renderEmployees(employeeList) {
    employeeTableBody.innerHTML = "";

    if (employeeList.length === 0) {
        employeeTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    No employees found.
                </td>
            </tr>
        `;

        return;
    }

    employeeList.forEach(function (employee) {
        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = employee.id ?? "";

        const nameCell = document.createElement("td");
        nameCell.textContent = employee.name ?? "";

        const emailCell = document.createElement("td");
        emailCell.textContent = employee.email ?? "";

        const departmentCell = document.createElement("td");
        departmentCell.textContent = employee.department ?? "";

        const salaryCell = document.createElement("td");
        salaryCell.textContent = formatSalary(employee.salary);

        const actionsCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function () {
            editEmployee(employee.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            deleteEmployee(employee.id);
        });

        actionsCell.append(editButton, deleteButton);

        row.append(
            idCell,
            nameCell,
            emailCell,
            departmentCell,
            salaryCell,
            actionsCell
        );

        employeeTableBody.appendChild(row);
    });
}

// ========================================
// 9. Update Dashboard Statistics
// ========================================

async function updateStatistics() {
    totalEmployeesElement.textContent = employees.length;

    if (employees.length === 0) {
        averageSalaryElement.textContent = formatSalary(0);
        return;
    }

    const totalSalary = employees.reduce(function (total, employee) {
        return total + Number(employee.salary || 0);
    }, 0);

    const averageSalary = totalSalary / employees.length;

    averageSalaryElement.textContent = formatSalary(averageSalary);
}

// ========================================
// 10. Add a New Employee
// ========================================

employeeForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const employeeId = employeeIdInput.value;

    const employee = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        department: departmentInput.value.trim(),
        salary: Number(salaryInput.value)
    };

    if (
        !employee.name ||
        !employee.email ||
        !employee.department ||
        salaryInput.value.trim() === "" ||
        !Number.isFinite(employee.salary) ||
        employee.salary < 0
    ) {
        showMessage(
            "Please enter valid details in all fields.",
            "error"
        );

        return;
    }

    submitBtn.disabled = true;

    try {
        if (employeeId) {
            // Update an existing employee.
            await apiRequest(`${API_URL}/${employeeId}`, {
                method: "PUT",
                body: JSON.stringify(employee)
            });

            showMessage("Employee updated successfully!", "success");

        } else {
            // Add a new employee.
            await apiRequest(API_URL, {
                method: "POST",
                body: JSON.stringify(employee)
            });

            showMessage("Employee added successfully!", "success");
        }

        resetForm();
        await loadEmployees();

    } catch (error) {
        showMessage(error.message, "error");
        console.error("Error saving employee:", error);

    } finally {
        submitBtn.disabled = false;
    }
});

// ========================================
// 11. Edit an Employee
// ========================================

function editEmployee(id) {
    const employee = employees.find(function (item) {
        return String(item.id) === String(id);
    });

    if (!employee) {
        showMessage("Employee not found.", "error");
        return;
    }

    employeeIdInput.value = employee.id;
    nameInput.value = employee.name ?? "";
    emailInput.value = employee.email ?? "";
    departmentInput.value = employee.department ?? "";
    salaryInput.value = employee.salary ?? "";

    formTitle.textContent = "Edit Employee";
    submitBtn.textContent = "Update Employee";
    cancelBtn.hidden = false;

    document.getElementById("employee-form").scrollIntoView({
        behavior: "smooth"
    });
}

// ========================================
// 12. Delete an Employee
// ========================================

async function deleteEmployee(id) {
    const confirmed = window.confirm(
        "Are you sure you want to delete this employee?"
    );

    if (!confirmed) {
        return;
    }

    try {
        await apiRequest(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        showMessage("Employee deleted successfully!", "success");

        if (String(employeeIdInput.value) === String(id)) {
            resetForm();
        }

        await loadEmployees();

    } catch (error) {
        showMessage(error.message, "error");
        console.error("Error deleting employee:", error);
    }
}

// ========================================
// 13. Reset the Form
// ========================================

function resetForm() {
    employeeForm.reset();

    employeeIdInput.value = "";

    formTitle.textContent = "Add New Employee";
    submitBtn.textContent = "Add Employee";

    cancelBtn.hidden = true;
}

// ========================================
// 14. Cancel Editing
// ========================================

cancelBtn.addEventListener("click", function () {
    resetForm();
});

// ========================================
// 15. Clear Form
// ========================================

employeeForm.addEventListener("reset", function () {
    setTimeout(function () {
        employeeIdInput.value = "";

        formTitle.textContent = "Add New Employee";
        submitBtn.textContent = "Add Employee";

        cancelBtn.hidden = true;
    }, 0);
});

// ========================================
// 16. Search Employees
// ========================================
// 16. Search Employees

searchInput.addEventListener("input", function () {

    const searchTerm = searchInput.value.trim().toLowerCase();

    const filteredEmployees = employees.filter(function (employee) {

        const id = String(employee.id ?? "").toLowerCase();
        const name = String(employee.name ?? "").toLowerCase();
        const email = String(employee.email ?? "").toLowerCase();
        const department = String(employee.department ?? "").toLowerCase();
        const salary = String(employee.salary ?? "").toLowerCase();

        return (
            id.includes(searchTerm) ||
            name.includes(searchTerm) ||
            email.includes(searchTerm) ||
            department.includes(searchTerm) ||
            salary.includes(searchTerm)
        );

    });

    renderEmployees(filteredEmployees);

});
// ========================================
// 17. Start the Application
// ========================================

document.addEventListener("DOMContentLoaded", function () {
    loadEmployees();
});