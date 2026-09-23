# lectuer16-starter

```bash
pnpm install
pnpm dev
```

| ขั้นตอน | ทำอะไร                                                            | ไฟล์ที่เกี่ยวข้อง                                                                                         |
| ------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 5       | กำหนด Type และ Mock Data                                          | `src/lib/types.ts`, `src/lib/mock-data.ts`                                                                |
| 6       | Global State ด้วย Zustand                                         | `src/lib/enrollment-store.ts`                                                                             |
| 7       | หน้าแรก + หน้าใหม่ + เมนู + Route                                 | `src/pages/home.tsx`, `src/pages/admin/enrollments.tsx`, `src/components/app-sidebar.tsx`, `src/main.tsx` |
| 8       | ฟอร์มลงทะเบียนแบบ Dialog (Popup)                                  | `src/pages/admin/enrollments.tsx`                                                                         |
| 9       | ตารางการลงทะเบียน (1 แถว/1 รายการ)                                | `src/pages/admin/enrollments.tsx`                                                                         |
| 10      | Tabs กรองข้อมูล ตามวิชา / ตามนักศึกษา                             | `src/pages/admin/enrollments.tsx`                                                                         |
| 11      | เก็บ `students`/`courses` ลง Local Storage ด้วย Zustand `persist` | `src/lib/enrollment-store.ts`                                                                             |

> ติดตั้งเพิ่ม:
>
> ```bash
> pnpm dlx shadcn@latest add button card dialog label select table tabs
> ```

---

## ขั้นตอนที่ 5: กำหนด Type และ Mock Data

### 5.1 กำหนด Type ให้ตรงกับข้อมูลจริง

สร้างไฟล์ `src/lib/types.ts`:

```ts
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
```

### 5.2 สร้าง Mock Data

สร้างไฟล์ `src/lib/mock-data.ts`:

```ts
import type { Student, Course, Enrollment } from "@/lib/types";

export const students: Student[] = [
  {
    studentId: "650610001",
    firstName: "Matt",
    lastName: "Damon",
    program: "CPE",
  },
  {
    studentId: "650610002",
    firstName: "Cillian",
    lastName: "Murphy",
    program: "CPE",
  },
  {
    studentId: "650610003",
    firstName: "Emily",
    lastName: "Blunt",
    program: "ISNE",
  },
];

export const courses: Course[] = [
  {
    courseId: "261207",
    courseTitle: "Basic Computer Engineering Lab",
    instructors: ["Dome", "Chanadda"],
  },
  {
    courseId: "261497",
    courseTitle: "Full Stack Development",
    instructors: ["Dome", "Nirand", "Chanadda"],
  },
  {
    courseId: "269101",
    courseTitle: "Introduction to Information Systems and Network Engineering",
    instructors: ["KENNETH COSH"],
  },
];

export const enrollments: Enrollment[] = [
  { studentId: "650610002", courseId: "261207" },
  { studentId: "650610002", courseId: "261497" },
  { studentId: "650610003", courseId: "269101" },
  { studentId: "650610003", courseId: "261497" },
];
```

---

## ขั้นตอนที่ 6: Global State ด้วย Zustand

### 6.1 ทำไมต้องมี Global State ตัวเดียว

ถ้าเก็บ `students`/`courses`/`enrollments` เป็น `useState` ในแต่ละหน้าแยกกัน:

- หน้า A ลงทะเบียนเพิ่ม → หน้า B ไม่เห็น เพราะเป็น state คนละก้อน
- ย้ายหน้าไปแล้วกลับมา → component ถูกสร้างใหม่ state กลับเป็นค่าเริ่มต้น ที่แก้ไว้หายหมด
- ถ้าย้าย state ขึ้นไปไว้ที่ component แม่ ก็ต้องส่ง props ลงไปหลายชั้น (**prop drilling**)

ติดตั้งก่อนใช้งาน:

```bash
pnpm add zustand
```

### 6.2 สร้าง Store

สร้างไฟล์ `src/lib/enrollment-store.ts`

