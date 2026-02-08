"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";


export const dynamic = "force-dynamic";


export default function AdminLogin() {
const router = useRouter();
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");


const submit = async (e: React.FormEvent) => {
e.preventDefault();
const res = await api.post("/auth/login", { email, password });


localStorage.setItem("authToken", res.data.token);
router.push("/admin");
};


return (
<form onSubmit={submit}>
<input value={email} onChange={e => setEmail(e.target.value)} />
<input type="password" value={password} onChange={e => setPassword(e.target.value)} />
<button type="submit">Login</button>
</form>
);
}