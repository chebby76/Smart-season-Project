import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fieldsAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './FieldDetail.css';

export default function FieldDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isAgent } = useAuth();
  const [field, setField] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateForm, setUpdateForm] = useState({ new_stage: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadField();
    if (isAdmin) loadAgents();
  }, [id]);

  const loadField = async () => {
    try {
      setLoading(true);
      const res = await fieldsAPI.getById(id);
      setField(res.data.field);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const res = await usersAPI.getAll('field_agent');
      setAgents(res.data.users);
    } catch (err) {
      console.error('Failed to load agents:', err);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!updateForm.new_stage) return;

    try {
      setSubmitting(true);
      setError('');
      await fieldsAPI.addUpdate(id, updateForm);
      setUpdateForm({ new_stage: '', notes: '' });
      setSuccessMsg('Field updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadField();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async (agentId) => {
    try {
      await fieldsAPI.assign(id, agentId || null);
      loadField();
      setSuccessMsg('Agent assignment updated!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete field "${field.name}"? This cannot be undone.`)) return;
    try {
      await fieldsAPI.delete(id);
      navigate('/fields');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span>Loading field details...</span>
      </div>
    );
  }

  if (error && !field) {
    return (
      <div>
        <div className="alert alert--error">{error}</div>
        <Link to="/fields" className="btn btn--ghost" style={{ marginTop: 16 }}>← Back to Fields</Link>
      </div>
    );
  }

  const stages = ['planted', 'growing', 'ready', 'harvested'];
  const currentStageIdx = stages.indexOf(field.current_stage);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const formatDateTime = (d) => new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const daysSincePlanting = Math.floor((new Date() - new Date(field.planting_date)) / (1000 * 60 * 60 * 24));

  const canUpdate = isAdmin || (isAgent && field.assigned_agent_id === user.id);

  return (
    <div className="field-detail fade-in">
      {/* Back Link */}
      <Link to="/fields" className="field-detail__back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Fields
      </Link>

      {successMsg && <div className="alert alert--success">{successMsg}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      {/* Hero Section */}
      <div className="field-detail__hero">
        <div className="field-detail__hero-left">
          <div className="field-detail__emoji">{getCropEmoji(field.crop_type)}</div>
          <div>
            <h2 className="field-detail__name">{field.name}</h2>
            <p className="field-detail__crop">{field.crop_type}</p>
          </div>
        </div>
        <div className="field-detail__hero-right">
          <span className={`badge badge--${field.status}`}>
            {field.status === 'at_risk' ? 'At Risk' : field.status}
          </span>
          {isAdmin && (
            <button className="btn btn--danger btn--sm" onClick={handleDelete}>
              Delete Field
            </button>
          )}
        </div>
      </div>

      {/* Stage Progress */}
      <div className="card field-detail__progress">
        <h3>Growth Progress</h3>
        <div className="progress-tracker">
          {stages.map((stage, i) => (
            <div key={stage} className={`progress-step ${i <= currentStageIdx ? 'progress-step--done' : ''} ${i === currentStageIdx ? 'progress-step--current' : ''}`}>
              <div className="progress-step__dot">
                {i < currentStageIdx ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span className="progress-step__label">{stage}</span>
              {i < stages.length - 1 && <div className={`progress-step__line ${i < currentStageIdx ? 'progress-step__line--done' : ''}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="field-detail__grid">
        {/* Info Panel */}
        <div className="card field-detail__info">
          <h3>Field Information</h3>
          <div className="info-list">
            <div className="info-item">
              <span className="info-item__label">Crop Type</span>
              <span className="info-item__value" style={{ textTransform: 'capitalize' }}>{field.crop_type}</span>
            </div>
            <div className="info-item">
              <span className="info-item__label">Planting Date</span>
              <span className="info-item__value">{formatDate(field.planting_date)}</span>
            </div>
            <div className="info-item">
              <span className="info-item__label">Days Since Planting</span>
              <span className="info-item__value">{daysSincePlanting} days</span>
            </div>
            {field.area_size && (
              <div className="info-item">
                <span className="info-item__label">Area Size</span>
                <span className="info-item__value">{field.area_size} hectares</span>
              </div>
            )}
            {field.location && (
              <div className="info-item">
                <span className="info-item__label">Location</span>
                <span className="info-item__value">{field.location}</span>
              </div>
            )}
            <div className="info-item">
              <span className="info-item__label">Created By</span>
              <span className="info-item__value">{field.creator?.name || 'Unknown'}</span>
            </div>
            <div className="info-item">
              <span className="info-item__label">Assigned Agent</span>
              <span className="info-item__value">
                {field.assignedAgent?.name || <em style={{ color: 'var(--text-muted)' }}>Unassigned</em>}
              </span>
            </div>
          </div>

          {/* Agent Assignment (Admin) */}
          {isAdmin && (
            <div className="field-detail__assign">
              <label>Assign Agent</label>
              <select
                className="form-select"
                value={field.assigned_agent_id || ''}
                onChange={(e) => handleAssign(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">Unassigned</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Update Form */}
        {canUpdate && field.current_stage !== 'harvested' && (
          <div className="card field-detail__update-form">
            <h3>Submit Update</h3>
            <form onSubmit={handleUpdateSubmit}>
              <div className="form-group">
                <label>New Stage</label>
                <select
                  className="form-select"
                  value={updateForm.new_stage}
                  onChange={(e) => setUpdateForm({ ...updateForm, new_stage: e.target.value })}
                  required
                >
                  <option value="">Select stage...</option>
                  {stages.map((stage, i) => (
                    <option
                      key={stage}
                      value={stage}
                      disabled={isAgent && i < currentStageIdx}
                    >
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      {i === currentStageIdx ? ' (current)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Notes / Observations</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe field conditions, observations, issues..."
                  value={updateForm.notes}
                  onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn--primary" disabled={submitting || !updateForm.new_stage}>
                {submitting ? 'Submitting...' : 'Submit Update'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Update History */}
      <div className="card field-detail__history">
        <h3>Update History</h3>
        {!field.updates || field.updates.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
            <p>No updates yet</p>
          </div>
        ) : (
          <div className="history-timeline">
            {field.updates
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((update, i) => (
                <div key={update.id} className="timeline-item fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="timeline-item__dot" />
                  <div className="timeline-item__content">
                    <div className="timeline-item__header">
                      <span className={`badge badge--${update.new_stage}`}>{update.new_stage}</span>
                      <span className="timeline-item__time">{formatDateTime(update.created_at)}</span>
                    </div>
                    {update.notes && <p className="timeline-item__notes">{update.notes}</p>}
                    <span className="timeline-item__author">by {update.updatedByUser?.name || 'Unknown'}</span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getCropEmoji(crop) {
  const map = {
    wheat: '🌾', corn: '🌽', rice: '🍚', tomato: '🍅', potato: '🥔',
    lettuce: '🥬', carrot: '🥕', cotton: '☁️', soybean: '🫘', sugarcane: '🎋',
  };
  return map[crop?.toLowerCase()] || '🌱';
}
