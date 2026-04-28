import React, { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import api from '../api';
import { useParams, useNavigate } from 'react-router-dom';

const Group = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [group, setGroup] = useState(null);
  const [balances, setBalances] = useState(null);
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [paidBy, setPaidBy] = useState('');
  const [exactAmounts, setExactAmounts] = useState({});
  const [percentageAmounts, setPercentageAmounts] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settleAnimating, setSettleAnimating] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberResults, setMemberResults] = useState([]);

  const token = localStorage.getItem('token');
  let currentUserId = '';
  try { currentUserId = JSON.parse(atob(token.split('.')[1])).id; } catch {}

  const fetchData = useCallback(async () => {
    try {
      const groupRes = await api.get(`/api/groups/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setGroup(groupRes.data);
      if (!paidBy && groupRes.data.members?.length) setPaidBy(currentUserId || groupRes.data.members[0]._id);
      const expenseRes = await api.get(`/api/expenses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setExpenses(expenseRes.data);
      try {
        const balRes = await api.get(`/api/groups/${id}/balances`, { headers: { Authorization: `Bearer ${token}` } });
        setBalances(balRes.data);
      } catch {}
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load group');
      setLoading(false);
    }
  }, [id, token, currentUserId, paidBy]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleClose = () => { setOpen(false); setDescription(''); setAmount(''); setSplitType('equal'); setExactAmounts({}); setPercentageAmounts({}); };

  const handleSubmit = async () => {
    try {
      let participants = [];
      if (splitType === 'equal') {
        participants = group.members.map(m => m._id);
      } else if (splitType === 'exact') {
        participants = group.members.map(m => ({ user: m._id, amount: parseFloat(exactAmounts[m._id]) || 0 }));
      } else if (splitType === 'percentage') {
        participants = group.members.map(m => ({ user: m._id, amount: parseFloat(percentageAmounts[m._id]) || 0 }));
      }
      await api.post('/api/expenses', { description, amount: parseFloat(amount), groupId: id, participants, splitType, paidBy }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchData();
      handleClose();
    } catch (err) { alert(err.response?.data?.error || 'Failed to add expense'); }
  };

  const handleSettleUp = () => { setSettleAnimating(true); setTimeout(() => setSettleAnimating(false), 2000); };

  const handleMemberSearch = async (e) => {
    const q = e.target.value;
    setMemberSearch(q);
    if (q.length > 1) {
      try {
        const res = await api.get(`/api/users?search=${q}`, { headers: { Authorization: `Bearer ${token}` } });
        const existingIds = (group?.members || []).map(m => m._id);
        setMemberResults(res.data.filter(u => !existingIds.includes(u._id)));
      } catch {}
    } else { setMemberResults([]); }
  };

  const handleAddToGroup = async (userId) => {
    try {
      await api.put(`/api/groups/${id}/members`, { memberIds: [userId] }, { headers: { Authorization: `Bearer ${token}` } });
      setMemberSearch(''); setMemberResults([]); setMemberOpen(false);
      await fetchData();
    } catch (err) { alert(err.response?.data?.error || 'Failed to add member'); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (error) return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <nav className="navbar"><div className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}><span className="brand-icon">💎</span> Smart Expense</div></nav>
      <div className="page-container"><div className="glass-card-static" style={{ textAlign: 'center', padding: '60px' }}><div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div><p style={{ color: 'var(--danger)', fontSize: '18px', fontWeight: '600' }}>{error}</p><button className="neon-button" style={{ marginTop: '16px' }} onClick={() => navigate('/dashboard')}>Back to Dashboard</button></div></div>
    </div>
  );

  if (loading) return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <nav className="navbar"><div className="navbar-brand"><span className="brand-icon">💎</span> Smart Expense</div></nav>
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '100px' }}><span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }}></span><p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>Loading group data...</p></div>
    </div>
  );

  const hasBalances = balances?.balances && Object.keys(balances.balances).length > 0;
  const hasSettlements = balances?.settlements?.length > 0;

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <nav className="navbar">
        <div className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}><span className="brand-icon">💎</span> Smart Expense</div>
        <button className="neon-button-outline neon-button-sm" onClick={() => navigate('/dashboard')}>← Dashboard</button>
      </nav>

      <div className="page-container">
        {/* Header */}
        <div className="fade-in stagger-1" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-1px' }}>{group.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex' }}>
                  {(group.members || []).map((m, i) => (
                    <div key={m._id} title={m.name} style={{ width: '32px', height: '32px', borderRadius: '50%', background: `hsl(${i * 72 + 200}, 60%, 50%)`, border: '2px solid var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: 'white', marginLeft: i ? '-8px' : '0', zIndex: 10 - i, position: 'relative' }}>{m.name.charAt(0).toUpperCase()}</div>
                  ))}
                </div>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{group.members?.length || 0} members</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="neon-button-outline neon-button-sm" onClick={() => setMemberOpen(true)}>👥 Add Member</button>
              {hasSettlements && <button className="neon-button-outline neon-button-sm" onClick={handleSettleUp}>💸 Settle Up</button>}
              <button className="neon-button" onClick={() => setOpen(true)}>+ Add Expense</button>
            </div>
          </div>
        </div>

        {/* Balance Cards */}
        {hasBalances && (
          <div className="fade-in stagger-2" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Net Balances</h2>
              <span className="intel-badge">⚡ Live</span>
            </div>
            <div className="balance-grid">
              {Object.entries(balances.balances).map(([uid, bal]) => {
                const member = group.members.find(m => m._id === uid);
                return (
                  <div key={uid} className="balance-member-card" style={{ borderColor: bal > 0 ? 'rgba(16,185,129,0.2)' : bal < 0 ? 'rgba(239,68,68,0.2)' : 'var(--glass-border)' }}>
                    <div className="balance-member-name">{member?.name || 'Unknown'}</div>
                    <div className="balance-member-amount" style={{ color: bal > 0 ? 'var(--success)' : bal < 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>{bal > 0 ? '+' : ''}{bal.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Settlements */}
        {hasSettlements && (
          <div className={`fade-in stagger-3 ${settleAnimating ? 'settle-pulse' : ''}`} style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Optimized Settlements</h2>
              <span className="intel-badge">🧠 Minimal Transactions</span>
            </div>
            {settleAnimating && <div style={{ marginBottom: '12px', padding: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', color: 'var(--success)', fontSize: '14px', fontWeight: '600' }}>✨ Optimized Settlement Applied — {balances.settlements.length} transaction{balances.settlements.length !== 1 ? 's' : ''} calculated</div>}
            {balances.settlements.map((s, i) => {
              const from = group.members.find(m => m._id === s.from);
              const to = group.members.find(m => m._id === s.to);
              return (
                <div key={i} className="settlement-card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--danger), #f87171)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: 'white', flexShrink: 0 }}>{(from?.name || '?').charAt(0)}</div>
                  <div style={{ flex: 1 }}><span style={{ fontWeight: '600' }}>{from?.name || 'Unknown'}</span><span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>pays</span><span style={{ fontWeight: '600' }}>{to?.name || 'Unknown'}</span></div>
                  <span className="settlement-arrow">→</span>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--neon-cyan)' }}>${s.amount.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Expense Timeline */}
        <div className="fade-in stagger-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Expense Timeline</h2>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{expenses.length} transaction{expenses.length !== 1 ? 's' : ''}</span>
          </div>
          {expenses.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📡</div><p style={{ fontSize: '16px', marginBottom: '8px' }}>No expenses yet</p><p style={{ fontSize: '14px' }}>Add your first expense to see the timeline</p></div>
          ) : (
            <div className="timeline">
              {expenses.map((exp, idx) => (
                <div key={exp._id} className="timeline-item fade-in" style={{ animationDelay: `${idx * 0.08}s` }}>
                  <div className="glass-card-static" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 6px 0' }}>{exp.description}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Paid by <span style={{ color: 'var(--neon-cyan)', fontWeight: '500' }}>{exp.paidBy?.name || 'Unknown'}</span></span>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(139,92,246,0.15)', color: 'var(--neon-violet)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{exp.splitType}</span>
                        </div>
                        {exp.createdAt && <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>{formatDate(exp.createdAt)}</span>}
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--neon-cyan)', whiteSpace: 'nowrap' }}>${exp.amount.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '20px', pb: 0 }}>Add New Expense</DialogTitle>
        <DialogContent>
          <div style={{ marginTop: '16px', marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
            <input className="glass-input" placeholder="E.g. Dinner at Hotel 🍕" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount ($)</label>
            <input className="glass-input" placeholder="0.00" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Paid By</label>
            <select className="glass-input" value={paidBy} onChange={e => setPaidBy(e.target.value)} style={{ cursor: 'pointer' }}>
              {(group.members || []).map(m => <option key={m._id} value={m._id}>{m.name}{m._id === currentUserId ? ' (You)' : ''}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Split Strategy</label>
            <div className="split-toggle">
              {['equal', 'exact', 'percentage'].map(type => (
                <button key={type} className={`split-toggle-btn ${splitType === type ? 'active' : ''}`} onClick={() => setSplitType(type)} type="button">
                  {type === 'equal' ? '⚖️ Equal' : type === 'exact' ? '🎯 Exact' : '📊 Percent'}
                </button>
              ))}
            </div>
          </div>
          {splitType === 'exact' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Exact Amounts</label>
              {group.members.map(m => (
                <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--neon-violet), var(--neon-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: 'white', flexShrink: 0 }}>{m.name.charAt(0).toUpperCase()}</div>
                  <span style={{ width: '100px', fontSize: '14px', fontWeight: '500' }}>{m.name}</span>
                  <input className="glass-input" style={{ flex: 1 }} type="number" step="0.01" placeholder="0.00" value={exactAmounts[m._id] || ''} onChange={e => setExactAmounts({ ...exactAmounts, [m._id]: e.target.value })} />
                </div>
              ))}
              {amount && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Total: ${Object.values(exactAmounts).reduce((s, v) => s + (parseFloat(v) || 0), 0).toFixed(2)} / ${parseFloat(amount || 0).toFixed(2)}</div>}
            </div>
          )}
          {splitType === 'percentage' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Percentages</label>
              {group.members.map(m => (
                <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--neon-violet), var(--neon-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: 'white', flexShrink: 0 }}>{m.name.charAt(0).toUpperCase()}</div>
                  <span style={{ width: '100px', fontSize: '14px', fontWeight: '500' }}>{m.name}</span>
                  <input className="glass-input" style={{ flex: 1 }} type="number" placeholder="0" value={percentageAmounts[m._id] || ''} onChange={e => setPercentageAmounts({ ...percentageAmounts, [m._id]: e.target.value })} />
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>%</span>
                </div>
              ))}
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Total: {Object.values(percentageAmounts).reduce((s, v) => s + (parseFloat(v) || 0), 0).toFixed(0)}% / 100%</div>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <button className="neon-button-outline neon-button-sm" onClick={handleClose}>Cancel</button>
          <button className="neon-button neon-button-sm" onClick={handleSubmit} disabled={!description.trim() || !amount}>Add Expense</button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={memberOpen} onClose={() => { setMemberOpen(false); setMemberSearch(''); setMemberResults([]); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '20px', pb: 0 }}>Add Members to {group.name}</DialogTitle>
        <DialogContent>
          <div style={{ marginTop: '16px', marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Search Users</label>
            <input className="glass-input" placeholder="Type a name or email..." value={memberSearch} onChange={handleMemberSearch} autoFocus />
          </div>
          {memberResults.length > 0 && (
            <div className="search-dropdown">
              {memberResults.map(user => (
                <div key={user._id} className="search-result-item" onClick={() => handleAddToGroup(user._id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--neon-violet), var(--neon-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: 'white', flexShrink: 0 }}>{user.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>{user.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {memberSearch.length > 1 && memberResults.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginTop: '16px' }}>No users found</p>
          )}
          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Members</label>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {(group.members || []).map(m => (
                <span key={m._id} className="user-chip"><span className="user-chip-avatar">{m.name.charAt(0).toUpperCase()}</span>{m.name}</span>
              ))}
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <button className="neon-button-outline neon-button-sm" onClick={() => { setMemberOpen(false); setMemberSearch(''); setMemberResults([]); }}>Done</button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Group;