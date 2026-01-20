'use client';
import { UserProvider } from '../../context/user';
import ConditionalNavbar from '../Navbar/ConditionalNavbar';
import Footer from '../Footer/page';

export default function UserWrapper({ children }) {
  return (
    <UserProvider>
      <ConditionalNavbar />
      {children}
      <Footer />

    </UserProvider>
  );
}