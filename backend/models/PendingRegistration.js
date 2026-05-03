const mongoose = require('mongoose');

const PendingRegistrationSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  password:  { type: String, required: true },           // bcrypt hashed
  status:    { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectedAt: { type: Date },
  approvedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('PendingRegistration', PendingRegistrationSchema);