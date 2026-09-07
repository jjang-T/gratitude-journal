import React from 'react';
import { Calendar, BookOpen, Trophy } from 'lucide-react';
import type { ActiveTab } from '../../types';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <nav className="mobile-nav">
      <button
        type="button"
        className={`mobile-nav-btn ${activeTab === 'calendar' ? 'active' : ''}`}
        onClick={() => setActiveTab('calendar')}
      >
        <Calendar className="nav-icon" />
        <span>달력</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-btn ${activeTab === 'feed' ? 'active' : ''}`}
        onClick={() => setActiveTab('feed')}
      >
        <BookOpen className="nav-icon" />
        <span>일기 목록</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-btn ${activeTab === 'bucket' ? 'active' : ''}`}
        onClick={() => setActiveTab('bucket')}
      >
        <Trophy className="nav-icon" />
        <span>버킷리스트</span>
      </button>
    </nav>
  );
};
