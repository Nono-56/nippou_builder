import React, { useState, useEffect } from 'react';
import { EntryForm } from './components/EntryForm';
import { TaskList } from './components/TaskList';
import { ReportPreview } from './components/ReportPreview';
import type { TaskInput } from './types';
import { BookOpenText } from 'lucide-react';

type AppProps = {
  useCustomPicker?: boolean;
};

function App({ useCustomPicker = false }: AppProps) {
  const [tasks, setTasks] = useState<TaskInput[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nippou-tasks');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('nippou-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (task: TaskInput) => {
    setTasks(prev => [...prev, task]);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>
          <BookOpenText className="inline-block mr-2 align-text-bottom text-blue-400" size={36} />
          Nippou Builder
        </h1>
        <p>Smart, elegant, and efficient daily reporting.</p>
        
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
          {!useCustomPicker ? (
            <a href="/pc" className="btn-text" style={{ background: 'rgba(255,255,255,0.05)', display: 'inline-block' }}>💻 Switch to PC Version (Custom Clock)</a>
          ) : (
            <a href="/" className="btn-text" style={{ background: 'rgba(255,255,255,0.05)', display: 'inline-block' }}>📱 Switch to Mobile Version (Native)</a>
          )}
        </div>
      </header>
      
      <EntryForm onAdd={handleAddTask} useCustomPicker={useCustomPicker} />
      
      <TaskList tasks={tasks} onDelete={handleDeleteTask} />
      
      <ReportPreview tasks={tasks} />
    </div>
  );
}

export default App;
