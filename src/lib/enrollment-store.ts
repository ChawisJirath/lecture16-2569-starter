import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  students as initialStudents,
  courses as initialCourses,
  enrollments as initialEnrollments,
} from "@/lib/mock-data";
import type { Course, Enrollment, Student } from "@/lib/types";

// (1) รูปร่างของ store — ข้อมูล 3 ก้อน + action 2 ตัว (เหมือนเดิมทุกประการ)
type EnrollmentStore = {
  students: Student[];
  courses: Course[];
  enrollments: Enrollment[];
  /** ลงทะเบียนวิชาให้นักศึกษา (ถ้ามีอยู่แล้วไม่ใส่ซ้ำ) */
  enroll: (studentId: string, courseId: string) => void;
  /** ยกเลิกการลงทะเบียน */
  drop: (studentId: string, courseId: string) => void;
};

// (2) create() สร้าง hook พร้อมใช้ในบรรทัดเดียว — ไม่ต้องมี Context, ไม่ต้องมี
// Provider component, ไม่ต้องเขียน custom hook โยน error เองเหมือน Context
export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set) => ({
      students: initialStudents,
      courses: initialCourses,
      enrollments: initialEnrollments,

      enroll: (studentId, courseId) =>
        set((state) => ({
          enrollments: state.enrollments.some(
            (e) => e.studentId === studentId && e.courseId === courseId,
          )
            ? state.enrollments
            : [...state.enrollments, { studentId, courseId }],
        })),

      drop: (studentId, courseId) =>
        set((state) => ({
          enrollments: state.enrollments.filter(
            (e) => !(e.studentId === studentId && e.courseId === courseId),
          ),
        })),
    }),
    {
      name: "enrollment-storage",
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    },
  ),
);
