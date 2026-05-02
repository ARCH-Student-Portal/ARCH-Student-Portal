class GradeService {
    calculateCGPA(enrollments) {
        const totalCredits = enrollments.reduce((sum, e) => sum + e.course.creditHours, 0);
        const totalQualityPoints = enrollments.reduce(
            (sum, e) => sum + (e.course.creditHours * (e.gradePoints ?? 0)), 0
        );
        return totalCredits > 0
            ? parseFloat((totalQualityPoints / totalCredits).toFixed(2))
            : null;
    }

    calculateWeightedPercentage(assessmentsByType, weightage) {
        let total = 0;
        weightage.forEach(w => {
            const assessments = assessmentsByType[w.type] || [];
            if (assessments.length === 0) return;
            const obtained = assessments.reduce((sum, a) => sum + a.obtainedMarks, 0);
            const marks = assessments.reduce((sum, a) => sum + a.totalMarks, 0);
            total += (obtained / marks) * w.percentage;
        });
        return parseFloat(total.toFixed(1));
    }

    groupAssessmentsByType(assessments) {
        const grouped = {};
        assessments.forEach(assessment => {
            if (!grouped[assessment.type]) grouped[assessment.type] = [];
            grouped[assessment.type].push({
                assessmentId: assessment._id,
                title: assessment.title,
                totalMarks: assessment.totalMarks,
                obtainedMarks: assessment.obtainedMarks
            });
        });
        return grouped;
    }
}

module.exports = new GradeService();