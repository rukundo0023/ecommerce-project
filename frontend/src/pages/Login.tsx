
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/auth";
import { useToast } from "../context/useToast";
import { signIn } from "../lib/api";
import { isValidEmail } from "../lib/validation";

interface LoginFields {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { acceptAuth } = useAuth();
  const { showToast } = useToast();
  const redirectPath =
    typeof location.state === "object" &&
    location.state !== null &&
    "from" in location.state &&
    typeof location.state.from === "string"
      ? location.state.from
      : "/products";
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({ mode: "onBlur", reValidateMode: "onChange" });
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signIn(email, password),
  });
  const submitting = loginMutation.isPending;

  const submitLogin = async ({ email, password }: LoginFields) => {
    setServerError("");
    try {
      const response = await loginMutation.mutateAsync({ email: email.trim(), password });
      acceptAuth(response);
      showToast("You’re signed in.", "success");
      navigate(redirectPath, { replace: true });
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Login failed. Please try again.";
      setServerError(message);
      showToast(message, "error");
    }
  };

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-white px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Welcome back</h1>

        <p className="mt-2 text-stone-600">
          Sign in to your account.
        </p>

        <form
          className="mt-8 space-y-5"
          noValidate
          onSubmit={handleSubmit(submitLogin)}
        >
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
              aria-describedby={errors.email ? "login-email-error" : undefined}
              {...register("email", {
                required: "Email address is required.",
                validate: (value) =>
                  isValidEmail(value.trim()) ||
                  "Enter a valid email address of 254 characters or fewer.",
              })}
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 outline-none focus:border-brand-600"
            />
            {errors.email && (
              <p id="login-email-error" role="alert" className="mt-1 text-sm text-red-700">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "login-password-error" : undefined}
              {...register("password", {
                required: "Password is required.",
                minLength: {
                  value: 8,
                  message: "Password must be between 8 and 128 characters.",
                },
                maxLength: {
                  value: 128,
                  message: "Password must be between 8 and 128 characters.",
                },
              })}
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 outline-none focus:border-brand-600"
            />
            {errors.password && (
              <p id="login-password-error" role="alert" className="mt-1 text-sm text-red-700">
                {errors.password.message}
              </p>
            )}
            <div className="mt-2 text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-brand-800 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {serverError && <p role="alert" className="text-sm text-red-700">{serverError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-700 px-4 py-3 font-semibold text-white transition hover:bg-brand-800 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-brand-800 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}