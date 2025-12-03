import Link from 'next/link';
import DeleteUserButton from './userdeletebutton'; 
import './adminusers.css';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany();

  return (
    <div className="admin-users-container">
      <h1>Admin – Users</h1>

      <Link href="/admin/users/add">
        <button className="add-user-btn">Add New User</button>
      </Link>

      <table className="admin-users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Admin</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.user_id}>
              <td>{u.user_id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.isAdmin ? 1 : 0}</td>
              <td>
                <Link href={`/admin/users/edit/${u.user_id}`}>
                  <button className="edit-btn">Edit</button>
                </Link>
              </td>
              <td>
                <DeleteUserButton userId={u.user_id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
