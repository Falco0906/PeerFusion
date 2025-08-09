"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <header className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
      {/* Logo / Brand */}
      <Link href="/dashboard" className="text-lg font-bold">
        PeerFusion
      </Link>

      {/* Navigation Links */}
      <nav className="flex items-center gap-6">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link href="/profile/me" className="hover:underline">
          My Profile
        </Link>
        <Link href="/search" className="hover:underline">
          Search
        </Link>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}
