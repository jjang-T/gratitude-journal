import type { Sticker, StickerId } from '../types';

export const STICKERS: Record<StickerId, Sticker> = {
  grateful: {
    id: 'grateful',
    emoji: '🌸',
    label: '감사',
    desc: '고마운 마음이 들었던 순간',
    color: '#D97757',
    bgColor: '#FFF5F2',
  },
  happy: {
    id: 'happy',
    emoji: '☀️',
    label: '기쁨',
    desc: '기분 좋게 웃었던 시간',
    color: '#D97706',
    bgColor: '#FEF3C7',
  },
  peaceful: {
    id: 'peaceful',
    emoji: '🌿',
    label: '평온',
    desc: '차분하고 여유로웠던 하루',
    color: '#059669',
    bgColor: '#ECFDF5',
  },
  cozy: {
    id: 'cozy',
    emoji: '☕',
    label: '휴식',
    desc: '편안하게 쉬어간 시간',
    color: '#92400E',
    bgColor: '#FDF4EB',
  },
  excited: {
    id: 'excited',
    emoji: '✨',
    label: '설렘',
    desc: '기대감과 활력이 넘쳤던 날',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
  },
  love: {
    id: 'love',
    emoji: '💖',
    label: '온기',
    desc: '주변 사람들과 나눈 다정한 마음',
    color: '#DB2777',
    bgColor: '#FDF2F8',
  },
  proud: {
    id: 'proud',
    emoji: '🏅',
    label: '성취',
    desc: '목표를 실천하고 보람찼던 하루',
    color: '#B45309',
    bgColor: '#FFFBEB',
  },
  growth: {
    id: 'growth',
    emoji: '🌱',
    label: '배움',
    desc: '새로운 지식이나 경험을 얻은 날',
    color: '#15803D',
    bgColor: '#F0FDF4',
  },
  nature: {
    id: 'nature',
    emoji: '🌈',
    label: '산책',
    desc: '맑은 날씨와 바깥 풍경을 즐긴 시간',
    color: '#0284C7',
    bgColor: '#F0F9FF',
  },
  special: {
    id: 'special',
    emoji: '🎁',
    label: '특별함',
    desc: '기억에 오래 남을 특별한 사건',
    color: '#9333EA',
    bgColor: '#FAF5FF',
  },
};

export const STICKER_LIST = Object.values(STICKERS);

export interface BucketCategoryMeta {
  id: string;
  label: string;
  color?: string;
}

export const BUCKET_CATEGORIES: BucketCategoryMeta[] = [
  { id: 'all', label: '전체' },
  { id: 'travel', label: '여행', color: '#0284C7' },
  { id: 'growth', label: '자기계발', color: '#059669' },
  { id: 'health', label: '건강·운동', color: '#D97706' },
  { id: 'hobby', label: '취미·문화', color: '#7C3AED' },
  { id: 'relationship', label: '가족·관계', color: '#DB2777' },
  { id: 'life', label: '일상·생활', color: '#92400E' },
];
