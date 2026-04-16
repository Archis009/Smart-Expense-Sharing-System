import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, TextField, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const groupRes = await api.get(`/api/groups/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setGroup(groupRes.data);
      const expenseRes = await api.get(`/api/expenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setExpenses(expenseRes.data);
    };
    fetchData();
  }, [id]);

  const fetchBalances = async () => {
    const token = localStorage.getItem('token');
    const res = await api.get(`/api/groups/${id}/balances`, { headers: { Authorization: `Bearer ${token}` } });
    setBalances(res.data);
  };

  const handleAddExpense = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDescription('');
    setAmount('');
    setSplitType('equal');
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      let participants = [];
      if (splitType === 'equal') {
        participants = group.members.map(m => m._id);
      }
      await api.post('/api/expenses', { description, amount: parseFloat(amount), groupId: id, participants, splitType }, { headers: { Authorization: `Bearer ${token}` } });
      // Refresh expenses
      const res = await api.get(`/api/expenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setExpenses(res.data);
      handleClose();
    } catch (err) {
      alert('Failed to add expense');
    }
  };

  if (!group) return <div>Loading...</div>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>{group.name} Expenses</Typography>
      <Button variant="contained" onClick={handleAddExpense}>Add Expense</Button>
      <Button variant="outlined" onClick={fetchBalances} sx={{ ml: 2 }}>View Balances</Button>
      {balances && (
        <div>
          <Typography variant="h5" gutterBottom>Balances</Typography>
          <List>
            {Object.entries(balances.balances).map(([userId, balance]) => {
              const member = group.members.find(m => m._id === userId);
              return (
                <ListItem key={userId}>
                  <ListItemText primary={`${member?.name || 'Unknown'}: $${balance.toFixed(2)}`} />
                </ListItem>
              );
            })}
          </List>
          <Typography variant="h5" gutterBottom>Settlements</Typography>
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
      <List>
        {expenses.map(expense => (
          <ListItem key={expense._id}>
            <ListItemText primary={`${expense.description} - $${expense.amount}`} secondary={`Paid by ${expense.paidBy.name}`} />
          </ListItem>
        ))}
      </List>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Description" fullWidth variant="standard" value={description} onChange={(e) => setDescription(e.target.value)} />
          <TextField margin="dense" label="Amount" type="number" fullWidth variant="standard" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Split Type</InputLabel>
            <Select value={splitType} onChange={(e) => setSplitType(e.target.value)}>
              <MenuItem value="equal">Equal</MenuItem>
              <MenuItem value="exact">Exact</MenuItem>
              <MenuItem value="percentage">Percentage</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Add</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Group;