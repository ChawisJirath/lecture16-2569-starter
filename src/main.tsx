import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";

import { ThemeProvider } from "@/components/theme-provider";
import RootLayout from "@/layouts/root-layout";
import HomePage from "@/pages/home";

import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      // ขั้นตอนที่ 7-10: เพิ่ม route { path: "admin/enrollments", element: <AdminEnrollmentsPage /> }
    ],
  },
]);

// ขั้นตอนที่ 6.3: ครอบ <RouterProvider> ด้วย <EnrollmentProvider>
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);
