import React, { useState, useEffect } from 'react';

type Props = {
  isOpen: boolean;
  value: string; // HH:mm
  onClose: () => void;
  onChange: (val: string) => void;
};

export const TimePickerDialog: React.FC<Props> = ({ isOpen, value, onClose, onChange }) => {
  const [mode, setMode] = useState<'hours' | 'minutes'>('hours');
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');

  useEffect(() => {
    if (isOpen) {
      if (value) {
        const [h, m] = value.split(':');
        setHours(h || '00');
        setMinutes(m || '00');
      } else {
        setHours('00');
        setMinutes('00');
      }
      setMode('hours');
    }
  }, [isOpen, value]);

  if (!isOpen) return null;

  const handleHourSelect = (h: number) => {
    setHours(h.toString().padStart(2, '0'));
    setMode('minutes');
  };

  const handleMinuteSelect = (m: number) => {
    setMinutes(m.toString().padStart(2, '0'));
  };

  const submit = () => {
    onChange(`${hours}:${minutes}`);
    onClose();
  };

  // 12 is at top (-90 degrees)
  const getPos = (index: number, total: number, radiusPercent: number) => {
    const angle = (index / total) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const x = 50 + radiusPercent * Math.cos(rad);
    const y = 50 + radiusPercent * Math.sin(rad);
    return { left: `${x}%`, top: `${y}%` };
  };

  const outerHours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const innerHours = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  const minuteOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const currentHourNum = parseInt(hours, 10);
  const currentMinNum = parseInt(minutes, 10);

  return (
    <div className="time-picker-overlay" onClick={onClose}>
      <div className="time-picker-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="time-picker-header">
          <span 
            className={`time-display ${mode === 'hours' ? 'active' : ''}`}
            onClick={() => setMode('hours')}
          >
            {hours}
          </span>
          <span className="time-separator">:</span>
          <span 
            className={`time-display ${mode === 'minutes' ? 'active' : ''}`}
            onClick={() => setMode('minutes')}
          >
            {minutes}
          </span>
        </div>
        
        <div className="clock-face-container">
          <div className="clock-face">
            <div className="clock-center"></div>

            {mode === 'hours' && (
              <>
                {outerHours.map((h, i) => (
                  <button
                    key={'out' + h}
                    className={`clock-number ${currentHourNum === (h === 24 ? 0 : h) && (h !== 0) && (currentHourNum !== 0 || hours !== '00') ? 'active' : ''}`}
                    style={getPos(i, 12, 40)}
                    onClick={() => handleHourSelect(h === 24 ? 0 : h)}
                  >
                    {h}
                  </button>
                ))}
                {innerHours.map((h, i) => (
                  <button
                    key={'in' + h}
                    className={`clock-number inner ${currentHourNum === h && ((h === 0 && hours === '00') || h !== 0) ? 'active' : ''}`}
                    style={getPos(i, 12, 23)}
                    onClick={() => handleHourSelect(h)}
                  >
                    {h === 0 ? '00' : h}
                  </button>
                ))}
              </>
            )}

            {mode === 'minutes' && (
              <>
                {minuteOptions.map((m, i) => (
                  <button
                    key={'min' + m}
                    className={`clock-number ${currentMinNum === m ? 'active' : ''}`}
                    style={getPos(i, 12, 40)}
                    onClick={() => handleMinuteSelect(m)}
                  >
                    {m.toString().padStart(2, '0')}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="time-picker-actions">
          <button className="btn-text" onClick={onClose}>Cancel</button>
          <button className="btn-text primary" onClick={submit}>OK</button>
        </div>
      </div>
    </div>
  );
};
