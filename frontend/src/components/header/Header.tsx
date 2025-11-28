import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-bootstrap-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { User } from '../../types/auth';
import LanguageChooser from '../LanguageChooser';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className="bg-dark text-white"
      style={{
        minHeight: isCollapsed ? '40px' : '60px',
        transition: 'min-height 0.3s ease',
        overflow: 'hidden'
      }}
    >
      {!isCollapsed ? (
        <div className="p-3 d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-0">{t('dashboard.title')}</h4>
            <small>
              {t('common.welcome')}, {user?.username} ({user?.role})
            </small>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <LanguageChooser />
            <button className="btn btn-outline-light btn-sm" onClick={onLogout}>
              {t('common.logout')}
            </button>
            <button
              className="btn btn-outline-light btn-sm d-flex align-items-center"
              onClick={() => setIsCollapsed(true)}
              title="Collapse header"
            >
              <ChevronUp size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="d-flex align-items-center justify-content-center p-2">
          <button
            className="btn btn-outline-light btn-sm d-flex align-items-center"
            onClick={() => setIsCollapsed(false)}
            title="Expand header"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
