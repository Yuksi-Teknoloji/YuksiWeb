// src/app/@modal/(..)register/page.tsx
import Modal from "@/components/UI/Modal";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterModalPage() {
  return (
    <Modal title="Kayıt Ol">
      <RegisterForm />
    </Modal>
  );
}
