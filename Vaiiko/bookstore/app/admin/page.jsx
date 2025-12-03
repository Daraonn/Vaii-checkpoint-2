export default function AdminHome() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div style={{ marginTop: "20px" }}>
        <a href="/admin/books" style={{ marginRight: "20px" }}> Manage Books</a>
        <a href="/admin/users"> Manage Users</a>
      </div>
    </div>
  );
}