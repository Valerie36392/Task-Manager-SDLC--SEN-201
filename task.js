const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    priority: {
        type: Number,
        enum: [1, 2, 3], // 1: High, 2: Medium, 3: Low
        default: 2
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp before saving
taskSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;