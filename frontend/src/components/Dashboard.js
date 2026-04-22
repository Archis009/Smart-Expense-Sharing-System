import React, { useEffect, useState } from 'react';
import { Typography, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/api/groups', { headers: { Authorization: `Bearer ${token}` } });
        setGroups(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGroups();
  }, []);

  const handleCreateGroup = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setGroupName('');
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      await api.post('/api/groups', { name: groupName, members: [] }, { headers: { Authorization: `Bearer ${token}` } });
      const res = await api.get('/api/groups', { headers: { Authorization: `Bearer ${token}` } });
      setGroups(res.data);
      handleClose();
    } catch (err) {
      alert('Failed to create group');
    }
  };

  return (
    <div className="page-container fade-in">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>My Groups</Typography>
        <button className="glass-button" onClick={handleCreateGroup}>Create Group</button>
      </Box>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {groups.map(group => (
          <div key={group._id} className="glass-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/group/${group._id}`)}>
            <Typography variant="h5" color="primary">{group.name}</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {group.members?.length || 0} Members
            </Typography>
          </div>
        ))}
        {groups.length === 0 && (
          <Typography color="textSecondary">You are not in any groups yet.</Typography>
        )}
      </div>

      <Dialog open={open} onClose={handleClose} PaperProps={{ className: 'glass-card' }}>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <input className="glass-input" placeholder="Group Name" autoFocus value={groupName} onChange={(e) => setGroupName(e.target.value)} />
          </Box>
        </DialogContent>
        <DialogActions>
          <button className="glass-button glass-button-outline" onClick={handleClose}>Cancel</button>
          <button className="glass-button" onClick={handleSubmit}>Create</button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Dashboard;