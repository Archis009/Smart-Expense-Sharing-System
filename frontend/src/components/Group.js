import React, { useEffect, useState } from 'react';
import { Typography, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import api from '../api';
import { useParams } from 'react-router-dom';

const Group = () => {
  const { id } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [group, setGroup] = useState(null);
  const [balances, setBalances] = useState(null);
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [exactAmounts, setExactAmounts] = useState({});
  const [percentageAmounts, setPercentageAmounts] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const groupRes = await api.get(`/api/groups/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setGroup(groupRes.data);
        const expenseRes = await api.get(`/api/expenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setExpenses(expenseRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

  const fetchBalances = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/api/groups/${id}/balances`, { headers: { Authorization: `Bearer ${token}` } });
      setBalances(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExpense = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDescription('');
    setAmount('');
    setSplitType('equal');
    setExactAmounts({});
    setPercentageAmounts({});
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      let participants = [];
      if (splitType === 'equal') {
        participants = group.members.map(m => m._id);
      } else if (splitType === 'exact') {
        participants = group.members.map(m => ({ user: m._id, amount: parseFloat(exactAmounts[m._id]) || 0 }));
      } else if (splitType === 'percentage') {
        participants = group.members.map(m => ({ user: m._id, amount: parseFloat(percentageAmounts[m._id]) || 0 }));
      }

      await api.post('/api/expenses', { description, amount: parseFloat(amount), groupId: id, participants, splitType }, { headers: { Authorization: `Bearer ${token}` } });
      
      const res = await api.get(`/api/expenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setExpenses(res.data);
      handleClose();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add expense');
    }
  };

  if (!group) return <div className="page-container fade-in">Loading...</div>;

  return (
    <div className="page-container fade-in">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{group.name}</Typography>
        <Box>
          <button className="glass-button" onClick={handleAddExpense} style={{ marginRight: '10px' }}>Add Expense</button>
          <button className="glass-button glass-button-outline" onClick={fetchBalances}>View Balances</button>
        </Box>
      </Box>

      {balances && (
        <div className="glass-card fade-in" style={{ marginBottom: '24px' }}>
          <Typography variant="h5" gutterBottom color="primary">Net Balances</Typography>
          <List>
            {Object.entries(balances.balances).map(([userId, balance]) => {
              const member = group.members.find(m => m._id === userId);
              const color = balance > 0 ? 'var(--success-color)' : balance < 0 ? 'var(--danger-color)' : 'inherit';
              return (
                <ListItem key={userId}>
                  <ListItemText 
                    primary={<span style={{ color }}>{`${member?.name || 'Unknown'}: $${balance.toFixed(2)}`}</span>} 
                  />
                </ListItem>
              );
            })}
          </List>
          <Typography variant="h5" gutterBottom color="primary" sx={{ mt: 2 }}>Settlements</Typography>
          <List>
            {balances.settlements.map((settlement, index) => {
              const fromMember = group.members.find(m => m._id === settlement.from);
              const toMember = group.members.find(m => m._id === settlement.to);
              return (
                <ListItem key={index}>
                  <ListItemText primary={`${fromMember?.name || 'Unknown'} owes ${toMember?.name || 'Unknown'} $${settlement.amount.toFixed(2)}`} />
                </ListItem>
              );
            })}
          </List>
        </div>
      )}

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Recent Expenses</Typography>
      <div style={{ display: 'grid', gap: '16px' }}>
        {expenses.length === 0 ? (
          <Typography color="textSecondary">No expenses yet.</Typography>
        ) : (
          expenses.map(expense => (
            <div key={expense._id} className="glass-card">
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography variant="h6">{expense.description}</Typography>
                  <Typography variant="body2" color="textSecondary">Paid by {expense.paidBy.name}</Typography>
                </Box>
                <Typography variant="h5" color="primary">${expense.amount.toFixed(2)}</Typography>
              </Box>
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onClose={handleClose} PaperProps={{ className: 'glass-card' }}>
        <DialogTitle>Add New Expense</DialogTitle>
        <DialogContent>
          <Box mb={2} mt={1}>
            <input className="glass-input" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Box>
          <Box mb={2}>
            <input className="glass-input" placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Box>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Split Type</InputLabel>
            <Select value={splitType} onChange={(e) => setSplitType(e.target.value)}>
              <MenuItem value="equal">Equal Split</MenuItem>
              <MenuItem value="exact">Exact Amounts</MenuItem>
              <MenuItem value="percentage">Percentage Split</MenuItem>
            </Select>
          </FormControl>

          {splitType === 'exact' && (
            <Box mb={2}>
              <Typography variant="subtitle2" mb={1}>Enter Exact Amounts</Typography>
              {group.members.map(m => (
                <Box key={m._id} display="flex" alignItems="center" mb={1}>
                  <Typography sx={{ width: '100px' }}>{m.name}</Typography>
                  <input 
                    className="glass-input" 
                    type="number" 
                    placeholder="0.00" 
                    value={exactAmounts[m._id] || ''} 
                    onChange={e => setExactAmounts({...exactAmounts, [m._id]: e.target.value})} 
                  />
                </Box>
              ))}
            </Box>
          )}

          {splitType === 'percentage' && (
            <Box mb={2}>
              <Typography variant="subtitle2" mb={1}>Enter Percentages (%)</Typography>
              {group.members.map(m => (
                <Box key={m._id} display="flex" alignItems="center" mb={1}>
                  <Typography sx={{ width: '100px' }}>{m.name}</Typography>
                  <input 
                    className="glass-input" 
                    type="number" 
                    placeholder="0" 
                    value={percentageAmounts[m._id] || ''} 
                    onChange={e => setPercentageAmounts({...percentageAmounts, [m._id]: e.target.value})} 
                  />
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <button className="glass-button glass-button-outline" onClick={handleClose}>Cancel</button>
          <button className="glass-button" onClick={handleSubmit}>Add</button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Group;