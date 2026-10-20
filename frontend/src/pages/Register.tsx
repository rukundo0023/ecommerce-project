
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "../context/useToast";
import { signUp } from "../lib/api";
import { isValidEmail, syncPasswordConfirmation } from "../lib/validation";

export default function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const registerMutation = useMutation({
    mutationFn: ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => signUp(name, email, password),
  });
  const submitting = registerMutation.isPending;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name")).trim();
    const email = String(formData.get("email")).trim();
    const password = String(formData.get("password"));
    const confirmation = String(formData.get("confirm-password"));
    if (!name || name.length > 100) {
      const message = "Enter your name using 1 to 100 characters.";
      setError(message);
      showToast(message, "error");
      return;
    }
    if (!isValidEmail(email)) {
      const message = "Enter a valid email address of 254 characters or fewer.";
      setError(message);
      showToast(message, "error");
      return;
    }
    if (password.length < 8 || password.length > 128) {
      const message = "Password must be between 8 and 128 characters.";
      setError(message);
      showToast(message, "error");
      return;
    }
    if (password !== confirmation) {
      const message = "The passwords do not match.";
      setError(message);
      showToast(message, "error");
      return;
    }
    try {
      await registerMutation.mutateAsync({ name, email, password });
      showToast("Your account has been created. Please sign in.", "success");
      navigate("/login");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Registration failed. Please try again.";
      setError(message);
      showToast(message, "error");
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-3xl font-bold text-stone-900">
          Create an Account
        </h1>

        <p className="mb-6 text-center text-stone-600">
          Register to start shopping with RukundoeShop.
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
              autoComplete="name"
              minLength={1}
              maxLength={100}
              pattern=".*\\S.*"
              title="Enter a name that includes at least one non-space character."
              required
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 outline-none focus:border-brand-600"
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
              autoComplete="email"
              inputMode="email"
              maxLength={254}
              autoCapitalize="none"
              spellCheck={false}
              pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 outline-none focus:border-brand-600"
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
              autoComplete="new-password"
              placeholder="Create a password"
              minLength={8}
              maxLength={128}
              onInput={(event) => syncPasswordConfirmation(event.currentTarget.form)}
              required
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-700"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-1 block font-medium">
              Confirm password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              onInput={(event) => syncPasswordConfirmation(event.currentTarget.form)}
              required
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-700"
            />
          </div>

          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-700 px-4 py-3 font-semibold text-white transition hover:bg-brand-800 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-800 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}