const mongoose = require('mongoose');


//nested schema for schedule slots
const scheduleSchema = new mongoose.Schema({
    day: {type: String, required: true},
    startTime: {type: String, required: true},
    endTime: {type: String , required: true },
    room: {type: String, required: true}
});


// nested schema for sections
const sectionSchema = new mongoose.Schema({
    sectionName: {type: String, required: true},
    teacher: {type: mongoose.Schema.Types.ObjectId,ref: 'Teacher', required: true},
    totalSeats: {type: Number, required: true},
    seatsAvailable: {type: Number, required: true},
    schedule: [scheduleSchema] // array of scheduled slots, not so sure of this one
    //will see it in action to check


});

//main course schema
const courseSchema = new mongoose.Schema({
    courseCode: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    creditHours: {type: Number, required: true},
    department: {type: String, required: true},
    prerequisites: [{type: mongoose.Schema.Types.ObjectId,ref: 'Course' }],
    fee: {type:Number, required: true},
    // cuz diff assesments have diff weightages
    weightage: [{
        type: { type: String, required: true },   // "quiz", "mid", "final", "project"
        percentage: { type: Number, required: true }  //weightage percent
        
    }],
    sections: [sectionSchema]
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;