```ts
import { create } from "zustand";

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
export const useEnrollmentStore = create<EnrollmentStore>((set) => ({
  students: initialStudents,
  courses: initialCourses,
  enrollments: initialEnrollments,

  // (3) enroll/drop เรียก set(...) แทนการเรียก setState ของ useState
  enroll: (studentId, courseId) =>
    set((state) => ({
      enrollments: state.enrollments.some(
        (e) => e.studentId === studentId && e.courseId === courseId,
      )
        ? state.enrollments // กันลงทะเบียนซ้ำ — ถ้ามีอยู่แล้วคืน array เดิม ไม่ใส่ซ้ำ
        : [...state.enrollments, { studentId, courseId }],
    })),

  drop: (studentId, courseId) =>
    set((state) => ({
      enrollments: state.enrollments.filter(
        (e) => !(e.studentId === studentId && e.courseId === courseId),
      ),
    })),
}));
```

> ✅ **Verification:** เปิด `src/pages/home.tsx` ฟังก์ชัน `HomePage` (ก่อน `return`):
>
> ```tsx
> // import { useEnrollmentStore } from "@/lib/enrollment-store";
> const { students } = useEnrollmentStore();
> console.log(students);
> ```
>
> เปิดเว็บ → F12 → แท็บ Console ต้องเห็น array นักศึกษา 3 คน ไม่มี error

---

## ขั้นตอนที่ 7: หน้าแรก + หน้าจัดการการลงทะเบียน (โครง) + เมนู + Route

### 7.1 สร้างหน้าจัดการการลงทะเบียน (โครงเปล่า)

สร้างโฟลเดอร์ `src/pages/admin/` แล้วสร้างไฟล์ `src/pages/admin/enrollments.tsx`:

```tsx
import { useEnrollmentStore } from "@/lib/enrollment-store";

export default function AdminEnrollmentsPage() {
  const { students, courses, enrollments } = useEnrollmentStore();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>
      <p className="text-sm">
        นักศึกษา {students.length} คน · วิชา {courses.length} วิชา ·
        การลงทะเบียน {enrollments.length} รายการ
      </p>
    </div>
  );
}
```

### 7.2 เพิ่ม Route

แก้ `src/main.tsx` — import หน้าใหม่ แล้วเพิ่ม route ใน `children`:

```tsx
import AdminEnrollmentsPage from "@/pages/admin/enrollments";
```

```tsx
    children: [
      { index: true, element: <HomePage /> },
      { path: "admin/enrollments", element: <AdminEnrollmentsPage /> },
    ],
```

> ⚠️ `path` ใน `children` **ไม่มี `/` นำหน้า** (`"admin/enrollments"` ไม่ใช่ `"/admin/enrollments"`) เพราะเป็น path ต่อจาก `/` ของ route แม่

### 7.3 เพิ่มเมนูใน Sidebar

แก้ `src/components/app-sidebar.tsx` — เพิ่มไอคอน `BookOpen` ใน import และเพิ่ม object ใน `items`:

```tsx
import { BookOpen, Home } from "lucide-react";
```

```tsx
const items = [
  { title: "หน้าแรก", url: "/", icon: Home },
  { title: "จัดการการลงทะเบียน", url: "/admin/enrollments", icon: BookOpen },
];
```

> 💡 ไอคอนทั้งหมดดูได้ที่ <https://lucide.dev/icons> — ชื่อบนเว็บเป็นแบบ `book-open` ตอน import ให้เขียนเป็น PascalCase `BookOpen`

### 7.4 แก้หน้าแรกให้มีปุ่มลิงก์เข้าเมนูจัดการ

แก้ `src/pages/home.tsx` ทั้งไฟล์:

