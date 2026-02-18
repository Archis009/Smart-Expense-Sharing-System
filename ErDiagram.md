# ER Diagram – Smart Expense Sharing System

This document represents the database schema and relationships between tables.

---

# Entities Overview

1. Users
2. Groups
3. GroupMembers
4. Expenses
5. ExpenseSplits
6. Balances
7. Settlements

---

# Mermaid ER Diagram

```mermaid
erDiagram

    USERS {
        string id PK
        string name
        string email
        string password
        datetime created_at
    }

    GROUPS {
        string id PK
        string name
        string created_by FK
        datetime created_at
    }

    GROUP_MEMBERS {
        string id PK
        string group_id FK
        string user_id FK
        datetime joined_at
    }

    EXPENSES {
        string id PK
        string group_id FK
        string paid_by FK
        float total_amount
        string split_type
        datetime created_at
    }

    EXPENSE_SPLITS {
        string id PK
        string expense_id FK
        string user_id FK
        float amount
    }

    BALANCES {
        string id PK
        string group_id FK
        string user_id FK
        float net_amount
    }

    SETTLEMENTS {
        string id PK
        string group_id FK
        string from_user FK
        string to_user FK
        float amount
        datetime settled_at
    }

    USERS ||--o{ GROUP_MEMBERS : joins
    GROUPS ||--o{ GROUP_MEMBERS : contains

    GROUPS ||--o{ EXPENSES : has
    USERS ||--o{ EXPENSES : pays 

    EXPENSES ||--o{ EXPENSE_SPLITS : splits_into
    USERS ||--o{ EXPENSE_SPLITS : owes

    GROUPS ||--o{ BALANCES : maintains
    USERS ||--o{ BALANCES : has

    USERS ||--o{ SETTLEMENTS : makes
    GROUPS ||--o{ SETTLEMENTS : records
```