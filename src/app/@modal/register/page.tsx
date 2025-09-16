// src/app/@modal/(..)register/page.tsx
import Modal from "@/app/components/UI/Modal";
import RegisterForm from "@/app/components/auth/RegisterForm";

export default function RegisterModalPage() {
  return (
    <Modal title="Kayıt Ol">
      <RegisterForm />
    </Modal>
  );
}
