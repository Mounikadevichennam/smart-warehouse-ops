const mongoose = require('mongoose');
const Worker = require('../models/Worker');
const User = require('../models/User');
const { store } = require('../services/memoryStore');

const getWorkers = async (req, res) => {
  try {
    let workers = [];
    if (mongoose.connection.readyState === 1) {
      workers = await Worker.find().populate('activeTaskId').sort({ role: 1, name: 1 });
    } else {
      workers = store.workers.map((w) => {
        const task = store.tasks.find((t) => t._id === w.activeTaskId);
        return { ...w, activeTaskId: task };
      });
    }
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    let users = [];
    if (mongoose.connection.readyState === 1) {
      users = await User.find().select('-passwordHash').sort({ role: 1, name: 1 });
    } else {
      users = store.users;
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWorkers, getUsers };
