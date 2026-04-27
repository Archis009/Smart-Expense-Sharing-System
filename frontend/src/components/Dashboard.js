import React, { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [summaryData, setSummaryData] = useState({ totalBalance: 0, youOwe: 0, youAreOwed: 0 });
  const [loadingBalances, setLoadingBalances] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchGroups = useCallback(async () => {
    try {
      const res = await api.get('/api/groups', { headers: { Authorization: `Bearer ${token}` } });
      setGroups(res.data);
      return res.data;
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
      console.error(err);
      return [];
    }
  }, [token, navigate]);

  const fetchAllBalances = useCallback(async (groupsList) => {
    setLoadingBalances(true);
    let totalOwed = 0;
    let totalOwe = 0;
    try {
      // Decode token to get user ID
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;

      for (const group of groupsList) {
        try {
          const res = await api.get(`/api/groups/${group._id}/balances`, { headers: { Authorization: `Bearer ${token}` } });
          const myBalance = res.data.balances[userId] || 0;
          if (myBalance > 0) totalOwed += myBalance;
          if (myBalance < 0) totalOwe += Math.abs(myBalance);
        } catch {
          // skip groups that fail
        }
      }
    } catch {
      // token decode failed
    }
    setSummaryData({
      totalBalance: totalOwed - totalOwe,
      youOwe: totalOwe,
      youAreOwed: totalOwed,
    });
    setLoadingBalances(false);
  }, [token]);

  useEffect(() => {
    const init = async () => {
      const g = await fetchGroups();
      if (g.length > 0) fetchAllBalances(g);
    };
    init();
  }, [fetchGroups, fetchAllBalances]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      setIsSearching(true);
      try {
        const res = await api.get(`/api/users?search=${query}`, { headers: { Authorization: `Bearer ${token}` } });
        setSearchResults(res.data);
      } catch (err) {
        console.error(err);
      }
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddMember = (user) => {
    if (!selectedMembers.find(m => m._id === user._id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter(m => m._id !== userId));
  };

  const handleClose = () => {
    setOpen(false);
    setGroupName('');
    setSelectedMembers([]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    try {
      const memberIds = selectedMembers.map(m => m._id);
      await api.post('/api/groups', { name: groupName, members: memberIds }, { headers: { Authorization: `Bearer ${token}` } });
      const g = await fetchGroups();
      fetchAllBalances(g);
      handleClose();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create group');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const formatMoney = (val) => {
    return '$' + Math.abs(val).toFixed(2);
  };

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* ─── Navbar ─── */}
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="brand-icon">💎</span>
          Smart Expense
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="intel-badge">🧠 Settlement Engine Active</span>
          <button className="neon-button-outline neon-button-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="page-container">
        {/* ─── Financial Summary ─── */}
        <div className="stat-grid fade-in stagger-1">
          <div className="stat-card stat-card-cyan levitate">
            <div className="stat-label">Total Balance</div>
            <div className={`stat-value ${summaryData.totalBalance >= 0 ? 'stat-value-cyan' : 'stat-value-red'}`}>
              {loadingBalances ? '...' : (summaryData.totalBalance >= 0 ? '+' : '-') + formatMoney(summaryData.totalBalance)}
            </div>
          </div>
          <div className="stat-card stat-card-red levitate" style={{ animationDelay: '1s' }}>
            <div className="stat-label">You Owe</div>
            <div className="stat-value stat-value-red">
              {loadingBalances ? '...' : formatMoney(summaryData.youOwe)}
            </div>
          </div>
          <div className="stat-card stat-card-green levitate" style={{ animationDelay: '2s' }}>
            <div className="stat-label">You Are Owed</div>
            <div className="stat-value stat-value-green">
              {loadingBalances ? '...' : formatMoney(summaryData.youAreOwed)}
            </div>
          </div>
        </div>

        {/* ─── Groups Section ─── */}
        <div className="section-header fade-in stagger-2">
          <h2 className="section-title">My Groups</h2>
          <button className="neon-button" onClick={() => setOpen(true)}>
            + Create Group
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="empty-state fade-in stagger-3">
            <div className="empty-state-icon">🌌</div>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No groups yet</p>
            <p style={{ fontSize: '14px' }}>Create your first group to start splitting expenses</p>
          </div>
        ) : (
          <div className="groups-grid">
            {groups.map((group, idx) => (
              <div
                key={group._id}
                className={`glass-card fade-in stagger-${Math.min(idx + 3, 6)}`}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/group/${group._id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>{group.name}</h3>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {group.members?.length || 0} members
                    </span>
                  </div>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, var(--neon-violet), var(--neon-blue))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', flexShrink: 0
                  }}>
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Member avatars */}
                <div style={{ display: 'flex', gap: '0', marginTop: '8px' }}>
                  {(group.members || []).slice(0, 5).map((member, i) => (
                    <div key={member._id || i} style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: `hsl(${(i * 72) + 200}, 60%, 50%)`,
                      border: '2px solid var(--bg-void)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: '600', color: 'white',
                      marginLeft: i === 0 ? '0' : '-8px', zIndex: 5 - i,
                      position: 'relative'
                    }}>
                      {(member.name || '?').charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {(group.members || []).length > 5 && (
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: 'var(--bg-nebula)', border: '2px solid var(--bg-void)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', color: 'var(--text-muted)',
                      marginLeft: '-8px', position: 'relative'
                    }}>
                      +{group.members.length - 5}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Create Group Dialog ─── */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '20px', pb: 0 }}>Create New Group</DialogTitle>
        <DialogContent>
          <div style={{ marginTop: '16px', marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Group Name
            </label>
            <input className="glass-input" placeholder="E.g. Goa Trip 🏖️" autoFocus value={groupName} onChange={(e) => setGroupName(e.target.value)} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Add Members
            </label>
            <input
              className="glass-input"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={handleSearch}
            />
            {isSearching && <div style={{ marginTop: '8px' }}><span className="spinner"></span></div>}
            {searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map(user => (
                  <div key={user._id} className="search-result-item" onClick={() => handleAddMember(user)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--neon-violet), var(--neon-blue))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: '600', color: 'white', flexShrink: 0
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>{user.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {selectedMembers.map(member => (
              <span key={member._id} className="user-chip">
                <span className="user-chip-avatar">{member.name.charAt(0).toUpperCase()}</span>
                {member.name}
                <span className="user-chip-remove" onClick={() => handleRemoveMember(member._id)}>×</span>
              </span>
            ))}
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <button className="neon-button-outline neon-button-sm" onClick={handleClose}>Cancel</button>
          <button className="neon-button neon-button-sm" onClick={handleSubmit} disabled={!groupName.trim()}>Create Group</button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Dashboard;