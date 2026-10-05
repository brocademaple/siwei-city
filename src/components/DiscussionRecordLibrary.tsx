import { useMemo, useState } from 'react';
import type { DiscussionRecord, DiscussionRecordStatus } from '../types';
import { discussionGenerationLabel } from '../lib/discussionRecords';
import { MarkdownRenderer } from './MarkdownRenderer';

type RecordTab = 'report' | 'action' | 'process';
type RecordFilter = 'active' | DiscussionRecordStatus;

interface DiscussionRecordLibraryProps {
  records: DiscussionRecord[];
  onStatusChange: (id: string, status: DiscussionRecordStatus) => void;
  title?: string;
  description?: string | null;
  compact?: boolean;
}

export function DiscussionRecordLibrary({ records, onStatusChange, title = '讨论记录', description = '每一张卡保留一场讨论的报告、行动与过程。', compact = false }: DiscussionRecordLibraryProps) {
  const [filter, setFilter] = useState<RecordFilter>('active');
  const [activeRecordId, setActiveRecordId] = useState<string | null>(records[0]?.id ?? null);
  const [activeTab, setActiveTab] = useState<RecordTab>('report');
  const visibleRecords = useMemo(
    () => records.filter((record) => (filter === 'active' ? record.status !== 'rejected' : record.status === filter)),
    [filter, records],
  );
  const activeRecord = visibleRecords.find((record) => record.id === activeRecordId) ?? visibleRecords[0] ?? null;
  const parentRecord = activeRecord?.parentRecordId ? records.find((record) => record.id === activeRecord.parentRecordId) ?? null : null;

  return (
    <section className={compact ? 'discussion-library compact' : 'discussion-library'}>
      <header className="discussion-library-head">
        <div>
          <span className="section-title">{title}</span>
          {description && <p>{description}</p>}
        </div>
        <div className="record-filters" aria-label="记录状态筛选">
          {filterButton('active', '进行中', filter, setFilter)}
          {filterButton('pending', '待确认', filter, setFilter)}
          {filterButton('confirmed', '已确认', filter, setFilter)}
          {filterButton('rejected', '已否决', filter, setFilter)}
        </div>
      </header>

      <div className="discussion-library-layout">
        <div className="record-card-list" aria-label="讨论记录列表">
          {visibleRecords.length === 0 ? (
            <article className="record-library-empty">
              <strong>{filter === 'rejected' ? '没有已否决记录' : '还没有讨论记录'}</strong>
              <p>完成一轮居民讨论后，记录会自动暂存到这里。</p>
            </article>
          ) : (
            visibleRecords.map((record) => (
              <button
                className={activeRecord?.id === record.id ? 'discussion-record-card active' : 'discussion-record-card'}
                key={record.id}
                type="button"
                onClick={() => {
                  setActiveRecordId(record.id);
                  setActiveTab('report');
                }}
              >
                <span className={`record-status ${record.status}`}>{statusLabel(record.status)}</span>
                <strong>{record.topic}</strong>
                <p>{record.summary}</p>
                <small>{record.parentRecordId ? '围绕上一轮追问 · ' : ''}{discussionGenerationLabel(record.generation)}</small>
                <small>{formatRecordTime(record.updatedAt)} · {record.participantRoles.length} 席 · {record.actionCount} 项行动</small>
              </button>
            ))
          )}
        </div>

        {activeRecord && (
          <article className="record-reader">
            <header>
              <div>
                <span className={`record-status ${activeRecord.status}`}>{statusLabel(activeRecord.status)}</span>
                <h2>{activeRecord.topic}</h2>
                <div className="record-reader-meta">
                  <span>{parentRecord ? `追问自：${parentRecord.topic}` : '独立讨论'}</span>
                  <span>{discussionGenerationLabel(activeRecord.generation)}</span>
                </div>
              </div>
              {activeRecord.status === 'pending' && (
                <div className="record-resolution-actions">
                  <button type="button" onClick={() => onStatusChange(activeRecord.id, 'rejected')}>否决</button>
                  <button className="primary-action" type="button" onClick={() => onStatusChange(activeRecord.id, 'confirmed')}>确认记录</button>
                </div>
              )}
            </header>
            <div className="record-reader-tabs" role="tablist" aria-label="讨论记录内容">
              {tabButton('report', '报告', activeTab, setActiveTab)}
              {tabButton('action', '行动', activeTab, setActiveTab)}
              {tabButton('process', '过程', activeTab, setActiveTab)}
            </div>
            <div className="record-reader-body">
              <MarkdownRenderer source={activeRecord.docs[activeTab].body} />
            </div>
          </article>
        )}
      </div>
    </section>
  );
}

function filterButton(value: RecordFilter, label: string, active: RecordFilter, onChange: (value: RecordFilter) => void) {
  return <button className={value === active ? 'active' : ''} key={value} type="button" onClick={() => onChange(value)}>{label}</button>;
}

function tabButton(value: RecordTab, label: string, active: RecordTab, onChange: (value: RecordTab) => void) {
  return <button className={value === active ? 'active' : ''} key={value} type="button" role="tab" aria-selected={value === active} onClick={() => onChange(value)}>{label}</button>;
}

export function statusLabel(status: DiscussionRecordStatus) {
  if (status === 'confirmed') return '已确认';
  if (status === 'rejected') return '已否决';
  return '待确认';
}

function formatRecordTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN', { hour12: false, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
