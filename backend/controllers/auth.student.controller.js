const bcrypt = require('bcryptjs');
const { StudentAuthTemplate } = require('../patterns/AuthTemplate');
const PendingRegistration = require('../models/PendingRegistration');

class StudentAuthController {
  constructor() {
    this.authTemplate = new StudentAuthTemplate();
  }

  async login(req, res) {
    try {
      const { identifier, password } = req.body;
      const { token, user } = await this.authTemplate.login(identifier, password);
      res.status(200).json({ message: 'Login successful', token, student: user });
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND')   return res.status(404).json({ message: 'Student not found' });
      if (error.message === 'INVALID_PASSWORD') return res.status(401).json({ message: 'Invalid credentials' });
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // signup — name + password only, no email required
  async signup(req, res) {
    try {
      const { name, password } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Full name is required' });
      }
      if (!password) {
        return res.status(400).json({ message: 'Password is required' });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      // Check for duplicate pending request by name (case-insensitive)
      // Using name since no email — still allow re-apply if previously rejected
      const existing = await PendingRegistration.findOne({
        name: { $regex: new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });

      if (existing) {
        if (existing.status === 'pending') {
          return res.status(409).json({ message: 'Request already submitted for this name. Await admin approval.' });
        }
        if (existing.status === 'approved') {
          return res.status(409).json({ message: 'This name already has an approved account. Please log in with your roll number.' });
        }
        // rejected — allow re-apply, delete old record
        await PendingRegistration.deleteOne({ _id: existing._id });
      }

      const hashed = await bcrypt.hash(password, 10);
      await PendingRegistration.create({
        name:     name.trim(),
        password: hashed,
        status:   'pending',
      });

      res.status(201).json({ message: 'Registration request submitted. Await admin approval.' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

const controller = new StudentAuthController();
module.exports = {
  loginStudent:  controller.login.bind(controller),
  signupStudent: controller.signup.bind(controller),
};