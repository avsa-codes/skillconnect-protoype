"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_session");

    if (isLoggedIn !== "super_admin") {
      router.push("/admin/login");
    } else {
      setAllowed(true);
    }
  }, [router]);

  if (!allowed) return null;

  return <>{children}</>;
}
