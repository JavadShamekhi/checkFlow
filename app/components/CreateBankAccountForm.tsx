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
	                                              onAccountCreated
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
					className="max-w-xl space-y-4 rounded-lg border p-6"
			>
				<div className="space-y-2">
					<label htmlFor="bank">بانک</label>

					<select
							id="bank"
							value={bankId}
							onChange={(event) => setBankId(event.target.value)}
							disabled={loadingBanks || submitting}
							required
							className="w-full rounded-md border bg-background px-3 py-2"
					>
						<option value="">
							{loadingBanks ? "در حال دریافت بانک‌ها..." : "بانک را انتخاب کنید"}
						</option>

						{banks.map((bank) => (
								<option key={bank.id} value={bank.id}>
									{bank.name}
								</option>
						))}
					</select>
				</div>

				<div className="space-y-2">
					<label htmlFor="accountNumber">شماره حساب</label>

					<input
							id="accountNumber"
							value={accountNumber}
							onChange={(event) => setAccountNumber(event.target.value)}
							placeholder="شماره حساب"
							disabled={submitting}
							className="w-full rounded-md border bg-background px-3 py-2"
					/>
				</div>

				<div className="space-y-2">
					<label htmlFor="iban">شماره شبا</label>

					<input
							id="iban"
							value={iban}
							onChange={(event) => setIban(event.target.value)}
							placeholder="IR..."
							disabled={submitting}
							className="w-full rounded-md border bg-background px-3 py-2"
					/>
				</div>

				<div className="space-y-2">
					<label htmlFor="ownerName">نام صاحب حساب</label>

					<input
							id="ownerName"
							value={ownerName}
							onChange={(event) => setOwnerName(event.target.value)}
							placeholder="نام صاحب حساب"
							disabled={submitting}
							className="w-full rounded-md border bg-background px-3 py-2"
					/>
				</div>

				<button
						type="submit"
						disabled={submitting || loadingBanks || !bankId}
						className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
				>
					{submitting ? "در حال ثبت..." : "ثبت حساب بانکی"}
				</button>

				{message && (
						<p className="text-sm text-muted-foreground">{message}</p>
				)}
			</form>
	);
}