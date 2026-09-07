import React from 'react';
import { Plus, Calendar, BookOpen, Trophy } from 'lucide-react';
import type { ActiveTab } from '../../types';
import { CloverIcon } from '../common/CloverIcon';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenWriteModal: () => void;
  streakCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenWriteModal,
  streakCount,
}) => {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand" onClick={() => setActiveTab('calendar')}>
          <div className="brand-icon">
            <CloverIcon size={22} color="#2D5A3C" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="brand-title">하루 감사</span>
              <span className="brand-badge">Web & iOS</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <button
            type="button"
            className={`nav-item-btn ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <Calendar size={15} />
            <span>달력</span>
          </button>
          <button
            type="button"
            className={`nav-item-btn ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            <BookOpen size={15} />
            <span>일기 목록</span>
          </button>
          <button
            type="button"
            className={`nav-item-btn ${activeTab === 'bucket' ? 'active' : ''}`}
            onClick={() => setActiveTab('bucket')}
          >
            <Trophy size={15} />
            <span>버킷리스트</span>
          </button>
        </nav>

        {/* Header Actions */}
        <div className="header-actions">
          {streakCount > 0 && (
            <div className="streak-badge">
              <span>연속 {streakCount}일</span>
            </div>
          )}

          <button
            type="button"
            className="write-cta-btn"
            onClick={onOpenWriteModal}
          >
            <Plus size={16} />
            <span>일기 작성</span>
          </button>
        </div>
      </div>
    </header>
  );
};
