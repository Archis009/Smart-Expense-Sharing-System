## 1. Actors

1. User
2. Admin (optional, system-level role)

---

## 2. User Use Cases

### Authentication
- Register
- Login
- Logout

### Group Management
- Create Group
- Join Group (via invite link)
- Add Member to Group
- Remove Member from Group
- View Group Details

### Expense Management
- Add Expense
- Edit Expense
- Delete Expense
- Choose Split Type:
    - Equal Split
    - Exact Split
    - Percentage Split

### Balance & Settlement
- View Balances
- View Who Owes Whom
- Settle Debt
- View Settlement History

---

## 3. Admin Use Cases (Optional)

- View All Users
- View System Analytics
- Suspend User

---

```mermaid
flowchart LR

    %% Actors
    User[User]
    Admin[Admin]

    %% User Use Cases
    Register((Register))
    Login((Login))
    CreateGroup((Create Group))
    JoinGroup((Join Group))
    AddExpense((Add Expense))
    EditExpense((Edit Expense))
    DeleteExpense((Delete Expense))
    ViewBalance((View Balance))
    SettleDebt((Settle Debt))

    %% Admin Use Cases
    ViewUsers((View All Users))
    ViewAnalytics((View Analytics))
    SuspendUser((Suspend User))

    %% Relationships
    User --> Register
    User --> Login
    User --> CreateGroup
    User --> JoinGroup
    User --> AddExpense
    User --> EditExpense
    User --> DeleteExpense
    User --> ViewBalance
    User --> SettleDebt

    Admin --> ViewUsers
    Admin --> ViewAnalytics
    Admin --> SuspendUser
```