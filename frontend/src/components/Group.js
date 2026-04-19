import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, TextField, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Group = () => {
  const { id } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [group, setGroup] = useState(null);
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState('equal');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const groupRes = await axios.get(`http://localhost:5000/api/groups/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setGroup(groupRes.data);
      const expenseRes = await axios.get(`http://localhost:5000/api/expenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setExpenses(expenseRes.data);
    };
    fetchData();
  }, [id]);

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
      await axios.post('http://localhost:5000/api/expenses', { description, amount: parseFloat(amount), groupId: id, participants, splitType }, { headers: { Authorization: `Bearer ${token}` } });
      // Refresh expenses
      const res = await axios.get(`http://localhost:5000/api/expenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
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