import { useAuth } from '../../context/AuthContext';
import './Header.css';

export default function Header({ title, onMenuToggle }) {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header__left">
        <button className="header__menu-btn" onClick={onMenuToggle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="header__title">{title}</h1>
      </div>
      <div className="header__right">
        <div className="header__greeting">
          Welcome, <strong>{user?.name?.split(' ')[0]}</strong>
        </div>
      </div>
    </header>
  );
}
