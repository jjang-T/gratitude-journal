import React, { useState } from 'react';
import { X, Cloud, Smartphone, Database, Check, Download, Upload, RefreshCw, Copy } from 'lucide-react';
import {
  getSupabaseSettings,
  saveSupabaseSettings,
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA,
} from '../../lib/sync';
import type { SupabaseSettings } from '../../types';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncNow: () => Promise<void>;
  isSyncing: boolean;
  onExport: () => void;
  onImport: (json: string) => { success: boolean; message: string };
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  onSyncNow,
  isSyncing,
  onExport,
  onImport,
}) => {
  if (!isOpen) return null;

  const [settings, setSettings] = useState<SupabaseSettings>(getSupabaseSettings);
  const [testResult, setTestResult] = useState<{ success?: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSaveSettings = () => {
    saveSupabaseSettings(settings);
    alert('동기화 설정이 저장되었습니다.');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(settings.supabaseUrl, settings.supabaseAnonKey);
    setTestResult(res);
    setIsTesting(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = onImport(content);
        alert(res.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cloud size={22} color="var(--accent-primary)" />
            <h3 className="modal-title">웹 & iOS 실시간 동기화 설정</h3>
          </div>
          <button className="icon-btn" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* iOS App Guide */}
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', fontWeight: 700, marginBottom: '6px' }}>
              <Smartphone size={18} />
              <span>아이폰(iOS)에서 앱처럼 바로 사용하기</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#166534', lineHeight: 1.5 }}>
              아이폰 Safari 브라우저에서 이 웹사이트에 접속한 후, 하단 <strong>[공유(Share) 버튼]</strong>을 누르고 <strong>[홈 화면에 추가]</strong>를 누르시면 상단 주소창이 사라진 네이티브 앱 형태로 즉시 사용하실 수 있습니다!
            </p>
          </div>

          {/* Cloud Database (Supabase) settings */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className="form-label" style={{ margin: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Database size={16} /> Supabase 클라우드 데이터베이스 연동
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.syncEnabled}
                  onChange={(e) => setSettings({ ...settings, syncEnabled: e.target.checked })}
                />
                <span>실시간 클라우드 동기화 활성화</span>
              </label>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              무료 Supabase 프로젝트를 생성하면 웹 브라우저와 아이폰 간 모든 일기/버킷리스트가 실시간으로 동기화됩니다.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Project URL</label>
            <input
              type="text"
              className="form-input"
              placeholder="https://xxxxxxxx.supabase.co"
              value={settings.supabaseUrl}
              onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value.trim() })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Anon / Public API Key</label>
            <input
              type="password"
              className="form-input"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={settings.supabaseAnonKey}
              onChange={(e) => setSettings({ ...settings, supabaseAnonKey: e.target.value.trim() })}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleTestConnection}
              disabled={isTesting}
              style={{ fontSize: '0.84rem' }}
            >
              {isTesting ? '연결 확인 중...' : '연결 테스트'}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveSettings}
              style={{ fontSize: '0.84rem' }}
            >
              설정 저장
            </button>
            {settings.syncEnabled && (
              <button
                type="button"
                className="btn-secondary"
                onClick={onSyncNow}
                disabled={isSyncing}
                style={{ fontSize: '0.84rem', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? '동기화 중...' : '지금 동기화'}
              </button>
            )}
          </div>

          {testResult && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.84rem',
                backgroundColor: testResult.success ? '#ECFDF5' : '#FEF2F2',
                color: testResult.success ? '#065F46' : '#991B1B',
                border: `1px solid ${testResult.success ? '#A7F3D0' : '#FECACA'}`,
              }}
            >
              {testResult.message}
            </div>
          )}

          {/* SQL Copy Box */}
          <div style={{ background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)', padding: '12px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Supabase SQL 스키마 (클릭하여 복사)
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="btn-secondary"
                style={{ padding: '3px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copiedSql ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                {copiedSql ? '복사됨!' : 'SQL 복사'}
              </button>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
              Supabase 대시보드의 <strong>SQL Editor</strong>에 붙여넣고 <strong>Run</strong>을 누르면 테이블이 3초 만에 생성됩니다.
            </p>
          </div>

          {/* Local Backup & Restore */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px' }}>
            <label className="form-label" style={{ marginBottom: '8px' }}>
              로컬 데이터 수동 백업 및 복원 (JSON)
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onExport}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem' }}
              >
                <Download size={15} /> 데이터 파일로 백업 (내보내기)
              </button>
              <label
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', cursor: 'pointer', margin: 0 }}
              >
                <Upload size={15} /> 백업 파일 복원
                <input
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleFileImport}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
