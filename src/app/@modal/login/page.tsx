// src/app/@modal/(..)login/page.tsx
import Modal from "@/app/components/UI/Modal";
import LoginForm from "@/app/components/auth/LoginForm";

export default function LoginModalPage() {
  return (
    <Modal title="Giriş Yap">
      <LoginForm />
    </Modal>
  );
}
