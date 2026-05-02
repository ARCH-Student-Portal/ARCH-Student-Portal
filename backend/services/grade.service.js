const calculateCGPA = (enrollments) => {
    const totalCredits = enrollments.reduce((sum, e) => sum + e.course.creditHours, 0);
    const totalQualityPoints = enrollments.reduce(
        (sum, e) => sum + (e.course.creditHours * (e.gradePoints ?? 0)), 0
    );
    return totalCredits > 0
        ? parseFloat((totalQualityPoints / totalCredits).toFixed(2))
        : null;
};

const calculateWeightedPercentage = (assessmentsByType, weightage) => {
    let total = 0;
    weightage.forEach(w => {
        const assessments = assessmentsByType[w.type] || [];
        if (assessments.length === 0) return;
        const obtained = assessments.reduce((sum, a) => sum + a.obtainedMarks, 0);
        const marks = assessments.reduce((sum, a) => sum + a.totalMarks, 0);
        total += (obtained / marks) * w.percentage;
    });
    return parseFloat(total.toFixed(1));
};

module.exports = { calculateCGPA, calculateWeightedPercentage };