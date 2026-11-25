import "../admin.css";
import { AdminAuthProvider } from "../../components/admin/auth";

export const metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
