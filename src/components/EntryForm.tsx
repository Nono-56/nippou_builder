import React, { useState } from 'react';
import type { TaskInput } from '../types';
import { PlusCircle, Clock } from 'lucide-react';
import { TimePickerDialog } from './TimePickerDialog';

type EntryFormProps = {
  onAdd: (task: TaskInput) => void;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime || !content.trim()) return;

    const newTask: TaskInput = {
      id: crypto.randomUUID(),
      date,
      startTime,
      endTime,
      content: content.trim(),
    };

    onAdd(newTask);

    setStartTime(endTime);
    setEndTime('');
    setContent('');
  };

  return (
    <div className="glass-panel">
      <h2 className="section-title">Record Task</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input 
            type="date" 
            id="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            required 
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start">Start Time</label>
            {useCustomPicker ? (
              <div className="relative" style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  id="start" 
                  value={startTime} 
                  onClick={() => setActivePicker('start')}
                  readOnly
                  placeholder="--:--"
                  style={{ cursor: 'pointer' }}
                  required 
                />
                <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
              </div>
            ) : (
              <input 
                type="time" 
                id="start" 
                value={startTime} 
                onChange={e => setStartTime(e.target.value)} 
                required 
              />
            )}
          </div>
          <div className="form-group">
            <label htmlFor="end">End Time</label>
            {useCustomPicker ? (
              <div className="relative" style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  id="end" 
                  value={endTime} 
                  onClick={() => setActivePicker('end')}
                  readOnly
                  placeholder="--:--"
                  style={{ cursor: 'pointer' }}
                  required 
                />
                <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
              </div>
            ) : (
              <input 
                type="time" 
                id="end" 
                value={endTime} 
                onChange={e => setEndTime(e.target.value)} 
                required 
              />
            )}
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="content">Task</label>
          <input 
            type="text" 
            id="content" 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            placeholder="e.g. dc25, python実装" 
            required 
          />
        </div>
        <button type="submit" className="btn btn-primary">
          <PlusCircle size={18} />
          Add Task
        </button>
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
