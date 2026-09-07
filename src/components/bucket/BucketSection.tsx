import React, { useState } from 'react';
import { Plus, Check, Trophy, Sparkles, Trash2, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { BucketItem, BucketCategory } from '../../types';
import { BUCKET_CATEGORIES } from '../../data/stickers';

interface BucketSectionProps {
  bucketItems: BucketItem[];
  onToggleComplete: (id: string) => Promise<BucketItem | undefined>;
  onAddBucket: (item: Omit<BucketItem, 'id' | 'isCompleted'>) => void;
  onDeleteBucket: (id: string) => void;
  onWriteAchievementDiary: (bucketItem: BucketItem) => void;
}

export const BucketSection: React.FC<BucketSectionProps> = ({
  bucketItems,
  onToggleComplete,
  onAddBucket,
  onDeleteBucket,
  onWriteAchievementDiary,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<BucketCategory>('travel');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Stats
  const totalCount = bucketItems.length;
  const completedCount = bucketItems.filter((b) => b.isCompleted).length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered items
  const filteredItems = bucketItems.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const handleToggle = async (id: string) => {
    const updated = await onToggleComplete(id);
    if (updated?.isCompleted) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#D97757', '#F59E0B', '#10B981', '#3B82F6'],
      });
    }
  };

  const handleCreateBucket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddBucket({
      title: newTitle.trim(),
      category: newCategory,
      targetDate: newTargetDate || undefined,
      notes: newNotes.trim() || undefined,
    });

    setNewTitle('');
    setNewNotes('');
    setNewTargetDate('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="bucket-section">
      <div className="bucket-header">
        <div className="bucket-title">
          <Trophy size={22} color="#D97757" />
          <span>버킷리스트</span>
        </div>
        <button
          className="btn-primary"
          onClick={() => setIsAddModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.86rem' }}
        >
          <Plus size={15} />
          <span>새 목표 추가</span>
        </button>
      </div>

      {/* Progress Card */}
      <div className="bucket-progress-card">
        <div className="bucket-progress-stats">
          <span>달성 현황</span>
          <span>
            {completedCount} / {totalCount}개 달성 ({percent}%)
          </span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Category Filters */}
      <div className="category-filter-bar">
        {BUCKET_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`category-pill-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items list */}
      <div className="bucket-items-list">
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
            <Sparkles size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.4 }} />
            <p style={{ fontSize: '0.92rem' }}>등록된 목표가 없습니다.</p>
            <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>새로운 목표를 등록해보세요.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const categoryMeta = BUCKET_CATEGORIES.find((c) => c.id === item.category);

            return (
              <div
                key={item.id}
                className={`bucket-card ${item.isCompleted ? 'is-completed' : ''}`}
              >
                {/* Round Checkbox */}
                <button
                  type="button"
                  className={`bucket-checkbox-btn ${item.isCompleted ? 'checked' : ''}`}
                  onClick={() => handleToggle(item.id)}
                  title={item.isCompleted ? '달성 취소' : '달성 완료 처리'}
                  aria-label="달성 여부 토글"
                >
                  {item.isCompleted && <Check size={16} strokeWidth={3} />}
                </button>

                <div className="bucket-card-body">
                  <div className="bucket-card-title">{item.title}</div>
                  {item.notes && (
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {item.notes}
                    </div>
                  )}

                  <div className="bucket-meta-row">
                    {categoryMeta && (
                      <span style={{ color: categoryMeta.color || '#57534E', fontWeight: 600 }}>
                        {categoryMeta.label}
                      </span>
                    )}
                    {item.targetDate && (
                      <span>목표일: {item.targetDate}</span>
                    )}
                    {item.isCompleted && item.completedAt && (
                      <span style={{ color: '#059669', fontWeight: 600 }}>
                        {item.completedAt} 달성
                      </span>
                    )}
                  </div>
                </div>

                <div className="bucket-action-btns">
                  {item.isCompleted && (
                    <button
                      type="button"
                      className="btn-write-achievement"
                      onClick={() => onWriteAchievementDiary(item)}
                      title="달성 기념 일기를 작성합니다"
                    >
                      <BookOpen size={13} />
                      <span>달성 일기 작성</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => {
                      if (confirm(`'${item.title}' 항목을 삭제하시겠습니까?`)) {
                        onDeleteBucket(item.id);
                      }
                    }}
                    title="삭제"
                    style={{ border: 'none', background: 'transparent', color: 'var(--text-subtle)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Bucket Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">새 버킷리스트 추가</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <form className="modal-form" onSubmit={handleCreateBucket}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">목표 내용</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="예: 제주도 올레길 완주하기, 수영 배우기"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">카테고리</label>
                  <select
                    className="form-select"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as BucketCategory)}
                  >
                    {BUCKET_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">목표 일자 (선택)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">메모 (선택)</label>
                  <textarea
                    className="form-textarea"
                    placeholder="목표에 관한 메모나 실천 계획을 적어보세요."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  취소
                </button>
                <button type="submit" className="btn-primary">
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
