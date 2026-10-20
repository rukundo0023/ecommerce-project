import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "../context/useToast";
import { requestPasswordReset } from "../lib/api";
import { isValidEmail } from "../lib/validation";

export default function ForgotPassword() {
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const resetRequestMutation = useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
  });
  const submitting = resetRequestMutation.isPending;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email")).trim();
    if (!isValidEmail(email)) {
      const errorMessage = "Enter a valid email address of 254 characters or fewer.";
      setError(errorMessage);
      showToast(errorMessage, "error");
      return;
    }
    try {
      const response = await resetRequestMutation.mutateAsync(email);
      setMessage(response.message);
      showToast(response.message, "success");
    } catch (submitError) {
      const errorMessage =
        submitError instanceof Error
          ? submitError.message
          : "Unable to request a password reset. Please try again.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    }
  };

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-white px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Forgot your password?</h1>
        <p className="mt-2 text-stone-600">
          Enter the email address for your account and we’ll send you a reset
          link if it exists.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
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

          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="text-sm text-brand-800">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-700 px-4 py-3 font-semibold text-white transition hover:bg-brand-800 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-600">
          Remembered it?{" "}
          <Link
            to="/login"
            className="font-semibold text-brand-800 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
