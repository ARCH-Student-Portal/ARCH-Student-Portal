const mongoose = require('mongoose');


const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true},
    body: {type: String, required: true},
    createdBy: {type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'createdByModel'},
    createdByModel: {type: String, required: true, enum: ['Teacher', 'Admin'] },
    type: {type: String, required:true, enum: ['university', 'faculty'] },
    course: {type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null}

},{timestamps: true});

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;