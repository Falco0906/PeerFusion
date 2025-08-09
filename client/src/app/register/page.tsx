"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Registration failed");
      return;
    }
    window.location.href = "/login";
  };

  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-2 max-w-sm mx-auto p-4">
      <input name="first_name" placeholder="First Name" onChange={handleChange} className="border p-2" />
      <input name="last_name" placeholder="Last Name" onChange={handleChange} className="border p-2" />
      <input name="email" placeholder="Email" onChange={handleChange} className="border p-2" />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} className="border p-2" />
      <button className="bg-green-500 text-white p-2" type="submit">
        Register
      </button>
    </form>
  );
}
