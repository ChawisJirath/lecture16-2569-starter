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
        จัดทำโดย Chawis Jirathitikul รหัสนักศึกษา 680610666
      </p>
    </div>
  );
}