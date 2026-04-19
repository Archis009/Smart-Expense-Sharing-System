import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
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
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setGroupName('');
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/groups', { name: groupName, members: [] }, { headers: { Authorization: `Bearer ${token}` } });
      setGroups([...groups, { name: groupName }]); // Refresh or add
      handleClose();
    } catch (err) {
      alert('Failed to create group');
    }
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
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Group Name" fullWidth variant="standard" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;