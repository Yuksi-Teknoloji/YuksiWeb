// src/app/(auth)/register/page.tsx
import RegisterForm from "@/app/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="px-4 py-10">
      <section className="auth-card auth-pattern">
        <RegisterForm />
      </section>
    </main>
  );
}
