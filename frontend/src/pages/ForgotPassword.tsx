import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useToast } from "../context/useToast";
import { requestPasswordReset } from "../lib/api";
import { isValidEmail } from "../lib/validation";

interface ForgotPasswordFields {
  email: string;
}

export default function ForgotPassword() {
  const { showToast } = useToast();
  const [serverError, setServerError] = useState("");
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFields>({ mode: "onBlur", reValidateMode: "onChange" });
  const resetRequestMutation = useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
  });
  const submitting = resetRequestMutation.isPending;

  const submitRequest = async ({ email }: ForgotPasswordFields) => {
    setServerError("");
    setMessage("");
    try {
      const response = await resetRequestMutation.mutateAsync(email.trim());
      setMessage(response.message);
      showToast(response.message, "success");
    } catch (submitError) {
      const errorMessage =
        submitError instanceof Error
          ? submitError.message
          : "Unable to request a password reset. Please try again.";
      setServerError(errorMessage);
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

        <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit(submitRequest)}>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              maxLength={254}
              autoCapitalize="none"
              spellCheck={false}
              pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "forgot-email-error" : undefined}
              {...register("email", {
                required: "Email address is required.",
                validate: (value) =>
                  isValidEmail(value.trim()) ||
                  "Enter a valid email address of 254 characters or fewer.",
              })}
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 outline-none focus:border-brand-600"
            />
            {errors.email && (
              <p id="forgot-email-error" role="alert" className="mt-1 text-sm text-red-700">
                {errors.email.message}
              </p>
            )}
          </div>

          {serverError && (
            <p role="alert" className="text-sm text-red-700">
              {serverError}
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
