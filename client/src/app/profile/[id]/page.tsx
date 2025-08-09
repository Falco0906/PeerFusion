"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/common/Header";

export default function ProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) throw new Error(text || "Failed to fetch profile");
        return JSON.parse(text);
      })
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div>
      <Header />
      <div className="p-6">
        <h1 className="text-xl font-bold">
          {profile.first_name} {profile.last_name}
        </h1>
        <p>Email: {profile.email}</p>
        {/* Add more profile details here */}
      </div>
    </div>
  );
}
