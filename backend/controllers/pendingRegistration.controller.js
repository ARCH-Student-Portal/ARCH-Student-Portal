const PendingRegistration = require('../models/PendingRegistration');
const Student = require('../models/Student'); // adjust path if different

// GET /admin/pending-registrations
async function getPendingRegistrations(req, res) {
  try {
    const pending = await PendingRegistration.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.status(200).json({ pending });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// POST /admin/pending-registrations/:id/approve
async function approveRegistration(req, res) {
  try {
    const { id } = req.params;
    const { rollNumber, program, department, semester, section, batch, phone } = req.body;

    if (!rollNumber || !rollNumber.trim()) {
      return res.status(400).json({ message: 'Roll number is required to approve' });
    }
    if (!department || !department.trim()) {
      return res.status(400).json({ message: 'Department is required to create student account' });
    }
    if (!program || !program.trim()) {
      return res.status(400).json({ message: 'Program is required to create student account' });
    }
    if (!semester || !semester.toString().trim()) {
      return res.status(400).json({ message: 'Semester is required to create student account' });
    }

    const pending = await PendingRegistration.findById(id);
    if (!pending) return res.status(404).json({ message: 'Pending registration not found' });
    if (pending.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    // Check roll number not already taken
    const rollExists = await Student.findOne({ rollNumber: rollNumber.trim() });
    if (rollExists) {
      return res.status(409).json({ message: `Roll number ${rollNumber} already assigned to another student` });
    }

    // Create the student using the hashed password from signup
    const student = await Student.create({
      rollNumber:  rollNumber.trim(),
      name:        pending.name,
      password:    pending.password,   // already bcrypt-hashed from signup
      program:     program,
      department:  department,
      semester:    semester,
      section:     section || null,
      batch:       batch || null,
      phone:       phone || null,
    });

    // Mark pending as approved
    pending.status     = 'approved';
    pending.approvedAt = new Date();
    await pending.save();

    res.status(201).json({
      message: `Student ${pending.name} approved and activated with roll number ${rollNumber}`,
      student,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// POST /admin/pending-registrations/:id/reject
async function rejectRegistration(req, res) {
  try {
    const { id } = req.params;
    const pending = await PendingRegistration.findById(id);
    if (!pending) return res.status(404).json({ message: 'Pending registration not found' });

    pending.status     = 'rejected';
    pending.rejectedAt = new Date();
    await pending.save();

    res.status(200).json({ message: `Registration request for ${pending.name} rejected` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

module.exports = { getPendingRegistrations, approveRegistration, rejectRegistration };
