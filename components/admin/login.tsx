"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, UserRound } from "lucide-react";
import { Field } from "../field";
import { useAdminAuth } from "./auth";

export function Login() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const message = await login(username, password);
    setSubmitting(false);
    if (message) setError(message);
    else router.replace("/admin/produk");
  }

  return (
    <main
      className="shell page"
      style={{ maxWidth: 420, paddingBlock: "clamp(40px, 8vw, 96px)" }}
    >
      <h1>Masuk admin</h1>
      <p>Kelola produk dan pesanan souveniraceh.</p>
      <form onSubmit={submit} className="checkout-card checkout-fields">
        <Field
          icon={UserRound}
          label="Username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          errorMessage="Isi username admin."
        />
        <Field
          icon={KeyRound}
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          errorMessage="Isi password admin."
        />
        {error && (
          <p role="alert" style={{ color: "var(--rust)" }}>
            {error}
          </p>
        )}
        <button className="btn primary wide" disabled={submitting}>
          {submitting ? "Memeriksa…" : "Masuk"}
        </button>
      </form>
    </main>
  );
}
