// The State pattern allows an object to alter its behavior
// when its internal state changes.
// Here an Enrollment moves through states:
// ACTIVE → COMPLETED or ACTIVE → DROPPED

class EnrollmentState {
    constructor(enrollment) {
        this.enrollment = enrollment;
        this.state = this._resolveState(enrollment);
    }

    _resolveState(enrollment) {
        if (enrollment.isCompleted) return new CompletedState(this);
        if (enrollment.isDropped) return new DroppedState(this);
        return new ActiveState(this);
    }

    getState() {
        return this.state.getName();
    }

    complete(letterGrade, gradePoints) {
        return this.state.complete(letterGrade, gradePoints);
    }

    drop() {
        return this.state.drop();
    }

    reactivate() {
        return this.state.reactivate();
    }
}

class ActiveState {
    constructor(context) {
        this.context = context;
    }

    getName() { return 'ACTIVE'; }

    async complete(letterGrade, gradePoints) {
        const enrollment = this.context.enrollment;
        enrollment.isCompleted = true;
        enrollment.letterGrade = letterGrade;
        enrollment.gradePoints = gradePoints;
        await enrollment.save();
        this.context.state = new CompletedState(this.context);
        return { message: 'Enrollment completed', state: 'COMPLETED' };
    }

    async drop() {
        const enrollment = this.context.enrollment;
        enrollment.isDropped = true;
        await enrollment.save();
        this.context.state = new DroppedState(this.context);
        return { message: 'Enrollment dropped', state: 'DROPPED' };
    }

    reactivate() {
        throw new Error('Enrollment is already active');
    }
}

class CompletedState {
    constructor(context) {
        this.context = context;
    }

    getName() { return 'COMPLETED'; }

    complete() {
        throw new Error('Enrollment is already completed');
    }

    drop() {
        throw new Error('Cannot drop a completed enrollment');
    }

    async reactivate() {
        const enrollment = this.context.enrollment;
        enrollment.isCompleted = false;
        enrollment.letterGrade = null;
        enrollment.gradePoints = null;
        await enrollment.save();
        this.context.state = new ActiveState(this.context);
        return { message: 'Enrollment reactivated', state: 'ACTIVE' };
    }
}

class DroppedState {
    constructor(context) {
        this.context = context;
    }

    getName() { return 'DROPPED'; }

    complete() {
        throw new Error('Cannot complete a dropped enrollment');
    }

    drop() {
        throw new Error('Enrollment is already dropped');
    }

    async reactivate() {
        const enrollment = this.context.enrollment;
        enrollment.isDropped = false;
        await enrollment.save();
        this.context.state = new ActiveState(this.context);
        return { message: 'Enrollment reactivated', state: 'ACTIVE' };
    }
}

module.exports = EnrollmentState;