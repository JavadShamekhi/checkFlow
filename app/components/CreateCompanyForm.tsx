"use client";

import {FormEvent, useState} from "react";
import {useRouter} from "next/navigation";

export default function CreateCompanyForm() {
	const router = useRouter();

	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		setError("");
		setLoading(true);

		try {
			const response = await fetch("/api/companies", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.message ?? "خطایی رخ داد");
				return;
			}

			setName("");
			router.refresh();
		} catch {
			setError("خطایی در ارتباط با سرور رخ داد");
		} finally {
			setLoading(false);
		}
	}

	return (
			<form
					onSubmit={handleSubmit}
					dir="rtl"
					className="w-full max-w-2xl"
			>
				<div>
					<label
							htmlFor="company-name"
							className="mb-2 block text-sm font-semibold text-[#5B21B6]"
					>
						نام شرکت
					</label>

					<input
							id="company-name"
							type="text"
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="نام شرکت را وارد کنید"
							className="w-full rounded-xl border border-[#DDD6FE] bg-white px-4 py-3 text-sm text-[#2E1065] outline-none transition placeholder:text-[#A78BCA] focus:border-[#6D28D9] focus:ring-2 focus:ring-[#C4B5FD] disabled:cursor-not-allowed disabled:bg-[#F5F3FF]"
							required
							disabled={loading}
					/>
				</div>

				{error && (
						<div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
							<p className="text-sm font-medium text-red-600">
								{error}
							</p>
						</div>
				)}

				<div className="mt-5 flex items-center">
					<button
							type="submit"
							disabled={loading}
							className="rounded-xl bg-[#4C1D95] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{loading ? "در حال ایجاد..." : "ایجاد شرکت"}
					</button>
				</div>
			</form>
	);
}