'use client';
import { UserProvider } from '../../context/user';
import ConditionalNavbar from '../Navbar/ConditionalNavbar';

export default function UserWrapper({ children }) {
  return (
    <UserProvider>
      <ConditionalNavbar />
      {children}
    </UserProvider>
  );
}