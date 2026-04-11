import React, { useMemo, useState, useEffect } from 'react';
import type { TaskInput } from '../types';
import { groupTasks, formatReport } from '../utils';
import { Copy, CheckCircle2 } from 'lucide-react';

type ReportPreviewProps = {
  tasks: TaskInput[];
};

export const ReportPreview: React.FC<ReportPreviewProps> = ({ tasks }) => {
  const [includeDate, setIncludeDate] = useState(false);
  const [copied, setCopied] = useState(false);

  const groups = useMemo(() => groupTasks(tasks), [tasks]);
  const isMultiDay = groups.length > 1;

  useEffect(() => {
    if (isMultiDay) {
      setIncludeDate(true);
    }
  }, [isMultiDay]);

  const reportText = useMemo(() => formatReport(groups, includeDate), [groups, includeDate]);

  const handleCopy = async () => {
    if (!reportText) return;
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="glass-panel">
      <h2 className="section-title">Report Preview</h2>
      
      <div className="settings-row">
        <label className="checkbox-label" title={isMultiDay ? "Dates are required when tasks span multiple days" : ""}>
          <input 
            type="checkbox" 
            checked={isMultiDay ? true : includeDate} 
            onChange={(e) => setIncludeDate(e.target.checked)}
            disabled={isMultiDay}
          />
          {isMultiDay ? 'Include Dates (Required for multiple days)' : 'Include Dates'}
        </label>
      </div>

      <div className="preview-area">
        <button className="copy-btn" onClick={handleCopy} disabled={tasks.length === 0}>
          {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <textarea 
          className="report-output" 
          value={reportText} 
          readOnly 
          placeholder="Your formatted report will appear here..."
        />
      </div>
    </div>
  );
};