```tsx
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>ระบบลงทะเบียนเรียน CPE & ISNE</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            มุมมอง <strong>ผู้ดูแลระบบ (ADMIN)</strong> ที่ลงทะเบียนและ Drop
            ให้นักศึกษาได้ทุกคน ใช้ Mock Data ใน{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              src/lib/mock-data.ts
            </code>{" "}
            ไม่มีการเรียก API
          </p>
          <Button render={<Link to="/admin/enrollments" />}>
            ไปหน้าจัดการการลงทะเบียน
          </Button>
        </CardContent>
      </Card>

      {/* แก้เป็นชื่อ-นามสกุล และรหัสนักศึกษาของตัวเอง */}
      <p className="text-center text-xs text-muted-foreground">
        จัดทำโดย ชื่อ นามสกุล รหัสนักศึกษา
      </p>
    </div>
  );
}
```

---

## ขั้นตอนที่ 8: ฟอร์มลงทะเบียนแบบ Dialog (Popup)

### 8.1 สร้าง Select แบบใช้ซ้ำ (`OptionSelect`)

หน้านี้ต้องใช้ dropdown ถึง **4 จุด** (เลือกนักศึกษา, เลือกวิชาตอนลงทะเบียน, กรองตามวิชา, กรองตามนักศึกษา) — Select ของ shadcn ต้องเขียน `Select` / `SelectTrigger` / `SelectValue` / `SelectContent` / `SelectItem` ซ้อนกัน 5 ชั้นทุกครั้ง เขียนซ้ำ 4 รอบจะยาวและแก้ยาก จึงห่อเป็น component เดียวรับแค่ `options` / `value` / `onChange`

แก้ `src/pages/admin/enrollments.tsx` — เพิ่ม import และ component `OptionSelect` **ไว้เหนือ** `export default function AdminEnrollmentsPage`:

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = { value: string; label: string };

function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(v) => onChange(v as string)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### 8.3 เตรียมข้อมูลและ state ของฟอร์ม

ในฟังก์ชัน `AdminEnrollmentsPage` แก้ส่วนบนสุด (ก่อน `return`) ให้เป็นแบบนี้:

```tsx
export default function AdminEnrollmentsPage() {
  const { students, courses, enrollments, enroll } = useEnrollmentStore();

  // state ของฟอร์มใน Dialog
  const [formStudent, setFormStudent] = useState<string | null>(null);
  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);

  // แปลงข้อมูลจาก store เป็นรูปแบบ { value, label } ที่ OptionSelect ต้องการ
  const studentOptions: Option[] = students.map((s) => ({
    value: s.studentId,
    label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
  }));
  const courseOptions: Option[] = courses.map((c) => ({
    value: c.courseId,
    label: `${c.courseId} — ${c.courseTitle}`,
  }));

  // วิชาที่นักศึกษาที่เลือกยังไม่ได้ลงทะเบียน — กันเลือกวิชาซ้ำตั้งแต่ต้นทาง
  const availableCourseOptions = courseOptions.filter(
    (c) =>
      !enrollments.some(
        (e) => e.studentId === formStudent && e.courseId === c.value
      )
  );

  const handleEnroll = () => {
    if (!formStudent || !formCourse) return;
    enroll(formStudent, formCourse);
    setEnrollDialogOpen(false);
  };

  // เคลียร์ฟอร์มทุกครั้งที่ Dialog ปิด ไม่ว่าจะปิดเพราะลงทะเบียนสำเร็จ, กด X,
  // หรือคลิกนอก Dialog — เปิดครั้งหน้าจะได้เริ่มจากฟอร์มว่างเสมอ
  const handleEnrollDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) {
      setFormStudent(null);
      setFormCourse(null);
    }
  };

  // ...return อยู่ด้านล่าง
```

และเพิ่ม `useState` ใน import บนสุดของไฟล์:

```tsx
import { useState } from "react";
```

### 8.4 วาง Dialog ลงในหน้า `src/pages/admin/enrollments.tsx`

เพิ่ม import:

```tsx
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
```

แก้ส่วน `return` — **ลบ** `<p>` ชั่วคราวจากขั้นตอนที่ 7.1 ออก แล้ววาง Dialog แทนที่:

