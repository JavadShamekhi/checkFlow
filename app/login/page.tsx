"use client";

import {useRouter} from "next/navigation";
import {FormEvent, useState} from "react";
import {signIn} from "next-auth/react";

export default function LoginPage() {
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		setError("");
		setLoading(true);

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (!result || result.error) {
				setError("ایمیل یا رمز عبور اشتباه است");
				return;
			}

			router.push("/dashboard");
			router.refresh();
		} catch {
			setError("خطا در ورود به حساب کاربری");
		} finally {
			setLoading(false);
		}
	}

	return (
			<main
					dir="rtl"
					className="flex min-h-screen items-center justify-center bg-[#F5F3FF] px-4 py-8"
			>
				<div className="w-full max-w-md">
					<div className="overflow-hidden rounded-3xl border border-[#DDD6FE] bg-white shadow-lg">
						{/* Header */}
						<div className="bg-[#4C1D95] px-6 py-8 text-center text-white sm:px-8">
							<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6D28D9]">
								<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.8"
										className="h-7 w-7"
								>
									<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
									/>
									<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="m10 17 5-5-5-5"
									/>
									<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M15 12H3"
									/>
								</svg>
							</div>

							<h1 className="text-2xl font-bold">
								ورود به CheckFlow
							</h1>

							<p className="mt-2 text-sm text-[#DDD6FE]">
								برای ورود به حساب کاربری خود وارد شوید.
							</p>
						</div>

						{/* Form */}
						<form
								onSubmit={handleSubmit}
								className="space-y-5 p-6 sm:p-8"
						>
							<div className="space-y-2">
								<label
										htmlFor="email"
										className="block text-sm font-medium text-[#5B21B6]"
								>
									ایمیل
								</label>

								<input
										id="email"
										type="email"
										value={email}
										onChange={(event) =>
												setEmail(event.target.value)
										}
										placeholder="example@email.com"
										dir="ltr"
										autoComplete="email"
										required
										disabled={loading}
										className="w-full rounded-xl border border-[#DDD6FE] bg-white px-4 py-3 text-sm text-[#2E1065] outline-none transition placeholder:text-[#A78BCA] focus:border-[#6D28D9] focus:ring-2 focus:ring-[#C4B5FD] disabled:cursor-not-allowed disabled:bg-[#F5F3FF] disabled:opacity-60"
								/>
							</div>

							<div className="space-y-2">
								<label
										htmlFor="password"
										className="block text-sm font-medium text-[#5B21B6]"
								>
									رمز عبور
								</label>

								<input
										id="password"
										type="password"
										value={password}
										onChange={(event) =>
												setPassword(event.target.value)
										}
										placeholder="رمز عبور"
										dir="ltr"
										autoComplete="current-password"
										required
										disabled={loading}
										className="w-full rounded-xl border border-[#DDD6FE] bg-white px-4 py-3 text-sm text-[#2E1065] outline-none transition placeholder:text-[#A78BCA] focus:border-[#6D28D9] focus:ring-2 focus:ring-[#C4B5FD] disabled:cursor-not-allowed disabled:bg-[#F5F3FF] disabled:opacity-60"
								/>
							</div>

							{error && (
									<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
										<p className="text-sm font-medium text-red-600">
											{error}
										</p>
									</div>
							)}

							<button
									type="submit"
									disabled={loading}
									className="w-full rounded-xl bg-[#6D28D9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4C1D95] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
							>
								{loading ? "در حال ورود..." : "ورود"}
							</button>
						</form>
					</div>

					<p className="mt-5 text-center text-xs text-[#8B7AAE]">
						مدیریت ساده و حرفه‌ای حساب‌ها و چک‌های مالی
					</p>
				</div>
			</main>
	);
}