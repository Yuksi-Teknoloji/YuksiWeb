// src/app/(auth)/login/page.tsx
import LoginForm from "@/app/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="px-4 py-10">
      <section className="auth-card auth-pattern">
        <LoginForm />
      </section>
    </main>
  );
}