```tsx
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>

      <Dialog open={enrollDialogOpen} onOpenChange={handleEnrollDialogOpenChange}>
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />
          ลงทะเบียนให้นักศึกษา
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>
              เลือกนักศึกษาก่อน แล้วเลือกวิชาที่ยังไม่ได้ลงทะเบียน
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="formStudent">นักศึกษา</Label>
              <OptionSelect
                id="formStudent"
                options={studentOptions}
                value={formStudent}
                placeholder="เลือกนักศึกษา"
                onChange={(v) => {
                  setFormStudent(v);
                  setFormCourse(null);
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="formCourse">วิชา</Label>
              <OptionSelect
                id="formCourse"
                options={availableCourseOptions}
                value={formCourse}
                placeholder={
                  formStudent && availableCourseOptions.length === 0
                    ? "ลงทะเบียนครบทุกวิชาแล้ว"
                    : "เลือกวิชา"
                }
                onChange={setFormCourse}
              />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={!formStudent || !formCourse} onClick={handleEnroll}>
              <PlusCircle className="h-4 w-4" />
              ลงทะเบียน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## ขั้นตอนที่ 9: ตารางการลงทะเบียน (1 แถว/1 รายการ)

### 9.1 หนึ่งแถวต่อหนึ่ง enrollment

### 9.2 คำนวณข้อมูลตารางจาก enrollments

เพิ่มโค้ดนี้ต่อจาก `handleEnrollDialogOpenChange` (ก่อน `return`):

```tsx
// หนึ่งแถวต่อหนึ่ง enrollment ตรงๆ ไม่จัดกลุ่ม
const rows = enrollments;

// แปลง studentId/courseId → ชื่อที่อ่านง่าย (join ข้อมูล enrollments กับ students/courses)
const nameOf = (studentId: string) => {
  const s = students.find((x) => x.studentId === studentId);
  return s ? `${s.firstName} ${s.lastName}` : "-";
};
const titleOf = (courseId: string) =>
  courses.find((c) => c.courseId === courseId)?.courseTitle ?? "-";
```

### 9.3 render ตาราง

เพิ่ม import:

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
```

วางตารางต่อจาก `</Dialog>` (ก่อน `</div>` ตัวนอกสุด):

```tsx
<div className="rounded-lg border">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>รหัสนักศึกษา</TableHead>
        <TableHead>ชื่อ-นามสกุล</TableHead>
        <TableHead>รหัสวิชา</TableHead>
        <TableHead>ชื่อวิชา</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.length === 0 && (
        <TableRow>
          <TableCell
            colSpan={4}
            className="h-20 text-center text-muted-foreground"
          >
            ไม่พบข้อมูลการลงทะเบียน
          </TableCell>
        </TableRow>
      )}
      {rows.map((e) => (
        <TableRow key={`${e.studentId}-${e.courseId}`}>
          <TableCell>{e.studentId}</TableCell>
          <TableCell>{nameOf(e.studentId)}</TableCell>
          <TableCell>{e.courseId}</TableCell>
          <TableCell>{titleOf(e.courseId)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

---

## ขั้นตอนที่ 10: Tabs กรองข้อมูล ตามวิชา / ตามนักศึกษา

### 10.1 เพิ่ม state ของตัวกรอง และแก้ `rows`

เพิ่ม state 3 ตัวต่อจาก state ของฟอร์ม:

```tsx
const [mode, setMode] = useState<"course" | "student">("course");
const [filterCourse, setFilterCourse] = useState("all");
const [filterStudent, setFilterStudent] = useState("all");
```

แก้ `rows` จากขั้นตอนที่ 9.2 — เปลี่ยนจาก `enrollments` ตรงๆ เป็น `.filter(...)`:

```tsx
const rows = enrollments.filter((e) =>
  mode === "course"
    ? filterCourse === "all" || e.courseId === filterCourse
    : filterStudent === "all" || e.studentId === filterStudent,
);
```

### 10.2 วาง Tabs ลงในหน้า

เพิ่ม import:

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
```

