import React, { useEffect, useState } from 'react';
import { get, post, put, remove } from './api';

const initialForm = { name: '', email: '', password: '', role: 'member' };

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [authForm, setAuthForm] = useState(initialForm);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState([]);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', projectId: '', assigneeId: '', dueDate: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('ttm_token');
    if (token) {
      loadUser();
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const saveSession = ({ token, user }) => {
    localStorage.setItem('ttm_token', token);
    setUser(user);
    setMessage('Logged in successfully');
  };

  const loadUser = async () => {
    const response = await get('/auth/me');
    if (response.user) {
      setUser(response.user);
      setView('dashboard');
    }
  };

  const loadData = async () => {
    const [projectsRes, tasksRes, teamRes] = await Promise.all([get('/projects'), get('/tasks'), get('/projects/team')]);
    setProjects(Array.isArray(projectsRes) ? projectsRes : []);
    setTasks(Array.isArray(tasksRes) ? tasksRes : []);
    setTeam(Array.isArray(teamRes) ? teamRes : []);
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    const route = view === 'signup' ? '/auth/signup' : '/auth/login';
    const payload = { name: authForm.name, email: authForm.email, password: authForm.password, role: authForm.role };
    const response = await post(route, payload);
    if (response.token) {
      saveSession(response);
      setView('dashboard');
      loadData();
    } else {
      setMessage(response.message || 'Auth failed');
    }
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();
    const response = await post('/projects', projectForm);
    if (response._id) {
      setProjects([...projects, response]);
      setProjectForm({ name: '', description: '' });
      setMessage('Project created');
    } else {
      setMessage(response.message || 'Could not create project');
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    const response = await post('/tasks', taskForm);
    if (response._id) {
      setTasks([...tasks, response]);
      setTaskForm({ title: '', description: '', projectId: '', assigneeId: '', dueDate: '' });
      setMessage('Task created');
    } else {
      setMessage(response.message || 'Could not create task');
    }
  };

  const updateTaskStatus = async (task, nextStatus) => {
    const response = await put(`/tasks/${task._id}`, { status: nextStatus });
    if (response._id) {
      setTasks(tasks.map((item) => (item._id === response._id ? response : item)));
    }
  };

  const logout = () => {
    localStorage.removeItem('ttm_token');
    setUser(null);
    setProjects([]);
    setTasks([]);
    setView('login');
  };

  if (!user) {
    return (
      <div className="container">
        <h1>Team Task Manager</h1>
        <div className="auth-card">
          <h2>{view === 'signup' ? 'Sign Up' : 'Login'}</h2>
          <form onSubmit={handleAuthSubmit}>
            {view === 'signup' && (
              <input
                type="text"
                placeholder="Full name"
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            />
            {view === 'signup' && (
              <select value={authForm.role} onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            )}
            <button type="submit">{view === 'signup' ? 'Sign Up' : 'Login'}</button>
          </form>
          <button className="link-button" onClick={() => setView(view === 'signup' ? 'login' : 'signup')}>
            {view === 'signup' ? 'Have an account? Login' : 'Create new account'}
          </button>
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <div>
          <h1>Team Task Manager</h1>
          <p>Welcome, {user.name} ({user.role})</p>
        </div>
        <button onClick={logout}>Logout</button>
      </header>

      <section className="grid">
        <div className="card">
          <h2>Projects</h2>
          <ul>
            {projects.map((project) => (
              <li key={project._id}>
                <strong>{project.name}</strong>
                <p>{project.description}</p>
                <span>{project.status}</span>
              </li>
            ))}
          </ul>
          {user.role === 'admin' && (
            <form onSubmit={handleCreateProject} className="small-form">
              <h3>New Project</h3>
              <input value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} placeholder="Name" />
              <textarea value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} placeholder="Description" />
              <button type="submit">Create Project</button>
            </form>
          )}
        </div>

        <div className="card">
          <h2>Tasks</h2>
          <ul>
            {tasks.map((task) => (
              <li key={task._id}>
                <strong>{task.title}</strong>
                <p>{task.description}</p>
                <div className="task-meta">
                  <span>{task.status}</span>
                  <span>{task.project?.name || 'No project'}</span>
                  <span>{task.assignee?.name || 'Unassigned'}</span>
                </div>
                <div className="task-actions">
                  {task.status !== 'done' && (
                    <button onClick={() => updateTaskStatus(task, task.status === 'todo' ? 'in-progress' : 'done')}>
                      Mark {task.status === 'todo' ? 'In Progress' : 'Done'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <form onSubmit={handleCreateTask} className="small-form">
            <h3>New Task</h3>
            <input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Title" />
            <textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Description" />
            <select value={taskForm.projectId} onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}>
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select>
            <select value={taskForm.assigneeId} onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}>
              <option value="">Assign to</option>
              {team.map((member) => (
                <option key={member._id} value={member._id}>{member.name} ({member.role})</option>
              ))}
            </select>
            <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
            <button type="submit">Add Task</button>
          </form>
        </div>
      </section>

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default App;
