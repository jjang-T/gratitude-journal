import React, { useState } from 'react';
import { Edit2, Trash2, Trophy, MapPin, CloudSun, X } from 'lucide-react';
import type { DiaryEntry } from '../../types';
import { STICKERS } from '../../data/stickers';

interface DiaryCardProps {
  diary: DiaryEntry;
  onEdit: (diary: DiaryEntry) => void;
  onDelete: (id: string) => void;
}

export const DiaryCard: React.FC<DiaryCardProps> = ({ diary, onEdit, onDelete }) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const sticker = STICKERS[diary.sticker] || STICKERS.grateful;

  // Format date: "2026년 9월 7일 (월)"
  const formattedDate = (() => {
    try {
      const [y, m, d] = diary.date.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      return `${y}년 ${m}월 ${d}일 (${days[dateObj.getDay()]})`;
    } catch {
      return diary.date;
    }
  })();

  return (
    <div className="diary-card">
      <div className="diary-card-header">
        <div className="diary-header-left">
          <span
            className="sticker-pill"
            style={{ backgroundColor: sticker.bgColor, color: sticker.color }}
          >
            <span>{sticker.emoji}</span>
            <span>{sticker.label}</span>
          </span>

          <span className="diary-date">{formattedDate}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            className="icon-btn"
            onClick={() => onEdit(diary)}
            title="수정"
            type="button"
            aria-label="수정"
          >
            <Edit2 size={14} />
          </button>
          <button
            className="icon-btn"
            onClick={() => {
              if (confirm('이 감사일기를 삭제하시겠습니까?')) {
                onDelete(diary.id);
              }
            }}
            title="삭제"
            type="button"
            aria-label="삭제"
            style={{ color: 'var(--color-danger)' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Location and Weather metadata */}
      {(diary.location?.address || diary.weather) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {diary.location?.address && (
            <span className="diary-meta-badge">
              <MapPin size={12} color="var(--accent-primary)" />
              <span>{diary.location.address}</span>
            </span>
          )}

          {diary.weather && (
            <span className="diary-meta-badge">
              <CloudSun size={12} color="#0284C7" />
              <span>
                {diary.weather.icon} {diary.weather.condition}
                {diary.weather.temp !== undefined ? ` ${diary.weather.temp}°C` : ''}
              </span>
            </span>
          )}
        </div>
      )}

      {/* Linked bucket list achievement badge */}
      {diary.linkedBucketTitle && (
        <div className="bucket-linked-badge">
          <Trophy size={13} />
          <span>달성 버킷: {diary.linkedBucketTitle}</span>
        </div>
      )}

      {/* Gratitude items list */}
      {diary.gratitudeItems && diary.gratitudeItems.length > 0 && (
        <div className="gratitude-list-box">
          <div className="gratitude-title">
            <span>오늘 감사한 일</span>
          </div>
          <ul className="gratitude-items">
            {diary.gratitudeItems.map((item, idx) => (
              <li key={idx} className="gratitude-item">
                <span className="gratitude-item-bullet">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Journal Body Content */}
      {diary.content && (
        <div className="diary-content-text">{diary.content}</div>
      )}

      {/* Attached Photos */}
      {diary.photos && diary.photos.length > 0 && (
        <div className="diary-photos-grid">
          {diary.photos.map((photoUrl, idx) => (
            <img
              key={idx}
              src={photoUrl}
              alt={`첨부 사진 ${idx + 1}`}
              className="diary-photo-thumb"
              onClick={() => setLightboxImage(photoUrl)}
            />
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="modal-overlay"
          style={{ zIndex: 120 }}
          onClick={() => setLightboxImage(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              background: 'transparent',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-btn"
              onClick={() => setLightboxImage(null)}
              style={{
                position: 'absolute',
                top: -16,
                right: -16,
                background: 'white',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <X size={18} />
            </button>
            <img
              src={lightboxImage}
              alt="사진 확대 보기"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                borderRadius: 'var(--radius-lg)',
                objectFit: 'contain',
                boxShadow: 'var(--shadow-float)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
