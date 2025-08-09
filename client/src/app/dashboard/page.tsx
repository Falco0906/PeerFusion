"use client";

import { useEffect, useState } from "react";
import Header from "@/components/common/Header";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) throw new Error(text || "Failed to fetch user");
        return JSON.parse(text);
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div>
      <Header />
      <div className="p-6">
        <h1 className="text-xl font-bold">Welcome {user.first_name}!</h1>
        <p>Email: {user.email}</p>
      </div>
    </div>
  );
}
