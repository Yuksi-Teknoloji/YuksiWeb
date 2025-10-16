/* "use client";

import React from "react";
import Header from "@/components/dashboard/Header";

// basit guard: token yoksa login'e at
function useAuthGuard() {
  React.useEffect(() => {
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token") ||
      (document.cookie.match(/(?:^|; )auth_token=([^;]+)/)?.[1] ?? "");
    if (!token) {
      // history'e eklemeden çık
      location.replace("/auth/Login"); // istersen "/"
    }
  }, []);
}

export default function DashboardClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthGuard();

  return (
    <div className="flex-1 orange-ui">
      <Header
        title="Yüksi Panel"
        headerClass="bg-orange-500 border-orange-400 text-white"
        titleClass="font-extrabold"
      />
      <main className="px-4 py-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
 */

//alttaki layoutu da yorum satırından çıkar