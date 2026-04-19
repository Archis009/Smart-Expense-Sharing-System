import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Group = () => {
  const { id } = useParams();
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/expenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setExpenses(res.data);
    };
    fetchExpenses();
  }, [id]);

  const handleAddExpense = () => {
    // Implement add expense modal
    alert('Add expense feature coming soon');
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Group Expenses</Typography>
      <Button variant="contained" onClick={handleAddExpense}>Add Expense</Button>
      <List>
        {expenses.map(expense => (
          <ListItem key={expense._id}>
            <ListItemText primary={`${expense.description} - $${expense.amount}`} secondary={`Paid by ${expense.paidBy.name}`} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Group;