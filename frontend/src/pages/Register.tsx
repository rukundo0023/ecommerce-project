
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../lib/api";

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      await signUp(
        String(formData.get("name")).trim(),
        String(formData.get("email")).trim(),
        String(formData.get("password"))
      );
      navigate("/login");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#f3efe4] px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-stone-200 bg-[#fffdf8] p-8 shadow-md">
        <h1 className="mb-2 text-center text-3xl font-bold text-stone-900">
          Create an Account
        </h1>

        <p className="mb-6 text-center text-stone-600">
          Register to start shopping with ShopEase.
        </p>

        <form
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <div>
            <label htmlFor="name" className="mb-1 block font-medium">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              required
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-700"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block font-medium">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-700"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              minLength={8}
              maxLength={128}
              required
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-700"
            />
          </div>

          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-emerald-800 px-4 py-3 font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-emerald-800 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}