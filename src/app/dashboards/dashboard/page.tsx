// src/app/(dashboards)/dashboard/page.tsx  (opsiyonel)
import { redirect } from "next/navigation";
import { getRole } from "../../../lib/aut/session";

export default function DashAlias() {
  const role = getRole();
  redirect(`/${role}`);
}