วาง Tabs **ระหว่าง** `</Dialog>` กับ `<div className="rounded-lg border">` ของตาราง:

```tsx
<Tabs value={mode} onValueChange={(v) => setMode(v as "course" | "student")}>
  <TabsList>
    <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
    <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
  </TabsList>
  <TabsContent value="course" className="pt-2">
    <OptionSelect
      id="filterCourse"
      options={[{ value: "all", label: "ทุกวิชา" }, ...courseOptions]}
      value={filterCourse}
      onChange={setFilterCourse}
    />
  </TabsContent>
  <TabsContent value="student" className="pt-2">
    <OptionSelect
      id="filterStudent"
      options={[{ value: "all", label: "ทุกคน" }, ...studentOptions]}
      value={filterStudent}
      onChange={setFilterStudent}
    />
  </TabsContent>
</Tabs>
```

### 10.3 โค้ดเต็มของ `src/pages/admin/enrollments.tsx`

```tsx
import { useState } from "react";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollmentStore } from "@/lib/enrollment-store";

type Option = { value: string; label: string };

// Select ของ shadcn ต้องเขียน SelectTrigger/SelectContent/SelectItem ซ้ำทุกจุดที่ใช้
// — ห่อเป็น component เดียวรับแค่ options/value/onChange ใช้ซ้ำ 4 จุดในหน้านี้
function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(v) => onChange(v as string)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminEnrollmentsPage() {
  const { students, courses, enrollments, enroll } = useEnrollmentStore();

  const [formStudent, setFormStudent] = useState<string | null>(null);
  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");

  const studentOptions: Option[] = students.map((s) => ({
    value: s.studentId,
    label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
  }));
  const courseOptions: Option[] = courses.map((c) => ({
    value: c.courseId,
    label: `${c.courseId} — ${c.courseTitle}`,
  }));

  // วิชาที่นักศึกษาที่เลือกยังไม่ได้ลงทะเบียน
  const availableCourseOptions = courseOptions.filter(
    (c) =>
      !enrollments.some(
        (e) => e.studentId === formStudent && e.courseId === c.value,
      ),
  );

  const handleEnroll = () => {
    if (!formStudent || !formCourse) return;
    enroll(formStudent, formCourse);
    setEnrollDialogOpen(false);
  };

  // เคลียร์ฟอร์มทุกครั้งที่ Dialog ปิด
  const handleEnrollDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) {
      setFormStudent(null);
      setFormCourse(null);
    }
  };

  const rows = enrollments.filter((e) =>
    mode === "course"
      ? filterCourse === "all" || e.courseId === filterCourse
      : filterStudent === "all" || e.studentId === filterStudent,
  );

  const nameOf = (studentId: string) => {
    const s = students.find((x) => x.studentId === studentId);
    return s ? `${s.firstName} ${s.lastName}` : "-";
  };
  const titleOf = (courseId: string) =>
    courses.find((c) => c.courseId === courseId)?.courseTitle ?? "-";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>

      <Dialog
        open={enrollDialogOpen}
        onOpenChange={handleEnrollDialogOpenChange}
      >
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />
          ลงทะเบียนให้นักศึกษา
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>
              เลือกนักศึกษาก่อน แล้วเลือกวิชาที่ยังไม่ได้ลงทะเบียน
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="formStudent">นักศึกษา</Label>
              <OptionSelect
                id="formStudent"
                options={studentOptions}
                value={formStudent}
                placeholder="เลือกนักศึกษา"
                onChange={(v) => {
                  setFormStudent(v);
                  setFormCourse(null);
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="formCourse">วิชา</Label>
              <OptionSelect
                id="formCourse"
                options={availableCourseOptions}
                value={formCourse}
                placeholder={
                  formStudent && availableCourseOptions.length === 0
                    ? "ลงทะเบียนครบทุกวิชาแล้ว"
                    : "เลือกวิชา"
                }
                onChange={setFormCourse}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!formStudent || !formCourse}
              onClick={handleEnroll}
            >
              <PlusCircle className="h-4 w-4" />
              ลงทะเบียน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "course" | "student")}
      >
        <TabsList>
          <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
          <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
        </TabsList>
        <TabsContent value="course" className="pt-2">
          <OptionSelect
            id="filterCourse"
            options={[{ value: "all", label: "ทุกวิชา" }, ...courseOptions]}
            value={filterCourse}
            onChange={setFilterCourse}
          />
        </TabsContent>
        <TabsContent value="student" className="pt-2">
          <OptionSelect
            id="filterStudent"
            options={[{ value: "all", label: "ทุกคน" }, ...studentOptions]}
            value={filterStudent}
            onChange={setFilterStudent}
          />
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสนักศึกษา</TableHead>
              <TableHead>ชื่อ-นามสกุล</TableHead>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูลการลงทะเบียน
                </TableCell>
              </TableRow>
            )}
            {rows.map((e) => (
              <TableRow key={`${e.studentId}-${e.courseId}`}>
                <TableCell>{e.studentId}</TableCell>
                <TableCell>{nameOf(e.studentId)}</TableCell>
                <TableCell>{e.courseId}</TableCell>
                <TableCell>{titleOf(e.courseId)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

### 10.4 โครงสร้างไฟล์ที่ควรได้เมื่อจบขั้นตอนที่ 10

```
src/
├── main.tsx                     ← ThemeProvider > RouterProvider + route admin/enrollments (ไม่มี Provider ของ store)
├── components/
│   ├── app-sidebar.tsx          ← เพิ่มเมนู "จัดการการลงทะเบียน"
│   ├── mode-toggle.tsx
│   ├── theme-provider.tsx
│   └── ui/
├── layouts/
│   └── root-layout.tsx
├── lib/
│   ├── types.ts                 ← ขั้นตอนที่ 5.1 (ใหม่)
│   ├── mock-data.ts             ← ขั้นตอนที่ 5.2 (ใหม่)
│   ├── enrollment-store.ts      ← ขั้นตอนที่ 6.2 (ใหม่, Zustand) + 11.2 (persist)
│   └── utils.ts
└── pages/
    ├── home.tsx                 ← ขั้นตอนที่ 7.4 (แก้)
    └── admin/
        └── enrollments.tsx      ← ขั้นตอนที่ 7-10 (ใหม่)
