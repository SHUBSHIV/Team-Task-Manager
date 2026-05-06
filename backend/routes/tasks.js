const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, dueDate, projectId, assigneeId } = req.body;
    if (!title || !projectId)
      return res.status(400).json({ message: 'Title and projectId are required' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const task = new Task({
      title, description, dueDate,
      project: projectId,
      assignedTo: assigneeId || req.user.id,  // FIX: 'assignee' → 'assignedTo'
      createdBy: req.user.id
    });
    await task.save();
    const populated = await task.populate([
      { path: 'project', select: 'name' },
      { path: 'assignedTo', select: 'name email' }  // FIX: 'assignee' → 'assignedTo'
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('project', 'name')
      .populate('assignedTo', 'name email')  // FIX: 'assignee' → 'assignedTo'
      .populate('createdBy', 'name');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const updates = ['title', 'description', 'status', 'dueDate', 'assignedTo']; // FIX: 'assignee' → 'assignedTo'
    const data = {};
    updates.forEach(field => { if (field in req.body) data[field] = req.body[field]; });
    const task = await Task.findByIdAndUpdate(req.params.id, data, { new: true })
      .populate('project', 'name')
      .populate('assignedTo', 'name email'); // FIX: 'assignee' → 'assignedTo'
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;