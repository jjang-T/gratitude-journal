import React, { useState, useMemo } from 'react';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { MonthlyCalendar } from './components/calendar/MonthlyCalendar';
import { DiaryCard } from './components/diary/DiaryCard';
import { DiaryEditorModal } from './components/diary/DiaryEditorModal';
import { EventSection } from './components/calendar/EventSection';
import { EventEditorModal } from './components/calendar/EventEditorModal';
import { BucketSection } from './components/bucket/BucketSection';
import { useGratitudeData } from './hooks/useGratitudeData';
import type { DiaryEntry, BucketItem, CalendarEvent, ActiveTab } from './types';
import { formatDateKey } from './data/mockData';
import { Plus, BookOpen, Heart } from 'lucide-react';

export const App: React.FC = () => {
  const {
    diaries,
    bucketItems,
    events,
    saveDiary,
    deleteDiary,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEventComplete,
    markEventGoogleSynced,
    addBucketItem,
    toggleBucketItem,
    deleteBucketItem,
  } = useGratitudeData();

  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateKey(new Date()));

  // Modals state
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [editingDiary, setEditingDiary] = useState<DiaryEntry | null>(null);
  const [preselectedBucketId, setPreselectedBucketId] = useState<string | undefined>();

  // Event modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Month navigation
  const handlePrevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCalendarDate(now);
    setSelectedDate(formatDateKey(now));
  };

  // Selected day entry & events
  const selectedDayDiary = useMemo(() => {
    return diaries.find((d) => d.date === selectedDate);
  }, [diaries, selectedDate]);

  const selectedDayEvents = useMemo(() => {
    return events.filter((ev) => ev.date === selectedDate);
  }, [events, selectedDate]);

  // Open modal for writing gratitude diary
  const handleOpenWriteForDate = (dateKey?: string) => {
    const targetDate = dateKey || selectedDate || formatDateKey(new Date());
    setSelectedDate(targetDate);
    const existing = diaries.find((d) => d.date === targetDate);
    if (existing) {
      setEditingDiary(existing);
    } else {
      setEditingDiary(null);
    }
    setPreselectedBucketId(undefined);
    setIsWriteModalOpen(true);
  };

  // Open modal from Bucket item achievement
  const handleWriteAchievementDiary = (bucketItem: BucketItem) => {
    const today = formatDateKey(new Date());
    setSelectedDate(today);
    setEditingDiary(null);
    setPreselectedBucketId(bucketItem.id);
    setIsWriteModalOpen(true);
  };

  // Edit specific diary
  const handleEditDiary = (diary: DiaryEntry) => {
    setEditingDiary(diary);
    setSelectedDate(diary.date);
    setPreselectedBucketId(diary.linkedBucketId);
    setIsWriteModalOpen(true);
  };

  // Save diary wrapper
  const handleSaveDiary = (entryData: any) => {
    saveDiary(entryData);
    setIsWriteModalOpen(false);
    setEditingDiary(null);
    setPreselectedBucketId(undefined);
  };

  // Save event wrapper
  const handleSaveEvent = (payload: any) => {
    if (payload.id) {
      updateEvent(payload as CalendarEvent);
    } else {
      addEvent(payload);
    }
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  // Calculate streak
  const streakCount = useMemo(() => {
    const diaryDates = new Set(diaries.map((d) => d.date));
    let count = 0;
    const checkDate = new Date();
    while (true) {
      const key = formatDateKey(checkDate);
      if (diaryDates.has(key)) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (count === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          if (diaryDates.has(formatDateKey(checkDate))) {
            count++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }
    return count;
  }, [diaries]);

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWriteModal={() => handleOpenWriteForDate()}
        streakCount={streakCount}
      />

      {/* Main Contents based on active tab */}
      <main className="main-content">
        {activeTab === 'calendar' && (
          <div className="split-view">
            {/* Left side: Monthly Calendar with stickers and event indicators */}
            <div>
              <MonthlyCalendar
                currentDate={calendarDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onToday={handleToday}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                diaries={diaries}
                events={events}
                onOpenWriteModal={handleOpenWriteForDate}
              />
            </div>

            {/* Right side: Selected Day Schedule and Gratitude Journal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 1. Schedule / Event Section */}
              <EventSection
                selectedDate={selectedDate}
                events={selectedDayEvents}
                allEvents={events}
                onOpenAddEventModal={() => {
                  setEditingEvent(null);
                  setIsEventModalOpen(true);
                }}
                onEditEvent={(ev) => {
                  setEditingEvent(ev);
                  setIsEventModalOpen(true);
                }}
                onDeleteEvent={deleteEvent}
                onToggleComplete={toggleEventComplete}
                onSyncGoogle={markEventGoogleSynced}
              />

              {/* 2. Gratitude Journal Section */}
              <div>
                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Heart size={16} color="var(--accent-primary)" />
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      감사일기
                    </h4>
                  </div>

                  {!selectedDayDiary && (
                    <button
                      type="button"
                      className="write-cta-btn"
                      onClick={() => handleOpenWriteForDate(selectedDate)}
                      style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                    >
                      <Plus size={14} />
                      <span>일기 작성</span>
                    </button>
                  )}
                </div>

                {selectedDayDiary ? (
                  <DiaryCard
                    diary={selectedDayDiary}
                    onEdit={handleEditDiary}
                    onDelete={deleteDiary}
                  />
                ) : (
                  <div
                    className="diary-card"
                    style={{
                      textAlign: 'center',
                      padding: '32px 20px',
                      border: '1px dashed var(--border-subtle)',
                      background: 'var(--bg-card-subtle)',
                    }}
                  >
                    <BookOpen size={28} color="var(--accent-primary)" style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                    <h5 style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      작성된 감사일기가 없습니다
                    </h5>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                      오늘 하루 감사했던 일들을 기록해보세요.
                    </p>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => handleOpenWriteForDate(selectedDate)}
                      style={{ padding: '7px 16px', fontSize: '0.84rem' }}
                    >
                      <Plus size={14} style={{ verticalAlign: '-2px', marginRight: '4px' }} />
                      감사일기 작성하기
                    </button>
                  </div>
                )}
              </div>

              {/* Recent other diaries preview */}
              <div>
                <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  최근 작성한 감사일기
                </h5>
                {diaries
                  .filter((d) => d.date !== selectedDate)
                  .slice(0, 2)
                  .map((d) => (
                    <DiaryCard
                      key={d.id}
                      diary={d}
                      onEdit={handleEditDiary}
                      onDelete={deleteDiary}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Feed view (all diaries) */}
        {activeTab === 'feed' && (
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  감사일기 목록
                </h2>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-tertiary)' }}>
                  총 {diaries.length}개의 감사일기가 기록되었습니다.
                </p>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleOpenWriteForDate()}
              >
                <Plus size={15} style={{ verticalAlign: '-2px', marginRight: '4px' }} />
                감사일기 작성
              </button>
            </div>

            {diaries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
                <BookOpen size={40} style={{ margin: '0 auto 12px', opacity: 0.35 }} />
                <p>작성된 감사일기가 없습니다. 첫 번째 일기를 기록해보세요.</p>
              </div>
            ) : (
              diaries.map((diary) => (
                <DiaryCard
                  key={diary.id}
                  diary={diary}
                  onEdit={handleEditDiary}
                  onDelete={deleteDiary}
                />
              ))
            )}
          </div>
        )}

        {/* Tab 3: Bucket list */}
        {activeTab === 'bucket' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <BucketSection
              bucketItems={bucketItems}
              onToggleComplete={toggleBucketItem}
              onAddBucket={addBucketItem}
              onDeleteBucket={deleteBucketItem}
              onWriteAchievementDiary={handleWriteAchievementDiary}
            />
          </div>
        )}
      </main>

      {/* iOS Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Write/Edit Gratitude Diary Modal */}
      <DiaryEditorModal
        isOpen={isWriteModalOpen}
        onClose={() => {
          setIsWriteModalOpen(false);
          setEditingDiary(null);
          setPreselectedBucketId(undefined);
        }}
        onSave={handleSaveDiary}
        initialDate={selectedDate}
        existingEntry={editingDiary}
        bucketItems={bucketItems}
        preselectedBucketId={preselectedBucketId}
      />

      {/* Create/Edit Schedule Event Modal */}
      <EventEditorModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        initialDate={selectedDate}
        existingEvent={editingEvent}
      />
    </div>
  );
};

export default App;
