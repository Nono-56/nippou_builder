import React from 'react';
import { Trash2 } from 'lucide-react';
import type { TaskInput } from '../types';

type TaskListProps = {
  tasks: TaskInput[];
  onDelete: (id: string) => void | Promise<void>;
};

export const TaskList: React.FC<TaskListProps> = ({ tasks, onDelete }) => {
  return (
    <div className="glass-panel">
      <h2 className="section-title">タスク一覧</h2>
      {tasks.length === 0 ? (
        <div className="empty-state">まだタスクがありません。</div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div key={task.id} className="task-item">
              <div className="task-info">
                <span className="task-content">{task.content}</span>
                <span className="task-time">
                  {task.date} | {task.startTime} - {task.endTime}
                </span>
              </div>
              <button
                className="btn-icon"
                onClick={() => {
                  void onDelete(task.id);
                }}
                title="タスクを削除"
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
