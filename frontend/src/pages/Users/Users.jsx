import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import './Users.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await usersAPI.getAll();
      setUsers(res.data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await usersAPI.delete(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span>Loading users...</span>
      </div>
    );
  }

  return (
    <div className="users-page">
      {error && <div className="alert alert--error">{error}</div>}

      <div className="card users-table-card">
        <div className="users-table-header">
          <h3>All Users ({users.length})</h3>
        </div>

        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Fields</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className="fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <td>
                    <div className="user-cell">
                      <div className="user-cell__avatar">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="user-cell__name">{u.name}</span>
                    </div>
                  </td>
                  <td className="user-email">{u.email}</td>
                  <td>
                    <span className={`badge badge--${u.role}`}>
                      {u.role === 'admin' ? 'Admin' : 'Agent'}
                    </span>
                  </td>
                  <td>
                    <span className="user-fields-count">
                      {u.assignedFields?.length || 0}
                    </span>
                  </td>
                  <td className="user-date">{formatDate(u.created_at)}</td>
                  <td>
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => handleDelete(u.id, u.name)}
                      title="Delete user"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
