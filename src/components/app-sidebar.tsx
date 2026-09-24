import { Home } from "lucide-react";
import { Link, useLocation } from "react-router";
import { BookOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// ผู้ใช้ตัวอย่างฝั่ง Lecture: ผู้ดูแลระบบ (ADMIN)
const NICKNAME = "Admin";
const ROLE = "ADMIN";

const items = [
  { title: "หน้าแรก", url: "/", icon: Home },
  { title: "จัดการการลงทะเบียน", url: "/admin/enrollments", icon: BookOpen },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-1 text-sm font-semibold">CPE & ISNE</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>เมนูหลัก</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.url}
                    render={<Link to={item.url} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Separator className="mb-2" />
        <div className="flex items-center gap-3 px-2 py-1.5">
          <Avatar>
            <AvatarImage src="/profile.svg" alt={NICKNAME} />
            <AvatarFallback>{NICKNAME.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{NICKNAME}</span>
            <Badge variant="outline" className="w-fit text-[10px]">
              {ROLE}
            </Badge>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
