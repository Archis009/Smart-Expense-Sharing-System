# Smart Expense Sharing System (Splitwise Clone)

## 1. Project Overview

Smart Expense Sharing System is a Full Stack web application inspired by Splitwise.

The system allows users to create groups, add shared expenses, split bills using different strategies, and automatically calculate optimal settlements to minimize the number of transactions required to settle debts.

The primary focus of this project is to design a robust backend system that handles:

- Expense splitting logic
- Debt tracking
- Optimal settlement calculation
- Transaction consistency
- Role-based access control
- Clean layered architecture using OOP principles

Backend is the core of this system and carries 75% of the project complexity and scoring weightage.

---

## 2. Problem Statement

When multiple people share expenses, manually calculating who owes whom becomes complex.

Challenges include:

- Different split strategies (equal, exact, percentage)
- Multiple users involved in multiple groups
- Minimizing number of settlement transactions
- Maintaining accurate balances
- Handling concurrent expense additions

This system solves these problems by implementing proper system design and algorithmic settlement logic.

---

## 3. Scope of the Project

### Users

- Register/Login
- Create and join groups
- Add expenses
- Split expenses (equal, exact amount, percentage)
- View balances
- View transaction history
- Settle debts
- View group summaries

### Admin (Optional)

- View platform-level analytics
- Manage users
- View system statistics

---

## 4. Key Features

### 1. Authentication & Authorization

- JWT-based authentication
- Role-based access control

### 2. Group Management

- Create group
- Add/remove members
- View group expense summary

### 3. Expense Management

- Add expense with:
  - Paid by
  - Amount
  - Participants
  - Split type
- Edit/Delete expense (with recalculation)

### 4. Split Strategies

The system will support multiple splitting strategies:

- Equal Split
- Exact Amount Split
- Percentage Split

(Strategy Pattern can be used here.)

### 5. Balance Calculation

The system maintains:

- Individual balances
- Who owes whom
- Group-level balance sheet

### 6. Optimal Settlement Algorithm

To minimize number of transactions:

- Convert debts into net balances
- Use greedy / graph-based algorithm
- Generate minimal settlement transactions

Example:
Instead of:
A → B (100)
B → C (100)

System simplifies to:
A → C (100)

### 7. Transaction Management

- Atomic updates when expense is added
- Data consistency across group balances
- Prevention of inconsistent states

---

## 5. Backend Architecture (High-Level)

The backend will follow a clean layered architecture:

- Controllers → Handle HTTP requests
- Services → Business logic
- Repositories → Database interaction
- Models/Entities → Domain representation
- Middleware → Authentication & authorization

---

## 6. OOP Principles Applied

### Encapsulation

Business logic is inside service classes.

### Abstraction

Expose only required methods to controllers.

### Inheritance

Base User class (extended by Admin if needed).

### Polymorphism

Different split strategies implement a common interface.

---

## 7. Design Patterns Used

- Strategy Pattern → For different split types
- Repository Pattern → Database abstraction
- Factory Pattern → Create split strategy dynamically
- Singleton → Database connection
- Observer Pattern (optional) → Notification system

---

## 8. Non-Functional Requirements

- Data consistency
- Scalability
- Maintainable codebase
- Modular structure
- Clean separation of concerns

---

## 9. Tech Stack (Tentative)

Frontend:

- React
- Axios
- Tailwind CSS

Backend:

- Node.js
- Express.js
- MongoDB / PostgreSQL
- JWT Authentication

Optional Enhancements:

- Redis caching
- Docker containerization
- Cloud deployment
- Unit testing with Jest

---

## 10. Future Enhancements

- Recurring expenses
- Expense reminders
- Real-time updates using WebSockets
- Mobile-friendly UI
- Export reports (PDF/CSV)
- AI-based spending insights

---

## 11. Learning Objectives

Through this project, the objective is to demonstrate:

- Strong backend system design
- Implementation of OOP principles
- Usage of design patterns
- Transaction consistency handling
- Graph-based algorithm for settlement optimization
- Clean and scalable architecture
