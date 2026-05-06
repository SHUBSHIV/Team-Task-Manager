const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

const router = express.Router();

router.post('/', auth, requireRole('admin'), async (req, res) => {
  const { name, description, members } = req.body;
  if (!name) return res.status(400).json({ message: 'Project name is required' });
  const project = new Project({
    name,
    description,
    members: members || [],
    createdBy: req.user._id
  });
  await project.save();
  res.status(201).json(project);
});

router.get('/', auth, async (req, res) => {
  const projects = await Project.find()
    .populate('members', 'name email role')
    .populate('createdBy', 'name email');
  res.json(projects);
});

router.get('/:id', auth, async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('members', 'name email role')
    .populate('createdBy', 'name email');
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json(project);
});

router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  const updates = ['name', 'description', 'status', 'members'];
  const data = {};
  updates.forEach(field => {
    if (field in req.body) data[field] = req.body[field];
  });
  const project = await Project.findByIdAndUpdate(req.params.id, data, { new: true }).populate('members', 'name email role');
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json(project);
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json({ message: 'Project deleted' });
});

router.get('/team', auth, async (req, res) => {
  const users = await User.find({}, 'name email role');
  res.json(users);
});

module.exports = router;
