import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function FriendsPage() {
  const { token, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
  }, [token]);

  const loadFriends = async () => {
    try {
      const response = await axios.get('/api/users/friends', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriends(response.data.friends);
    } catch (err) {
      console.error('Failed to load friends:', err);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const response = await axios.get('/api/users/friend-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingRequests(response.data.requests);
    } catch (err) {
      console.error('Failed to load friend requests:', err);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`/api/users/search/${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data.users.filter(u => u._id !== user._id));
    } catch (err) {
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await axios.post(`/api/users/friend-request/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove from search results
      setSearchResults(prev => prev.filter(u => u._id !== userId));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send friend request');
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      await axios.post(`/api/users/friend-request/${requestId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadFriends();
      loadPendingRequests();
      setError('');
    } catch (err) {
      setError('Failed to accept friend request');
    }
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      await axios.post(`/api/users/friend-request/${requestId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadPendingRequests();
      setError('');
    } catch (err) {
      setError('Failed to reject friend request');
    }
  };

  const removeFriend = async (friendId) => {
    try {
      await axios.delete(`/api/users/friends/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadFriends();
      setError('');
    } catch (err) {
      setError('Failed to remove friend');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchUsers();
  };

  return (
    <div className="friends-container">
      <div className="friends-header">
        <h2>Friends</h2>
        <Link to="/groups" className="back-link">&larr; Back to Groups</Link>
      </div>

      {/* Search Users */}
      <div className="search-section">
        <h3>Find Friends</h3>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by username, interests, or favorite content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        
        {error && <div className="error">{error}</div>}
        
        {searchResults.length > 0 && (
          <div className="search-results">
            <h4>Search Results</h4>
            {searchResults.map(user => (
              <div key={user._id} className="user-card">
                <div className="user-info">
                  <strong>{user.username}</strong>
                  {user.bio && <div className="user-bio">{user.bio}</div>}
                  {user.interests && user.interests.length > 0 && (
                    <div className="user-interests">
                      Interests: {user.interests.join(', ')}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => sendFriendRequest(user._id)}
                  className="add-friend-btn"
                >
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Friend Requests */}
      {pendingRequests.length > 0 && (
        <div className="requests-section">
          <h3>Friend Requests ({pendingRequests.length})</h3>
          {pendingRequests.map(request => (
            <div key={request._id} className="request-card">
              <div className="user-info">
                <strong>{request.from.username}</strong>
                {request.from.bio && <div className="user-bio">{request.from.bio}</div>}
              </div>
              <div className="request-actions">
                <button 
                  onClick={() => acceptFriendRequest(request._id)}
                  className="accept-btn"
                >
                  Accept
                </button>
                <button 
                  onClick={() => rejectFriendRequest(request._id)}
                  className="reject-btn"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friends List */}
      <div className="friends-section">
        <h3>My Friends ({friends.length})</h3>
        {friends.length === 0 ? (
          <p>No friends yet. Search for users to add friends!</p>
        ) : (
          <div className="friends-list">
            {friends.map(friend => (
              <div key={friend._id} className="friend-card">
                <div className="user-info">
                  <strong>{friend.username}</strong>
                  <div className="user-status">
                    {friend.isOnline ? '🟢 Online' : '⚫ Offline'}
                  </div>
                  {friend.bio && <div className="user-bio">{friend.bio}</div>}
                  {friend.interests && friend.interests.length > 0 && (
                    <div className="user-interests">
                      Interests: {friend.interests.join(', ')}
                    </div>
                  )}
                </div>
                <div className="friend-actions">
                  <button 
                    onClick={() => removeFriend(friend._id)}
                    className="remove-friend-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FriendsPage; 