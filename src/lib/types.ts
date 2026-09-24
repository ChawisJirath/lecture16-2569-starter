// นักศึกษา 1 คน
interface Student {
  studentId: string;
  firstName: string;
  lastName: string;
  program: "CPE" | "ISNE";
}
export type { Student };

// วิชาที่เปิดสอน 1 วิชา
interface Course {
  courseId: string;
  courseTitle: string;
  instructors: string[];
}
export type { Course };

interface Enrollment {
  studentId: string;
  courseId: string;
}
export type { Enrollment };