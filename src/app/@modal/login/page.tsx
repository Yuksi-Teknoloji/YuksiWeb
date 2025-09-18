// src/app/@modal/(..)login/page.tsx
import Modal from "@/components/UI/Modal";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginModalPage() {
  return (
    <Modal title="Giriş Yap">
      <LoginForm />
    </Modal>
  );
}
