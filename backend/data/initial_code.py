APP_JSX = '''import { useState, useEffect } from 'react';
import TaskList from './TaskList';
import AddTask from './AddTask';
import { getTasks, createTask, updateTaskStatus, deleteTask } from './api';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    setLoading(true);
    const data = await getTasks();
    setTasks(data);
    setLoading(false);
  }

  async function handleAddTask(task) {
    const newTask = await createTask(task);
    setTasks(prev => [...prev, newTask]);
  }

  async function handleStatusToggle(taskId) {
    const task = tasks.find(t => t.id === taskId);
    // BUG: skips 'in-progress', goes todo -> done -> todo
    const nextStatus = task.status === 'todo' ? 'done' : 'todo';
    const updated = await updateTaskStatus(taskId, nextStatus);
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
  }

  async function handleDelete(taskId) {
    // BUG: waits for API before updating UI
    await deleteTask(taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'todo') return task.status === 'todo';
    if (filter === 'in-progress') return task.status === 'in-progress';
    if (filter === 'done') return task.status === 'done';
    return true;
  });

  return (
    <div className="app">
      <h1>TaskFlow</h1>
      <AddTask onAdd={handleAddTask} />
      <div className="filters">
        {/* FEAT-002: no count badges */}
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All</button>
        <button onClick={() => setFilter('todo')} className={filter === 'todo' ? 'active' : ''}>Todo</button>
        <button onClick={() => setFilter('in-progress')} className={filter === 'in-progress' ? 'active' : ''}>In Progress</button>
        <button onClick={() => setFilter('done')} className={filter === 'done' ? 'active' : ''}>Done</button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <TaskList tasks={filteredTasks} onStatusToggle={handleStatusToggle} onDelete={handleDelete} />
      )}
    </div>
  );
}
'''

TASK_LIST_JSX = '''export default function TaskList({ tasks, onStatusToggle, onDelete }) {
  if (tasks.length === 0) {
    return <p className="empty">No tasks found.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map(task => (
        <li key={task.id} className={`task-item status-${task.status}`}>
          <div className="task-info">
            <span className="task-title">{task.title}</span>
            {/* FEAT-001: no due date display */}
          </div>
          <div className="task-actions">
            <button
              className="status-btn"
              onClick={() => onStatusToggle(task.id)}
            >
              {task.status}
            </button>
            <button
              className="delete-btn"
              onClick={() => onDelete(task.id)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
'''

ADD_TASK_JSX = '''import { useState } from 'react';

export default function AddTask({ onAdd }) {
  const [title, setTitle] = useState('');
  // FEAT-001: no dueDate field

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim() });
    // FEAT-001: dueDate not passed
    setTitle('');
  }

  return (
    <form className="add-task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Task title..."
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      {/* FEAT-001: no date input */}
      <button type="submit">Add Task</button>
    </form>
  );
}
'''

API_JS = '''// In-memory task database with simulated async delays
let tasks = [
  { id: '1', title: 'Set up project structure', status: 'done' },
  { id: '2', title: 'Build authentication flow', status: 'in-progress' },
  { id: '3', title: 'Write unit tests', status: 'todo' },
  { id: '4', title: 'Review pull requests', status: 'Todo' }, // BUG-002: capital T
  { id: '5', title: 'Update documentation', status: 'todo' },
];

let nextId = 6;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getTasks() {
  await delay(200);
  return [...tasks];
}

export async function createTask(data) {
  await delay(150);
  const task = {
    id: String(nextId++),
    title: data.title,
    status: 'todo',
    dueDate: data.dueDate || null,
  };
  tasks.push(task);
  return { ...task };
}

export async function updateTaskStatus(taskId, newStatus) {
  await delay(150);
  const task = tasks.find(t => t.id === taskId);
  if (!task) throw new Error('Task not found');
  task.status = newStatus;
  return { ...task };
}

export async function deleteTask(taskId) {
  await delay(200);
  tasks = tasks.filter(t => t.id !== taskId);
  return { success: true };
}
'''

INITIAL_FILES = {
    "App.jsx": APP_JSX,
    "TaskList.jsx": TASK_LIST_JSX,
    "AddTask.jsx": ADD_TASK_JSX,
    "api.js": API_JS,
}
