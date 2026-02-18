# Sequence Diagram – Smart Expense Sharing System

This document represents the main backend flow of the system.

---

# 1️⃣ Add Expense Flow

## Scenario:
User adds a new expense inside a group.

## Steps:

1. User sends request to add expense.
2. Controller validates request.
3. Service selects appropriate Split Strategy.
4. Split amounts are calculated.
5. Balances are updated.
6. Expense is stored in database.
7. Updated balances are returned.

---


```mermaid
sequenceDiagram
    actor User
    participant ExpenseController
    participant ExpenseService
    participant SplitStrategyFactory
    participant SplitStrategy
    participant BalanceService
    participant ExpenseRepository
    participant Database

    User->>ExpenseController: POST /expenses
    ExpenseController->>ExpenseService: createExpense(requestData)

    ExpenseService->>SplitStrategyFactory: getStrategy(splitType)
    SplitStrategyFactory-->>ExpenseService: Strategy Object

    ExpenseService->>SplitStrategy: calculateSplits()
    SplitStrategy-->>ExpenseService: splitDetails

    ExpenseService->>BalanceService: updateBalances(splitDetails)
    BalanceService->>Database: update balance records
    Database-->>BalanceService: success

    ExpenseService->>ExpenseRepository: saveExpense()
    ExpenseRepository->>Database: insert expense
    Database-->>ExpenseRepository: success

    ExpenseRepository-->>ExpenseService: expenseSaved
    ExpenseService-->>ExpenseController: success response
    ExpenseController-->>User: 201 Created
```

---

# 2️⃣ Settle Debt Flow

## Scenario:
User settles debt with another user.

## Steps:

1. User initiates settlement.
2. Controller validates request.
3. Service verifies outstanding balance.
4. Balance is updated.
5. Settlement record is stored.
6. Confirmation returned.

---

## Mermaid Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant SettlementController
    participant SettlementService
    participant BalanceService
    participant SettlementRepository
    participant Database

    User->>SettlementController: POST /settle
    SettlementController->>SettlementService: settleDebt(data)

    SettlementService->>BalanceService: verifyBalance()
    BalanceService->>Database: fetch balance
    Database-->>BalanceService: balanceDetails

    SettlementService->>BalanceService: updateBalances()
    BalanceService->>Database: update balance
    Database-->>BalanceService: success

    SettlementService->>SettlementRepository: saveSettlement()
    SettlementRepository->>Database: insert settlement
    Database-->>SettlementRepository: success

    SettlementRepository-->>SettlementService: settlementSaved
    SettlementService-->>SettlementController: success response
    SettlementController-->>User: 200 OK
```

---

# Key Design Highlights

- Clear separation of layers (Controller → Service → Repository)
- Strategy Pattern used for split logic
- Balance consistency maintained through service layer
- Database interactions abstracted via repository