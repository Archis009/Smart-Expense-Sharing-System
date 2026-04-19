import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/groups', { headers: { Authorization: `Bearer ${token}` } });
      setGroups(res.data);
    };
    fetchGroups();
  }, []);

  const handleCreateGroup = () => {
    // Implement create group modal or page
    alert('Create group feature coming soon');
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>My Groups</Typography>
      <Button variant="contained" onClick={handleCreateGroup}>Create Group</Button>
      <List>
        {groups.map(group => (
          <ListItem key={group._id} button onClick={() => navigate(`/group/${group._id}`)}>
            <ListItemText primary={group.name} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Dashboard;