// src/app/auth/[role]/layout.tsx
export default function AuthRoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      {children}
    </div>
  );
}