// Function to calculate net balances
function calculateBalances(expenses) {
  const balances = {};

  expenses.forEach(expense => {
    const paidBy = expense.paidBy._id.toString();
    balances[paidBy] = (balances[paidBy] || 0) + expense.amount;

    expense.participants.forEach(part => {
      const userId = part.user._id.toString();
      balances[userId] = (balances[userId] || 0) - part.amount;
    });
  });

  return balances;
}

// Function to minimize transactions using greedy algorithm
function minimizeTransactions(balances) {
  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([user, balance]) => {
    if (balance > 0) creditors.push({ user, amount: balance });
    else if (balance < 0) debtors.push({ user, amount: -balance });
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions = [];

  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const amount = Math.min(creditor.amount, debtor.amount);
    transactions.push({ from: debtor.user, to: creditor.user, amount });

    creditor.amount -= amount;
    debtor.amount -= amount;

    if (Math.abs(creditor.amount) < 0.01) i++;
    if (Math.abs(debtor.amount) < 0.01) j++;
  }

  return transactions;
}

module.exports = { calculateBalances, minimizeTransactions };