```

---

## ขั้นตอนที่ 11: เก็บ `students`/`courses` ลง Local Storage ด้วย Zustand `persist`

ตอนนี้ทั้ง `students`, `courses`, `enrollments` อยู่ในหน่วยความจำล้วนๆ — รีเฟรชหน้าแล้วข้อมูลหายกลับไปเป็นค่าตั้งต้นใน `mock-data.ts` ทุกครั้ง ขั้นตอนนี้เพิ่ม middleware `persist` ของ Zustand ให้ `students`/`courses` อยู่รอดข้ามการรีเฟรชได้

### 11.1 ทำไมเก็บแค่ `students`/`courses` ไม่เก็บ `enrollments` ด้วย

`persist` sync ทั้ง store ลง `localStorage` ให้อัตโนมัติทุกครั้งที่ state เปลี่ยน แต่ใช้ตัวเลือก **`partialize`** จำกัดให้เก็บเฉพาะ `students`/`courses` (ข้อมูล roster) ส่วน `enrollments` ปล่อยให้รีเซ็ตกลับเป็นค่าตั้งต้นทุกครั้งที่รีเฟรชเหมือนเดิม เพื่อให้ทดสอบปุ่มลงทะเบียน/ยกเลิกซ้ำๆ ได้ง่าย โดยไม่ต้องคอยเคลียร์ `localStorage` เอง

### 11.2 แก้ `src/lib/enrollment-store.ts` — เพิ่ม `persist` middleware

เพิ่ม import:

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
```

แก้จาก `create<EnrollmentStore>((set) => ({ ... }))` เป็นห่อด้วย `persist(...)`:

```ts
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
`
```
