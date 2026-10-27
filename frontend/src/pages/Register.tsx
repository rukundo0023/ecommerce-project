
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useToast } from "../context/useToast";
import { signUp } from "../lib/api";
import { isValidEmail } from "../lib/validation";

interface RegisterFields {
  name: string;
  email: string;
  password: string;
  confirmation: string;
}

export default function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegisterFields>({ mode: "onBlur", reValidateMode: "onChange" });
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

  const submitRegistration = async ({ name, email, password }: RegisterFields) => {
    setServerError("");
    try {
      await registerMutation.mutateAsync({ name: name.trim(), email: email.trim(), password });
      showToast("Your account has been created. Please sign in.", "success");
      navigate("/login");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Registration failed. Please try again.";
      setServerError(message);
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
          noValidate
          onSubmit={handleSubmit(submitRegistration)}
        >
          <div>
            <label htmlFor="name" className="mb-1 block font-medium">
              Full name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "register-name-error" : undefined}
              {...register("name", {
                required: "Enter your name using 1 to 100 characters.",
                maxLength: {
                  value: 100,
                  message: "Enter your name using 1 to 100 characters.",
                },
                validate: (value) =>
                  Boolean(value.trim()) || "Enter a name that includes at least one non-space character.",
              })}
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 outline-none focus:border-brand-600"
            />
            {errors.name && (
              <p id="register-name-error" role="alert" className="mt-1 text-sm text-red-700">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block font-medium">
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
              aria-describedby={errors.email ? "register-email-error" : undefined}
              {...register("email", {
                required: "Email address is required.",
                validate: (value) =>
                  isValidEmail(value.trim()) ||
                  "Enter a valid email address of 254 characters or fewer.",
              })}
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 outline-none focus:border-brand-600"
            />
            {errors.email && (
              <p id="register-email-error" role="alert" className="mt-1 text-sm text-red-700">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "register-password-error" : undefined}
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
                deps: "confirmation",
              })}
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-700"
            />
            {errors.password && (
              <p id="register-password-error" role="alert" className="mt-1 text-sm text-red-700">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-1 block font-medium">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmation)}
              aria-describedby={errors.confirmation ? "register-confirmation-error" : undefined}
              {...register("confirmation", {
                required: "Please confirm your password.",
                validate: (value) =>
                  value === getValues("password") || "The passwords do not match.",
              })}
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-700"
            />
            {errors.confirmation && (
              <p id="register-confirmation-error" role="alert" className="mt-1 text-sm text-red-700">{errors.confirmation.message}</p>
            )}
          </div>

          {serverError && <p role="alert" className="text-sm text-red-700">{serverError}</p>}

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