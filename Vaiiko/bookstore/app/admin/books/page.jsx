import Navbar from '@/app/components/Navbar/Navbar';
import Link from 'next/link';
import DeleteButton from './bookdeletebutton'; 
import './adminbooks.css';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function AdminBooksPage() {
  const books = await prisma.book.findMany();

  return (
    <div className="admin-books-container">
      <h1>Admin – Books</h1>

      <Link href="/admin/books/add">
        <button className="add-book-btn">Add New Book</button>
      </Link>

      <table className="books-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Author</th>
            <th>Price</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.book_id}>
              <td>{b.book_id}</td>
              <td>{b.name}</td>
              <td>{b.author}</td>
              <td>${b.price}</td>
              <td>
                <Link href={`/admin/books/edit/${b.book_id}`}>
                  <button>Edit</button>
                </Link>
              </td>
              <td>
                <DeleteButton bookId={b.book_id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
