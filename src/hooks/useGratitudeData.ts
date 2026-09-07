import { useState, useEffect, useCallback } from 'react';
import type { DiaryEntry, BucketItem, CalendarEvent } from '../types';
import { INITIAL_DIARIES, INITIAL_BUCKET_ITEMS, INITIAL_EVENTS } from '../data/mockData';
import { getSupabaseClient } from '../lib/sync';

const DIARIES_STORAGE_KEY = 'haru_gratitude_diaries_v1';
const BUCKET_STORAGE_KEY = 'haru_gratitude_buckets_v1';
const EVENTS_STORAGE_KEY = 'haru_gratitude_events_v1';

export function useGratitudeData() {
  const [diaries, setDiaries] = useState<DiaryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(DIARIES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse diaries from localStorage', e);
    }
    return INITIAL_DIARIES;
  });

  const [bucketItems, setBucketItems] = useState<BucketItem[]>(() => {
    try {
      const saved = localStorage.getItem(BUCKET_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse buckets from localStorage', e);
    }
    return INITIAL_BUCKET_ITEMS;
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse events from localStorage', e);
    }
    return INITIAL_EVENTS;
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Sync to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(DIARIES_STORAGE_KEY, JSON.stringify(diaries));
    } catch (e) {
      console.error('Failed to save diaries to localStorage', e);
    }
  }, [diaries]);

  useEffect(() => {
    try {
      localStorage.setItem(BUCKET_STORAGE_KEY, JSON.stringify(bucketItems));
    } catch (e) {
      console.error('Failed to save buckets to localStorage', e);
    }
  }, [bucketItems]);

  useEffect(() => {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save events to localStorage', e);
    }
  }, [events]);

  // Cloud sync trigger (if Supabase is set up)
  const syncWithCloud = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) return;

    setIsSyncing(true);
    try {
      // 1. Fetch remote diaries
      const { data: remoteDiaries, error: diaryErr } = await client.from('diaries').select('*');
      if (!diaryErr && remoteDiaries && remoteDiaries.length > 0) {
        const formatted: DiaryEntry[] = remoteDiaries.map((r: any) => ({
          id: r.id,
          date: r.date,
          sticker: r.sticker,
          gratitudeItems: r.gratitude_items || [],
          content: r.content || '',
          photos: r.photos || [],
          location: r.location,
          weather: r.weather,
          linkedBucketId: r.linked_bucket_id,
          linkedBucketTitle: r.linked_bucket_title,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
        setDiaries((prev) => {
          const map = new Map(prev.map((d) => [d.id, d]));
          formatted.forEach((d) => map.set(d.id, d));
          return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
        });
      }

      // 2. Fetch remote buckets
      const { data: remoteBuckets, error: bucketErr } = await client.from('bucket_items').select('*');
      if (!bucketErr && remoteBuckets && remoteBuckets.length > 0) {
        const formattedBuckets: BucketItem[] = remoteBuckets.map((r: any) => ({
          id: r.id,
          title: r.title,
          category: r.category,
          targetDate: r.target_date,
          isCompleted: r.is_completed,
          completedAt: r.completed_at,
          notes: r.notes,
        }));
        setBucketItems((prev) => {
          const map = new Map(prev.map((b) => [b.id, b]));
          formattedBuckets.forEach((b) => map.set(b.id, b));
          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Save or update diary
  const saveDiary = useCallback(async (entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const nowIso = new Date().toISOString();
    let updatedEntry: DiaryEntry;

    setDiaries((prev) => {
      const existingIdx = prev.findIndex((d) => (entry.id ? d.id === entry.id : d.date === entry.date));
      if (existingIdx >= 0) {
        updatedEntry = {
          ...prev[existingIdx],
          ...entry,
          id: prev[existingIdx].id,
          updatedAt: nowIso,
        };
        const next = [...prev];
        next[existingIdx] = updatedEntry;
        return next;
      } else {
        updatedEntry = {
          ...entry,
          id: entry.id || `diary-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        return [updatedEntry, ...prev].sort((a, b) => b.date.localeCompare(a.date));
      }
    });

    // Cloud push if connected
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('diaries').upsert({
          id: updatedEntry!.id,
          date: updatedEntry!.date,
          sticker: updatedEntry!.sticker,
          gratitude_items: updatedEntry!.gratitudeItems,
          content: updatedEntry!.content,
          photos: updatedEntry!.photos,
          location: updatedEntry!.location || null,
          weather: updatedEntry!.weather || null,
          linked_bucket_id: updatedEntry!.linkedBucketId || null,
          linked_bucket_title: updatedEntry!.linkedBucketTitle || null,
          updated_at: nowIso,
        });
      } catch (err) {
        console.error('Failed to push diary to cloud:', err);
      }
    }

    return updatedEntry!;
  }, []);

  // Delete diary
  const deleteDiary = useCallback(async (id: string) => {
    setDiaries((prev) => prev.filter((d) => d.id !== id));
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('diaries').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete diary on cloud:', err);
      }
    }
  }, []);

  // --- CALENDAR EVENTS CRUD ---

  // Add event
  const addEvent = useCallback((event: Omit<CalendarEvent, 'id' | 'createdAt' | 'isCompleted'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [...prev, newEvent].sort((a, b) => (a.time || '').localeCompare(b.time || '')));
    return newEvent;
  }, []);

  // Update event
  const updateEvent = useCallback((updated: CalendarEvent) => {
    setEvents((prev) =>
      prev
        .map((ev) => (ev.id === updated.id ? updated : ev))
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
    );
  }, []);

  // Delete event
  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  }, []);

  // Toggle event completion
  const toggleEventComplete = useCallback((id: string) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, isCompleted: !ev.isCompleted } : ev))
    );
  }, []);

  // Mark event as Google synced
  const markEventGoogleSynced = useCallback((id: string, synced: boolean = true) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, isGoogleSynced: synced } : ev))
    );
  }, []);

  // --- BUCKET CRUD ---

  // Add bucket item
  const addBucketItem = useCallback(async (item: Omit<BucketItem, 'id' | 'isCompleted'>) => {
    const newItem: BucketItem = {
      ...item,
      id: `bucket-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      isCompleted: false,
    };
    setBucketItems((prev) => [newItem, ...prev]);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('bucket_items').insert({
          id: newItem.id,
          title: newItem.title,
          category: newItem.category,
          target_date: newItem.targetDate || null,
          is_completed: false,
          notes: newItem.notes || null,
        });
      } catch (err) {
        console.error('Failed to save bucket to cloud:', err);
      }
    }
    return newItem;
  }, []);

  // Toggle bucket completion
  const toggleBucketItem = useCallback(async (id: string) => {
    let targetUpdated: BucketItem | undefined;

    setBucketItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextCompleted = !item.isCompleted;
          const completedAt = nextCompleted
            ? new Date().toISOString().split('T')[0]
            : undefined;
          targetUpdated = { ...item, isCompleted: nextCompleted, completedAt };
          return targetUpdated;
        }
        return item;
      })
    );

    const client = getSupabaseClient();
    if (client && targetUpdated) {
      try {
        await client.from('bucket_items').update({
          is_completed: targetUpdated.isCompleted,
          completed_at: targetUpdated.completedAt || null,
        }).eq('id', id);
      } catch (err) {
        console.error('Failed to update bucket status on cloud:', err);
      }
    }

    return targetUpdated;
  }, []);

  // Delete bucket item
  const deleteBucketItem = useCallback(async (id: string) => {
    setBucketItems((prev) => prev.filter((item) => item.id !== id));
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('bucket_items').delete().eq('id', id);
      } catch (err) {
        console.error('Failed to delete bucket on cloud:', err);
      }
    }
  }, []);

  // Export data to JSON file
  const exportData = useCallback(() => {
    const data = {
      exportedAt: new Date().toISOString(),
      diaries,
      bucketItems,
      events,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `haru_gratitude_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [diaries, bucketItems, events]);

  // Import data from JSON
  const importData = useCallback((jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed.diaries)) {
        setDiaries(parsed.diaries);
      }
      if (Array.isArray(parsed.bucketItems)) {
        setBucketItems(parsed.bucketItems);
      }
      if (Array.isArray(parsed.events)) {
        setEvents(parsed.events);
      }
      return { success: true, message: '데이터를 성공적으로 복원했습니다.' };
    } catch (e) {
      return { success: false, message: '올바른 백업 JSON 형식이 아닙니다.' };
    }
  }, []);

  // Reset to initial mock data
  const resetToSample = useCallback(() => {
    setDiaries(INITIAL_DIARIES);
    setBucketItems(INITIAL_BUCKET_ITEMS);
    setEvents(INITIAL_EVENTS);
    localStorage.setItem(DIARIES_STORAGE_KEY, JSON.stringify(INITIAL_DIARIES));
    localStorage.setItem(BUCKET_STORAGE_KEY, JSON.stringify(INITIAL_BUCKET_ITEMS));
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
  }, []);

  return {
    diaries,
    bucketItems,
    events,
    isSyncing,
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
    syncWithCloud,
    exportData,
    importData,
    resetToSample,
  };
}
