import { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
import StudentApi from "./config/studentApi";

// ── CONTEXT ───────────────────────────────────────────────────────────────────
const CourseContext = createContext(null);

// ── CURRENT SEMESTER (used for enroll calls) ──────────────────────────────────
const CURRENT_SEMESTER = "Spring 2025";

// ── MANDATORY COURSE CODES ────────────────────────────────────────────────────
const MANDATORY_COURSES = ["CS-3001", "CS-2012"];
const MIN_CREDITS = 12;
const MAX_CREDITS = 18;

// ── PURE SELECTOR FUNCTIONS ───────────────────────────────────────────────────
export function getTotalCredits(enrolled) {
    return enrolled.reduce((acc, c) => acc + (c.credits ?? 0), 0);
}

export function getTotalTuition(enrolled) {
    return enrolled.reduce((acc, c) => acc + (c.price ?? 0), 0);
}

export function validateRegistration(enrolled) {
    const totalCredits = getTotalCredits(enrolled);
    return {
        creditExceeded:     totalCredits > MAX_CREDITS,
        creditInsufficient: totalCredits < MIN_CREDITS,
        mandatoryMissing:   MANDATORY_COURSES.filter(code => !enrolled.some(e => e.code === code)),
        prerequisiteErrors: enrolled.filter(c => c.req && !enrolled.some(e => e.code === c.req)),
    };
}

// ── SHAPE HELPERS ─────────────────────────────────────────────────────────────
function adaptEnrolledCourse(c, idx) {
    const section  = c.section ?? "";
    const schedule = c.schedule ?? [];
    const time     = schedule.length > 0
        ? `${schedule[0].day} ${schedule[0].startTime}${schedule[0].endTime ? " – " + schedule[0].endTime : ""}`
        : "";
    return {
        id:           c.enrollmentId ?? c.courseCode ?? `e-${idx}`,
        enrollmentId: c.enrollmentId ?? null,
        code:         c.courseCode   ?? "",
        name:         c.name         ?? "",
        credits:      c.creditHours  ?? 3,
        price:        c.fee          ?? 0,
        prof:         c.teacher?.name ?? "",
        slot:         section,
        time,
        mandatory:    MANDATORY_COURSES.includes(c.courseCode),
    };
}

function adaptAvailableCourse(course) {
    return course.sections.map((sec, idx) => ({
        id:          `${course.courseCode}-${sec.sectionId ?? idx}`,
        courseId:    course.courseId,
        sectionId:   sec.sectionId,
        code:        course.courseCode,
        name:        course.name,
        credits:     course.creditHours,
        price:       course.fee,
        prof:        sec.teacher   ?? "",
        slot:        sec.sectionName ?? "",
        time:        sec.schedule?.length > 0
            ? `${sec.schedule[0].day} ${sec.schedule[0].startTime}${sec.schedule[0].endTime ? " – " + sec.schedule[0].endTime : ""}`
            : "",
        seats:       sec.seatsAvailable ?? 0,
        maxSeats:    sec.totalSeats     ?? 0,
        mandatory:   MANDATORY_COURSES.includes(course.courseCode),
        req:         course.prerequisites?.length > 0 ? course.prerequisites[0] : null,
        prereqMet:   course.prereqMet ?? true,
        schedule:    sec.schedule ?? [],
        department:  course.department ?? "",
    }));
}

// ── PROVIDER ──────────────────────────────────────────────────────────────────
export function CourseProvider({ children }) {
    const [enrolled,      setEnrolled]      = useState([]);
    const [availablePool, setAvailablePool] = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [error,         setError]         = useState(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [enrolledRes, availableRes] = await Promise.all([
                StudentApi.getCourses(),
                StudentApi.getAvailableCourses(),
            ]);

            const enrolledList = (enrolledRes?.courses ?? []).map(adaptEnrolledCourse);
            setEnrolled(enrolledList);

            const enrolledCodes = new Set(enrolledList.map(c => c.code));
            const availableList = (availableRes?.courses ?? [])
                .filter(c => !enrolledCodes.has(c.courseCode))
                .flatMap(adaptAvailableCourse);
            setAvailablePool(availableList);

        } catch (err) {
            console.error("CourseContext fetch error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ── ENROLL ────────────────────────────────────────────────────────────────
    const enrollCourse = useCallback(async (course) => {
        const res = await StudentApi.enrollCourse(
            course.courseId,
            course.sectionId,
            CURRENT_SEMESTER
        );
        if (res.message && res.message !== "Enrolled successfully") {
            throw new Error(res.message);
        }
        // Remove from available immediately
        setAvailablePool(prev => prev.filter(c => c.code !== course.code));
        // Re-fetch enrolled to get proper enrollmentId from backend
        const enrolledRes = await StudentApi.getCourses();
        setEnrolled((enrolledRes?.courses ?? []).map(adaptEnrolledCourse));
        return res;
    }, []);

    // ── DROP ──────────────────────────────────────────────────────────────────
    const dropCourse = useCallback(async (course) => {
        if (!course.enrollmentId) throw new Error("No enrollment ID — cannot drop");
        const res = await StudentApi.dropCourse(course.enrollmentId);
        if (res.message && res.message !== "Course dropped successfully") {
            throw new Error(res.message);
        }
        // Remove from enrolled immediately
        setEnrolled(prev => prev.filter(c => c.id !== course.id));
        // Re-fetch available + enrolled to get fresh seat counts
        const [enrolledRes, availableRes] = await Promise.all([
            StudentApi.getCourses(),
            StudentApi.getAvailableCourses(),
        ]);
        const newEnrolledList = (enrolledRes?.courses ?? []).map(adaptEnrolledCourse);
        const newEnrolledCodes = new Set(newEnrolledList.map(c => c.code));
        setEnrolled(newEnrolledList);
        setAvailablePool(
            (availableRes?.courses ?? [])
                .filter(c => !newEnrolledCodes.has(c.courseCode))
                .flatMap(adaptAvailableCourse)
        );
        return res;
    }, []);

    const contextValue = useMemo(() => ({
        enrolled,
        availablePool,
        loading,
        error,
        enrollCourse,
        dropCourse,
        refetch: fetchAll,
        getTotalCredits:      () => getTotalCredits(enrolled),
        getTotalTuition:      () => getTotalTuition(enrolled),
        validateRegistration: () => validateRegistration(enrolled),
    }), [enrolled, availablePool, loading, error, enrollCourse, dropCourse, fetchAll]);

    return (
        <CourseContext.Provider value={contextValue}>
            {children}
        </CourseContext.Provider>
    );
}

// ── PRIMARY HOOK ──────────────────────────────────────────────────────────────
export function useCourses() {
    const ctx = useContext(CourseContext);
    if (!ctx) throw new Error("useCourses must be used inside <CourseProvider>");
    return ctx;
}

// ── OBSERVER HOOK: ENROLLED STATS ─────────────────────────────────────────────
export function useEnrolledStats(enrolledOverride = null) {
    const ctx = useCourses();
    const enrolled = enrolledOverride !== null ? enrolledOverride : ctx.enrolled;
    return useMemo(() => ({
        totalCredits: getTotalCredits(enrolled),
        totalTuition: getTotalTuition(enrolled),
        ...validateRegistration(enrolled),
    }), [enrolled]);
}

// ── OBSERVER HOOK: AVAILABLE FILTERED ─────────────────────────────────────────
export function useAvailableFiltered(searchQuery = "", enrolledOverride = null) {
    const ctx = useContext(CourseContext);
    if (!ctx) throw new Error("useCourses must be used inside <CourseProvider>");
    const enrolled = enrolledOverride ?? ctx.enrolled;

    return useMemo(() => {
        // Built inside useMemo so they recompute whenever enrolled or availablePool changes
        const enrolledCodes = new Set(enrolled.map(e => e.code));
        const enrolledSlots = new Set(enrolled.map(e => e.slot).filter(Boolean));

        return ctx.availablePool
            .filter(c => !enrolledCodes.has(c.code))
            .map(course => {
                let status    = course.seats >= course.maxSeats ? "full" : "open";
                let clashWith = null;
                if (enrolledSlots.has(course.slot) && course.slot) {
                    const clashCourse = enrolled.find(e => e.slot === course.slot);
                    status    = "clash";
                    clashWith = clashCourse?.code ?? null;
                } else if (!course.prereqMet) {
                    status = "locked";
                }
                return { ...course, status, clashWith };
            })
            .filter(course => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return (
                    course.code.toLowerCase().includes(q) ||
                    course.name.toLowerCase().includes(q) ||
                    course.prof.toLowerCase().includes(q) ||
                    course.slot.toLowerCase().includes(q)
                );
            });
    }, [ctx.availablePool, enrolled, searchQuery]);
}

// ── MARKS_DATA kept as empty export so StudentMarks import doesn't break ──────
export const MARKS_DATA = {};