"use client";

import {FormEvent, useEffect, useState} from "react";

type Bank = {
	id: string;
	name: string;
};

type CreateBankAccountFormProps = {
	companyId: string;
	onAccountCreated: () => void;
};

export default function CreateBankAccountForm({
	                                              companyId,
	                                              onAccountCreated,
                                              }: CreateBankAccountFormProps) {
	const [banks, setBanks] = useState<Bank[]>([]);
	const [bankId, setBankId] = useState("");
	const [accountNumber, setAccountNumber] = useState("");
	const [iban, setIban] = useState("");
	const [ownerName, setOwnerName] = useState("");

	const [loadingBanks, setLoadingBanks] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [message, setMessage] = useState("");

	useEffect(() => {
		async function loadBanks() {
			try {
				const response = await fetch("/api/banks");

				if (!response.ok) {
					throw new Error("Failed to load banks");
				}

				const data = await response.json();

				setBanks(data.banks);
			} catch {
				setMessage("خطا در دریافت لیست بانک‌ها");
			} finally {
				setLoadingBanks(false);
			}
		}

		loadBanks();
	}, []);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		setSubmitting(true);
		setMessage("");

		try {
			const response = await fetch(
					`/api/companies/${companyId}/bank-accounts`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							bankId,
							accountNumber,
							iban,
							ownerName,
						}),
					}
			);

			const data = await response.json();

			if (!response.ok) {
				setMessage(data.message || "خطا در ثبت حساب بانکی");
				return;
			}

			setMessage("حساب بانکی با موفقیت ثبت شد");

			setBankId("");
			setAccountNumber("");
			setIban("");
			setOwnerName("");

			onAccountCreated();
		} catch {
			setMessage("خطا در ارتباط با سرور");
		} finally {
			setSubmitting(false);
		}
	}

	return (
			<form
					onSubmit={handleSubmit}
					className="w-full max-w-3xl space-y-5"
			>
				<div className="grid gap-5 md:grid-cols-2">
					<div className="space-y-2">
						<label
								htmlFor="bank"
								className="block text-sm font-medium text-[#5B21B6]"
						>
							بانک
						</label>

						<select
								id="bank"
								value={bankId}
								onChange={(event) => setBankId(event.target.value)}
								disabled={loadingBanks || submitting}
								required
								className="w-full rounded-xl border border-[#DDD6FE] bg-white px-3 py-3 text-sm text-[#2E1065] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#C4B5FD] disabled:cursor-not-allowed disabled:bg-[#F5F3FF] disabled:opacity-60"
						>
							<option value="">
								{loadingBanks
										? "در حال دریافت بانک‌ها..."
										: "بانک را انتخاب کنید"}
							</option>

							{banks.map((bank) => (
									<option key={bank.id} value={bank.id}>
										{bank.name}
									</option>
							))}
						</select>
					</div>

					<div className="space-y-2">
						<label
								htmlFor="accountNumber"
								className="block text-sm font-medium text-[#5B21B6]"
						>
							شماره حساب
						</label>

						<input
								id="accountNumber"
								value={accountNumber}
								onChange={(event) => setAccountNumber(event.target.value)}
								placeholder="شماره حساب"
								disabled={submitting}
								className="w-full rounded-xl border border-[#DDD6FE] bg-white px-3 py-3 text-sm text-[#2E1065] placeholder:text-[#A78BCA] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#C4B5FD] disabled:cursor-not-allowed disabled:bg-[#F5F3FF] disabled:opacity-60"
						/>
					</div>

					<div className="space-y-2">
						<label
								htmlFor="iban"
								className="block text-sm font-medium text-[#5B21B6]"
						>
							شماره شبا
						</label>

						<input
								id="iban"
								value={iban}
								onChange={(event) => setIban(event.target.value)}
								placeholder="IR..."
								dir="ltr"
								disabled={submitting}
								className="w-full rounded-xl border border-[#DDD6FE] bg-white px-3 py-3 text-sm text-[#2E1065] placeholder:text-[#A78BCA] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#C4B5FD] disabled:cursor-not-allowed disabled:bg-[#F5F3FF] disabled:opacity-60"
						/>
					</div>

					<div className="space-y-2">
						<label
								htmlFor="ownerName"
								className="block text-sm font-medium text-[#5B21B6]"
						>
							نام صاحب حساب
						</label>

						<input
								id="ownerName"
								value={ownerName}
								onChange={(event) => setOwnerName(event.target.value)}
								placeholder="نام صاحب حساب"
								disabled={submitting}
								className="w-full rounded-xl border border-[#DDD6FE] bg-white px-3 py-3 text-sm text-[#2E1065] placeholder:text-[#A78BCA] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#C4B5FD] disabled:cursor-not-allowed disabled:bg-[#F5F3FF] disabled:opacity-60"
						/>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-3 pt-1">
					<button
							type="submit"
							disabled={submitting || loadingBanks || !bankId}
							className="rounded-xl bg-[#6D28D9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4C1D95] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{submitting ? "در حال ثبت..." : "ثبت حساب بانکی"}
					</button>

					{message && (
							<p
									className={`rounded-lg px-3 py-2 text-sm ${
											message.includes("موفقیت")
													? "bg-[#F5F3FF] text-[#5B21B6]"
													: "bg-red-50 text-red-600"
									}`}
							>
								{message}
							</p>
					)}
				</div>
			</form>
	);
}