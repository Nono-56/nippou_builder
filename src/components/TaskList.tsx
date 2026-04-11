import React from 'react';
import type { TaskInput } from '../types';
import { Trash2 } from 'lucide-react';

type TaskListProps = {
  tasks: TaskInput[];
  onDelete: (id: string) => void;
};

export const TaskList: React.FC<TaskListProps> = ({ tasks, onDelete }) => {
  return (
    <div className="glass-panel">
      <h2 className="section-title">Today's Entries</h2>
      {tasks.length === 0 ? (
        <div className="empty-state">No tasks recorded yet.</div>
      ) : (
        <div className="task-list">
          {tasks.map(task => (
            <div key={task.id} className="task-item">
              <div className="task-info">
                <span className="task-content">{task.content}</span>
                <span className="task-time">
                  {task.date} | {task.startTime} - {task.endTime}
                </span>
              </div>
              <button 
                className="btn-icon" 
                onClick={() => onDelete(task.id)}
                title="Delete task"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
