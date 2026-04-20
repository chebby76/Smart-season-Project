import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { dashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, updatesRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentUpdates(8),
      ]);
      setStats(statsRes.data);
      setRecentUpdates(updatesRes.data.updates);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert--error">{error}</div>;
  }

  const statusChartData = {
    labels: ['Active', 'At Risk', 'Completed'],
    datasets: [{
      data: [
        stats.statusBreakdown.active,
        stats.statusBreakdown.at_risk,
        stats.statusBreakdown.completed,
      ],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(99, 102, 241, 0.8)',
      ],
      borderColor: [
        'rgba(16, 185, 129, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(99, 102, 241, 1)',
      ],
      borderWidth: 2,
      hoverOffset: 6,
    }],
  };

  const stageChartData = {
    labels: ['Planted', 'Growing', 'Ready', 'Harvested'],
    datasets: [{
      label: 'Fields',
      data: [
        stats.stageBreakdown.planted,
        stats.stageBreakdown.growing,
        stats.stageBreakdown.ready,
        stats.stageBreakdown.harvested,
      ],
      backgroundColor: [
        'rgba(245, 158, 11, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(59, 130, 246, 0.7)',
        'rgba(139, 92, 246, 0.7)',
      ],
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
          font: { family: 'Inter', size: 12 },
        },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'Inter' } },
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.5)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter' }, stepSize: 1 },
      },
    },
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / (1000 * 60));
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="dashboard">
      {/* Stat Cards */}
      <div className="dashboard__stats">
        <div className="stat-card stat-card--total fade-in" style={{ animationDelay: '0ms' }}>
          <div className="stat-card__icon stat-card__icon--total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value">{stats.totalFields}</span>
            <span className="stat-card__label">Total Fields</span>
          </div>
        </div>

        <div className="stat-card stat-card--active fade-in" style={{ animationDelay: '80ms' }}>
          <div className="stat-card__icon stat-card__icon--active">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value">{stats.statusBreakdown.active}</span>
            <span className="stat-card__label">Active</span>
          </div>
        </div>

        <div className="stat-card stat-card--risk fade-in" style={{ animationDelay: '160ms' }}>
          <div className="stat-card__icon stat-card__icon--risk">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value">{stats.statusBreakdown.at_risk}</span>
            <span className="stat-card__label">At Risk</span>
          </div>
        </div>

        <div className="stat-card stat-card--completed fade-in" style={{ animationDelay: '240ms' }}>
          <div className="stat-card__icon stat-card__icon--completed">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value">{stats.statusBreakdown.completed}</span>
            <span className="stat-card__label">Completed</span>
          </div>
        </div>

        {isAdmin && stats.agentCount !== undefined && (
          <div className="stat-card stat-card--agents fade-in" style={{ animationDelay: '320ms' }}>
            <div className="stat-card__icon stat-card__icon--agents">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <div className="stat-card__info">
              <span className="stat-card__value">{stats.agentCount}</span>
              <span className="stat-card__label">Field Agents</span>
            </div>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="dashboard__charts">
        <div className="card dashboard__chart fade-in" style={{ animationDelay: '200ms' }}>
          <h3 className="dashboard__chart-title">Status Overview</h3>
          <div className="dashboard__chart-container">
            <Doughnut data={statusChartData} options={chartOptions} />
          </div>
        </div>

        <div className="card dashboard__chart fade-in" style={{ animationDelay: '300ms' }}>
          <h3 className="dashboard__chart-title">Field Stages</h3>
          <div className="dashboard__chart-container">
            <Bar data={stageChartData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Recent Updates */}
      <div className="card dashboard__updates fade-in" style={{ animationDelay: '400ms' }}>
        <div className="dashboard__updates-header">
          <h3 className="dashboard__chart-title">Recent Activity</h3>
          <Link to="/fields" className="btn btn--ghost btn--sm">View All Fields →</Link>
        </div>

        {recentUpdates.length === 0 ? (
          <div className="empty-state">
            <p>No recent updates</p>
          </div>
        ) : (
          <div className="dashboard__updates-list">
            {recentUpdates.map((update, i) => (
              <Link
                to={`/fields/${update.field_id}`}
                key={update.id}
                className="update-item fade-in"
                style={{ animationDelay: `${450 + i * 50}ms` }}
              >
                <div className="update-item__icon">
                  <span className={`badge badge--${update.new_stage}`}>
                    {update.new_stage}
                  </span>
                </div>
                <div className="update-item__content">
                  <span className="update-item__field">{update.field?.name || `Field #${update.field_id}`}</span>
                  {update.notes && (
                    <span className="update-item__notes">{update.notes}</span>
                  )}
                </div>
                <div className="update-item__meta">
                  <span className="update-item__author">{update.updatedByUser?.name}</span>
                  <span className="update-item__time">{formatDate(update.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
