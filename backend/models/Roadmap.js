const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  userId: {
    type: String, // Firebase UID
    required: true,
    index: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  steps: [{
    id: Number,
    title: {
      type: String,
      required: true
    },
    description: String,
    duration: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    skills: [String],
    resources: [String],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add indexes for faster queries
roadmapSchema.index({ userId: 1, jobId: 1 }, { unique: true });

const Roadmap = mongoose.model('Roadmap', roadmapSchema);

module.exports = Roadmap;