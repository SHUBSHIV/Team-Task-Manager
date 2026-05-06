const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  const { title, description, dueDate, projectId, assigneeId } = req.body;
  if (!title || !projectId) {
    return res.status(400).json({ message: 'Title and projectId are required' });
  }
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  const task = new Task({
    title,
    description,
    project: projectId,
    assignee: assigneeId,
    dueDate,
    createdBy: req.user._id
  });
  await task.save();
  res.status(201).json(task);
});

router.get('/', auth, async (req, res) => {
  const tasks = await Task.find()
    .populate('project', 'name')
    .populate('assignee', 'name email')
    .populate('createdBy', 'name');
  res.json(tasks);
});

router.put('/:id', auth, async (req, res) => {
  const updates = ['title', 'description', 'status', 'dueDate', 'assignee'];
  const data = {};
  updates.forEach(field => {
    if (field in req.body) data[field] = req.body[field];
  });
  const task = await Task.findByIdAndUpdate(req.params.id, data, { new: true })
    .populate('project', 'name')
    .populate('assignee', 'name email');
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json({ message: 'Task deleted' });
});

module.exports = router;
