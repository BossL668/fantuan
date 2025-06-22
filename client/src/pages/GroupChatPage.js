import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';

let socket;

function GroupChatPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/messages/group/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setMessages(res.data.messages))
      .catch(() => setError('Failed to load messages'))
      .finally(() => setLoading(false));
  }, [id, token]);

  useEffect(() => {
    socket = io('/', {
      auth: { token },
      transports: ['websocket']
    });
    socket.emit('join-group', id);
    socket.on('new-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => {
      socket.emit('leave-group', id);
      socket.disconnect();
    };
  }, [id, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = {
      groupId: id,
      content: input,
      sender: user,
      messageType: 'text',
    };
    socket.emit('send-message', msg);
    setMessages(prev => [...prev, { ...msg, sender: { username: user.username }, timestamp: new Date() }]);
    setInput('');
    // Optionally, persist to backend
    await axios.post(`/api/messages/group/${id}`, { content: input }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <Link to="/groups">&larr; Back to Groups</Link>
        <h2>Group Chat</h2>
      </div>
      <div className="chat-messages" style={{ height: 400, overflowY: 'auto', border: '1px solid #ccc', padding: 10 }}>
        {loading ? <div>Loading...</div> : error ? <div className="error">{error}</div> : (
          messages.map((msg, idx) => (
            <div key={idx} className="chat-message">
              <strong>{msg.sender?.username || 'Unknown'}:</strong> {msg.content}
              <span className="chat-timestamp"> {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input" onSubmit={sendMessage} style={{ marginTop: 10, display: 'flex' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, marginRight: 8 }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default GroupChatPage; 