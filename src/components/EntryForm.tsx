import React, { useState } from 'react';
import { Clock, PlusCircle } from 'lucide-react';
import type { TaskInput } from '../types';
import { TimePickerDialog } from './TimePickerDialog';

type EntryFormProps = {
  onAdd: (task: TaskInput) => void | Promise<void>;
  useCustomPicker?: boolean;
};

export const EntryForm: React.FC<EntryFormProps> = ({ onAdd, useCustomPicker = false }) => {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [content, setContent] = useState('');
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime || !content.trim()) return;

    const newTask: TaskInput = {
      id: crypto.randomUUID(),
      date,
      startTime,
      endTime,
      content: content.trim(),
    };

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await onAdd(newTask);
      setStartTime(endTime);
      setEndTime('');
      setContent('');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'タスク追加に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel">
      <h2 className="section-title">タスク記録</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date">日付</label>
          <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={isSubmitting} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start">開始時刻</label>
            {useCustomPicker ? (
              <div className="relative" style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="start"
                  value={startTime}
                  onClick={() => {
                    if (!isSubmitting) setActivePicker('start');
                  }}
                  readOnly
                  placeholder="--:--"
                  style={{ cursor: 'pointer' }}
                  disabled={isSubmitting}
                  required
                />
                <Clock
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            ) : (
              <input type="time" id="start" value={startTime} onChange={(e) => setStartTime(e.target.value)} disabled={isSubmitting} required />
            )}
          </div>
          <div className="form-group">
            <label htmlFor="end">終了時刻</label>
            {useCustomPicker ? (
              <div className="relative" style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="end"
                  value={endTime}
                  onClick={() => {
                    if (!isSubmitting) setActivePicker('end');
                  }}
                  readOnly
                  placeholder="--:--"
                  style={{ cursor: 'pointer' }}
                  disabled={isSubmitting}
                  required
                />
                <Clock
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            ) : (
              <input type="time" id="end" value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={isSubmitting} required />
            )}
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="content">内容</label>
          <input
            type="text"
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="e.g. dc25, python実装"
            disabled={isSubmitting}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          <PlusCircle size={18} />
          {isSubmitting ? '保存中...' : 'タスク追加'}
        </button>
        {submitError ? <p className="form-error">{submitError}</p> : null}
      </form>

      {useCustomPicker && (
        <TimePickerDialog
          isOpen={activePicker !== null}
          value={activePicker === 'start' ? startTime : endTime}
          onClose={() => setActivePicker(null)}
          onChange={(val) => {
            if (activePicker === 'start') setStartTime(val);
            else if (activePicker === 'end') setEndTime(val);
          }}
        />
      )}
    </div>
  );
};
