import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fieldsAPI, usersAPI } from '../../services/api';
import './CreateField.css';

export default function CreateField() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    crop_type: '',
    area_size: '',
    location: '',
    planting_date: '',
    assigned_agent_id: '',
  });

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const res = await usersAPI.getAll('field_agent');
      setAgents(res.data.users);
    } catch (err) {
      console.error('Failed to load agents:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        area_size: formData.area_size ? parseFloat(formData.area_size) : undefined,
        assigned_agent_id: formData.assigned_agent_id ? parseInt(formData.assigned_agent_id) : undefined,
      };

      const res = await fieldsAPI.create(payload);
      navigate(`/fields/${res.data.field.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const commonCrops = ['wheat', 'corn', 'rice', 'tomato', 'potato', 'lettuce', 'carrot', 'cotton', 'soybean', 'sugarcane'];

  return (
    <div className="create-field fade-in">
      <Link to="/fields" className="field-detail__back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Fields
      </Link>

      <div className="create-field__header">
        <h2>Create New Field</h2>
        <p>Add a new field to the monitoring system</p>
      </div>

      <div className="card create-field__form-card">
        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={handleSubmit} className="create-field__form">
          <div className="create-field__row">
            <div className="form-group">
              <label htmlFor="name">Field Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                placeholder="e.g., North Wheat Field"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="crop_type">Crop Type *</label>
              <input
                id="crop_type"
                name="crop_type"
                type="text"
                className="form-input"
                list="crop-suggestions"
                placeholder="e.g., wheat, corn, tomato"
                value={formData.crop_type}
                onChange={handleChange}
                required
              />
              <datalist id="crop-suggestions">
                {commonCrops.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="create-field__row">
            <div className="form-group">
              <label htmlFor="planting_date">Planting Date *</label>
              <input
                id="planting_date"
                name="planting_date"
                type="date"
                className="form-input"
                value={formData.planting_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="area_size">Area Size (hectares)</label>
              <input
                id="area_size"
                name="area_size"
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                placeholder="e.g., 25.5"
                value={formData.area_size}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              type="text"
              className="form-input"
              placeholder="e.g., North Section, Block A"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="assigned_agent_id">Assign Agent</label>
            <select
              id="assigned_agent_id"
              name="assigned_agent_id"
              className="form-select"
              value={formData.assigned_agent_id}
              onChange={handleChange}
            >
              <option value="">Leave unassigned</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
              ))}
            </select>
          </div>

          <div className="create-field__actions">
            <Link to="/fields" className="btn btn--secondary">Cancel</Link>
            <button type="submit" className="btn btn--primary btn--lg" disabled={submitting}>
              {submitting ? 'Creating...' : '🌱 Create Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
