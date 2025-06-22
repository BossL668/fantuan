import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function GroupListPage() {
  const { token, logout, user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    category: 'Other',
    isPrivate: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, [token]);

  const loadGroups = () => {
    setLoading(true);
    axios.get('/api/groups', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setGroups(res.data.groups))
      .catch(() => setError('Failed to load groups'))
      .finally(() => setLoading(false));
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/groups', createForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '', category: 'Other', isPrivate: false });
      loadGroups(); // Reload groups
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="group-list-container">
      <div className="group-list-header">
        <h2>Welcome, {user?.username}!</h2>
        <div className="nav-buttons">
          <Link to="/friends" className="nav-link">Friends</Link>
          <button onClick={() => setShowCreateModal(true)} style={{ marginRight: '10px' }}>
            Create Group
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      
      <h3>Fan Groups</h3>
      {loading ? <div>Loading...</div> : error ? <div className="error">{error}</div> : (
        <ul className="group-list">
          {groups.length === 0 ? (
            <li>No groups found. Create your first group!</li>
          ) : (
            groups.map(group => (
              <li key={group._id}>
                <Link to={`/groups/${group._id}`}>{group.name}</Link>
                <div className="group-desc">{group.description}</div>
                <div className="group-meta">
                  <span>Category: {group.category}</span>
                  <span>Members: {group.memberCount || 0}</span>
                </div>
              </li>
            ))
          )}
        </ul>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create New Group</h3>
            <form onSubmit={handleCreateGroup}>
              <input
                type="text"
                placeholder="Group Name"
                value={createForm.name}
                onChange={e => setCreateForm({...createForm, name: e.target.value})}
                required
              />
              <textarea
                placeholder="Group Description"
                value={createForm.description}
                onChange={e => setCreateForm({...createForm, description: e.target.value})}
                required
                style={{ height: '80px', resize: 'vertical' }}
              />
              <select
                value={createForm.category}
                onChange={e => setCreateForm({...createForm, category: e.target.value})}
              >
                <option value="Music">Music</option>
                <option value="Movie">Movie</option>
                <option value="TV Show">TV Show</option>
                <option value="Anime">Anime</option>
                <option value="Gaming">Gaming</option>
                <option value="Sports">Sports</option>
                <option value="Literature">Literature</option>
                <option value="Other">Other</option>
              </select>
              <label>
                <input
                  type="checkbox"
                  checked={createForm.isPrivate}
                  onChange={e => setCreateForm({...createForm, isPrivate: e.target.checked})}
                />
                Private Group
              </label>
              <div className="modal-buttons">
                <button type="submit">Create Group</button>
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupListPage; 