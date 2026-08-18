const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ['Picker', 'Packer', 'QC', 'Dispatch'] },
    status: { type: String, required: true, enum: ['IDLE', 'BUSY', 'OFFLINE'], default: 'IDLE' },
    activeTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    completedTasksCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Worker', workerSchema);
