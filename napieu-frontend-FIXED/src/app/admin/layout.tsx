"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ✅ Allow ALL login paths (with or without slash)
    if (pathname.startsWith("/admin/login")) return;

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/admin/login");
    }
  }, [pathname, router]);

  return <>{children}</>;
}
