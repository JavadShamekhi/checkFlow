"use client";

import {useRouter} from "next/navigation";
import {FormEvent, useState} from "react";
import {signIn} from "next-auth/react";

export default function LoginPage() {
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		setError("");

		const result = await signIn("credentials", {
			email,
			password,
			redirect: false,
		});

		if (!result || result.error) {
			setError("Invalid email or password");
			return;
		}

		router.push("/dashboard");
		router.refresh();
	}

	return (
			<main>
				<h1>Login</h1>

				<form onSubmit={handleSubmit}>
					<div>
						<label htmlFor="email">Email address</label>

						<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
						/>
					</div>

					<div>
						<label htmlFor="password">Password</label>

						<input
								id="password"
								type="password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								required
						/>
					</div>

					{error && <p>{error}</p>}

					<button type="submit">
						Login
					</button>
				</form>
			</main>
	);
}