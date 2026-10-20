import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "../context/useToast";
import { resetPassword } from "../lib/api";
import { syncPasswordConfirmation } from "../lib/validation";

const isResetToken = (token: string | null): token is string =>
  token !== null && /^[a-f0-9]{64}$/i.test(token);

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const resetMutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      resetPassword(token, password),
  });
  const submitting = resetMutation.isPending;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!isResetToken(token)) {
      const message = "This reset link is invalid. Request a new link and try again.";
      setError(message);
      showToast(message, "error");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password"));
    const confirmation = String(formData.get("confirm-password"));

    if (password !== confirmation) {
      const message = "The passwords do not match.";
      setError(message);
      showToast(message, "error");
      return;
    }

    try {
      await resetMutation.mutateAsync({ token, password });
      setComplete(true);
      showToast("Your password has been reset.", "success");
      navigate("/reset-password", { replace: true });
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to reset your password. Request a new link and try again.";
      setError(message);
      showToast(message, "error");
    }
  };

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-white px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {complete ? (
          <>
            <h1 className="text-3xl font-bold">Password updated</h1>
            <p role="status" className="mt-3 text-stone-600">
              Your password has been reset. You can now sign in with your new
              password.
            </p>
            <Link
              to="/login"
              className="mt-8 block w-full rounded-lg bg-brand-700 px-4 py-3 text-center font-semibold text-white transition hover:bg-brand-800"
            >
              Go to sign in
            </Link>
          </>
        ) : !isResetToken(token) ? (
          <>
            <h1 className="text-3xl font-bold">Reset link unavailable</h1>
            <p role="alert" className="mt-3 text-stone-600">
              This reset link is missing a valid token. Request a new link to
              change your password.
            </p>
            <Link
              to="/forgot-password"
              className="mt-8 block w-full rounded-lg bg-brand-700 px-4 py-3 text-center font-semibold text-white transition hover:bg-brand-800"
            >
              Request a new link
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold">Choose a new password</h1>
            <p className="mt-2 text-stone-600">
              Use a password between 8 and 128 characters.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium"
                >
                  New password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  aria-describedby="password-requirements"
                  onInput={(event) => syncPasswordConfirmation(event.currentTarget.form)}
                  required
                  className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <p id="password-requirements" className="sr-only">
                  Password must be between 8 and 128 characters.
                </p>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium"
                >
                  Confirm new password
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

              {error && (
                <p role="alert" className="text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-brand-700 px-4 py-3 font-semibold text-white transition hover:bg-brand-800 disabled:cursor-wait disabled:opacity-60"
              >
                {submitting ? "Updating password..." : "Update password"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-stone-600">
              <Link
                to="/forgot-password"
                className="font-semibold text-brand-800 hover:underline"
              >
                Request a new reset link
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
