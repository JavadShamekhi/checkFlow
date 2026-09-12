"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
				setError(data.message ?? "Something went wrong");
				return;
			}

			setName("");
			router.refresh();
		} catch {
			setError("Something went wrong");
		} finally {
			setLoading(false);
		}
	}

	return (
			<form onSubmit={handleSubmit} className="mt-8 max-w-md">
				<div>
					<label
							htmlFor="company-name"
							className="mb-2 block"
					>
						Company name
					</label>

					<input
							id="company-name"
							type="text"
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="Enter company name"
							className="w-full rounded-md border px-4 py-2"
							required
					/>
				</div>

				{error && (
						<p className="mt-2 text-sm text-red-500">
							{error}
						</p>
				)}

				<button
						type="submit"
						disabled={loading}
						className="mt-4 rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
				>
					{loading ? "Creating..." : "Create Company"}
				</button>
			</form>
	);
}