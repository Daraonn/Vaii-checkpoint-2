import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let isAdmin = false;

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "supersecret");
      const user = await prisma.user.findUnique({
        where: { user_id: payload.user_id },
        select: { isAdmin: true },
      });
      isAdmin = user?.isAdmin === true;
    } catch {
      isAdmin = false;
    }
  }

  if (!isAdmin) {
    return <div style={{ padding: "40px", fontSize: "20px" }}>Access Denied. Admins only.</div>;
  }

  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li><a href="/admin">Dashboard</a></li>
          <li><a href="/admin/books">Manage Books</a></li>
          <li><a href="/admin/users">Manage Users</a></li>
        </ul>
      </aside>

      <main className="admin-content">{children}</main>
    </div>
  );
}