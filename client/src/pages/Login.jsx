import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    // No backend yet — real auth wires up here later.
    navigate("/profiles");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-brand-black">
      <p className="text-3xl font-extrabold tracking-tight text-brand-red md:text-4xl">
        WOLMAN
      </p>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded bg-black/75 p-10"
      >
        <h1 className="mb-6 text-2xl font-bold text-white">Sign In</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded bg-neutral-700 p-3 text-white placeholder-gray-400 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded bg-neutral-700 p-3 text-white placeholder-gray-400 focus:outline-none"
          required
        />
        <button
          type="submit"
          className="w-full rounded bg-brand-red py-3 font-semibold text-white hover:bg-red-700"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
