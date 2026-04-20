import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fieldsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Fields.css';

export default function Fields() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ status: '', stage: '' });
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadFields();
  }, [filter]);

  const loadFields = async () => {
    try {
      setLoading(true);
      const res = await fieldsAPI.getAll(filter);
      setFields(res.data.fields);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete field "${name}"? This cannot be undone.`)) return;
    try {
      await fieldsAPI.delete(id);
      setFields(fields.filter((f) => f.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div className="fields-page">
      {/* Toolbar */}
      <div className="fields-toolbar">
        <div className="fields-toolbar__filters">
          <select
            className="form-select"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="at_risk">At Risk</option>
            <option value="completed">Completed</option>
          </select>

          <select
            className="form-select"
            value={filter.stage}
            onChange={(e) => setFilter({ ...filter, stage: e.target.value })}
          >
            <option value="">All Stages</option>
            <option value="planted">Planted</option>
            <option value="growing">Growing</option>
            <option value="ready">Ready</option>
            <option value="harvested">Harvested</option>
          </select>
        </div>

        {isAdmin && (
          <Link to="/fields/new" className="btn btn--primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Field
          </Link>
        )}
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <span>Loading fields...</span>
        </div>
      ) : fields.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <h3>No fields found</h3>
          <p>Try adjusting your filters or create a new field.</p>
        </div>
      ) : (
        <div className="fields-grid">
          {fields.map((field, i) => (
            <Link
              to={`/fields/${field.id}`}
              key={field.id}
              className="field-card fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="field-card__header">
                <div className="field-card__crop-icon">
                  {getCropEmoji(field.crop_type)}
                </div>
                <span className={`badge badge--${field.status}`}>
                  {field.status === 'at_risk' ? 'At Risk' : field.status}
                </span>
              </div>

              <h3 className="field-card__name">{field.name}</h3>
              <p className="field-card__crop">{field.crop_type}</p>

              <div className="field-card__stage-bar">
                <div className="stage-progress">
                  {['planted', 'growing', 'ready', 'harvested'].map((stage) => (
                    <div
                      key={stage}
                      className={`stage-progress__step ${
                        getStageIndex(field.current_stage) >= getStageIndex(stage)
                          ? 'stage-progress__step--done'
                          : ''
                      }`}
                      title={stage}
                    />
                  ))}
                </div>
                <span className="field-card__stage-label">{field.current_stage}</span>
              </div>

              <div className="field-card__details">
                {field.location && (
                  <div className="field-card__detail">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {field.location}
                  </div>
                )}
                <div className="field-card__detail">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {formatDate(field.planting_date)}
                </div>
              </div>

              <div className="field-card__footer">
                {field.assignedAgent ? (
                  <div className="field-card__agent">
                    <div className="field-card__agent-avatar">
                      {field.assignedAgent.name.charAt(0)}
                    </div>
                    <span>{field.assignedAgent.name}</span>
                  </div>
                ) : (
                  <span className="field-card__unassigned">Unassigned</span>
                )}

                {isAdmin && (
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={(e) => { e.preventDefault(); handleDelete(field.id, field.name); }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
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

function getStageIndex(stage) {
  return ['planted', 'growing', 'ready', 'harvested'].indexOf(stage);
}
