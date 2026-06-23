"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { registerAccount } from "../lib/api";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
  rememberMe: z.boolean(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: RegisterFormValues) =>
      registerAccount(values.name, values.email, values.password, values.rememberMe),
    onSuccess: () => {
      queryClient.removeQueries();
      router.push("/dashboard");
    },
  });

  return (
    <section className="w-full max-w-md rounded-[8px] border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-primary">
        TeamSync
      </p>
      <h1 className="mt-3 text-[28px] font-bold leading-tight tracking-tight text-neutral-900">
        Create account
      </h1>
      <p className="mt-2 text-[15px] font-normal text-neutral-600">
        Register to start collaborating with your project team.
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
      >
        <label className="block">
          <span className="text-[13px] font-normal text-neutral-700">Name</span>
          <input
            className="mt-1 w-full rounded-[6px] border border-neutral-300 px-3 py-2 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            type="text"
            autoComplete="name"
            {...register("name")}
          />
          {errors.name ? (
            <span className="mt-1 block text-[13px] text-danger">
              {errors.name.message}
            </span>
          ) : null}
        </label>

        <label className="block">
          <span className="text-[13px] font-normal text-neutral-700">Email</span>
          <input
            className="mt-1 w-full rounded-[6px] border border-neutral-300 px-3 py-2 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            type="email"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email ? (
            <span className="mt-1 block text-[13px] text-danger">
              {errors.email.message}
            </span>
          ) : null}
        </label>

        <label className="block">
          <span className="text-[13px] font-normal text-neutral-700">Password</span>
          <input
            className="mt-1 w-full rounded-[6px] border border-neutral-300 px-3 py-2 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password ? (
            <span className="mt-1 block text-[13px] text-danger">
              {errors.password.message}
            </span>
          ) : null}
        </label>

        <div className="flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-[15px] font-normal text-neutral-700">
            <input
              className="h-4 w-4 rounded-[6px] border-neutral-300 text-primary focus:ring-primary/20"
              type="checkbox"
              {...register("rememberMe")}
            />
            Remember me
          </label>
          <Link
            className="text-[13px] font-semibold text-primary hover:text-primary-dark"
            href="/login"
          >
            Back to login
          </Link>
        </div>

        {mutation.isError ? (
          <div className="rounded-[8px] border border-danger bg-white px-3 py-2 text-[13px] text-danger">
            {mutation.error.message}
          </div>
        ) : null}

        <button
          className="w-full rounded-[6px] bg-primary px-4 py-2 text-[15px] font-semibold text-white transition hover:bg-primary-dark"
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Creating account..." : "Create account"}
        </button>
      </form>
    </section>
  );
}
