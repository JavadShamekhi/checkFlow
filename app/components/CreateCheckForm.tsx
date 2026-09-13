"use client";

import {FormEvent, useState} from "react";
import {useRouter} from "next/navigation";

type CreateCheckFormProps = {
	companyId: string;
};

type CheckType = "RECEIVABLE" | "PAYABLE";
type PartyType = "INDIVIDUAL" | "LEGAL_ENTITY";

export default function CreateCheckForm({
	                                        companyId,
                                        }: CreateCheckFormProps) {
	const router = useRouter();

	const [type, setType] = useState<CheckType>("RECEIVABLE");

	// Check identity
	const [sayadId, setSayadId] = useState("");
	const [series, setSeries] = useState("");
	const [serial, setSerial] = useState("");

	// Bank
	const [bankId, setBankId] = useState("");
	const [bankAccountId, setBankAccountId] = useState("");

	// Financial
	const [amount, setAmount] = useState("");
	const [dueDate, setDueDate] = useState("");

	// Issuer
	const [issuerType, setIssuerType] =
			useState<PartyType>("INDIVIDUAL");
	const [issuerName, setIssuerName] = useState("");
	const [issuerNationalId, setIssuerNationalId] =
			useState("");

	// Recipient
	const [recipientType, setRecipientType] =
			useState<PartyType>("INDIVIDUAL");
	const [recipientName, setRecipientName] =
			useState("");
	const [recipientNationalId, setRecipientNationalId] =
			useState("");

	// Business
	const [handedOverAt, setHandedOverAt] =
			useState("");
	const [description, setDescription] =
			useState("");

	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(
			event: FormEvent<HTMLFormElement>
	) {
		event.preventDefault();

		setError("");
		setSuccess("");
		setLoading(true);

		try {
			const response = await fetch(
					`/api/companies/${companyId}/checks`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							type,

							sayadId,
							series,
							serial,

							bankId: bankId || undefined,
							bankAccountId:
									bankAccountId || undefined,

							amount,
							dueDate,

							issuerType,
							issuerName,
							issuerNationalId,

							recipientType,
							recipientName,
							recipientNationalId,

							handedOverAt:
									handedOverAt || undefined,

							description,
						}),
					}
			);

			const data = await response.json();

			if (!response.ok) {
				setError(
						data.message ?? "Something went wrong"
				);
				return;
			}

			setSuccess(
					"Check created successfully."
			);

			// Reset form
			setSayadId("");
			setSeries("");
			setSerial("");

			setBankId("");
			setBankAccountId("");

			setAmount("");
			setDueDate("");

			setIssuerType("INDIVIDUAL");
			setIssuerName("");
			setIssuerNationalId("");

			setRecipientType("INDIVIDUAL");
			setRecipientName("");
			setRecipientNationalId("");

			setHandedOverAt("");
			setDescription("");

			router.refresh();
		} catch {
			setError("Something went wrong");
		} finally {
			setLoading(false);
		}
	}

	return (
			<section className="mt-8 max-w-3xl rounded-lg border p-6">
				<h2 className="text-xl font-semibold">
					Add new check
				</h2>

				<form
						onSubmit={handleSubmit}
						className="mt-6 space-y-6"
				>
					{/* Check type */}
					<div>
						<label className="mb-2 block">
							Check type
						</label>

						<select
								value={type}
								onChange={(event) =>
										setType(
												event.target.value as CheckType
										)
								}
								className="w-full rounded-md border px-4 py-2"
						>
							<option value="RECEIVABLE">
								Receivable
							</option>

							<option value="PAYABLE">
								Payable
							</option>
						</select>
					</div>

					{/* Check identity */}
					<div className="border-t pt-6">
						<h3 className="text-lg font-semibold">
							Check information
						</h3>

						<div className="mt-4 grid gap-4 md:grid-cols-3">
							<div>
								<label
										htmlFor="sayad-id"
										className="mb-2 block"
								>
									Sayad ID
								</label>

								<input
										id="sayad-id"
										type="text"
										inputMode="numeric"
										maxLength={16}
										value={sayadId}
										onChange={(event) =>
												setSayadId(event.target.value)
										}
										className="w-full rounded-md border px-4 py-2"
										placeholder="16 digits"
										required
								/>
							</div>

							<div>
								<label
										htmlFor="series"
										className="mb-2 block"
								>
									Series
								</label>

								<input
										id="series"
										type="text"
										value={series}
										onChange={(event) =>
												setSeries(event.target.value)
										}
										className="w-full rounded-md border px-4 py-2"
										placeholder="Check series"
										required
								/>
							</div>

							<div>
								<label
										htmlFor="serial"
										className="mb-2 block"
								>
									Serial
								</label>

								<input
										id="serial"
										type="text"
										value={serial}
										onChange={(event) =>
												setSerial(event.target.value)
										}
										className="w-full rounded-md border px-4 py-2"
										placeholder="Check serial"
										required
								/>
							</div>
						</div>
					</div>

					{/* Bank */}
					<div className="border-t pt-6">
						<h3 className="text-lg font-semibold">
							Bank information
						</h3>

						<div className="mt-4 grid gap-4 md:grid-cols-2">
							<div>
								<label
										htmlFor="bank-id"
										className="mb-2 block"
								>
									Bank ID
								</label>

								<input
										id="bank-id"
										type="text"
										value={bankId}
										onChange={(event) =>
												setBankId(event.target.value)
										}
										className="w-full rounded-md border px-4 py-2"
										placeholder="Bank ID"
										required
								/>
							</div>

							<div>
								<label
										htmlFor="bank-account-id"
										className="mb-2 block"
								>
									Bank account ID
								</label>

								<input
										id="bank-account-id"
										type="text"
										value={bankAccountId}
										onChange={(event) =>
												setBankAccountId(
														event.target.value
												)
										}
										className="w-full rounded-md border px-4 py-2"
										placeholder="Optional"
								/>
							</div>
						</div>
					</div>

					{/* Financial information */}
					<div className="border-t pt-6">
						<h3 className="text-lg font-semibold">
							Financial information
						</h3>

						<div className="mt-4 grid gap-4 md:grid-cols-2">
							<div>
								<label
										htmlFor="amount"
										className="mb-2 block"
								>
									Amount
								</label>

								<input
										id="amount"
										type="number"
										min="1"
										step="0.01"
										value={amount}
										onChange={(event) =>
												setAmount(event.target.value)
										}
										className="w-full rounded-md border px-4 py-2"
										placeholder="Enter amount"
										required
								/>
							</div>

							<div>
								<label
										htmlFor="due-date"
										className="mb-2 block"
								>
									Due date
								</label>

								<input
										id="due-date"
										type="date"
										value={dueDate}
										onChange={(event) =>
												setDueDate(event.target.value)
										}
										className="w-full rounded-md border px-4 py-2"
										required
								/>
							</div>
						</div>
					</div>

					{/* Issuer */}
					<div className="border-t pt-6">
						<h3 className="text-lg font-semibold">
							Issuer
						</h3>

						<div className="mt-4 space-y-4">
							<div>
								<label className="mb-2 block">
									Party type
								</label>

								<select
										value={issuerType}
										onChange={(event) =>
												setIssuerType(
														event.target.value as PartyType
												)
										}
										className="w-full rounded-md border px-4 py-2"
								>
									<option value="INDIVIDUAL">
										Individual
									</option>

									<option value="LEGAL_ENTITY">
										Legal entity
									</option>
								</select>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<label
											htmlFor="issuer-name"
											className="mb-2 block"
									>
										Name
									</label>

									<input
											id="issuer-name"
											type="text"
											value={issuerName}
											onChange={(event) =>
													setIssuerName(
															event.target.value
													)
											}
											className="w-full rounded-md border px-4 py-2"
											placeholder="Issuer name"
									/>
								</div>

								<div>
									<label
											htmlFor="issuer-national-id"
											className="mb-2 block"
									>
										National ID
									</label>

									<input
											id="issuer-national-id"
											type="text"
											value={issuerNationalId}
											onChange={(event) =>
													setIssuerNationalId(
															event.target.value
													)
											}
											className="w-full rounded-md border px-4 py-2"
											placeholder="National / legal entity ID"
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Recipient */}
					<div className="border-t pt-6">
						<h3 className="text-lg font-semibold">
							Recipient
						</h3>

						<div className="mt-4 space-y-4">
							<div>
								<label className="mb-2 block">
									Party type
								</label>

								<select
										value={recipientType}
										onChange={(event) =>
												setRecipientType(
														event.target.value as PartyType
												)
										}
										className="w-full rounded-md border px-4 py-2"
								>
									<option value="INDIVIDUAL">
										Individual
									</option>

									<option value="LEGAL_ENTITY">
										Legal entity
									</option>
								</select>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<label
											htmlFor="recipient-name"
											className="mb-2 block"
									>
										Name
									</label>

									<input
											id="recipient-name"
											type="text"
											value={recipientName}
											onChange={(event) =>
													setRecipientName(
															event.target.value
													)
											}
											className="w-full rounded-md border px-4 py-2"
											placeholder="Recipient name"
									/>
								</div>

								<div>
									<label
											htmlFor="recipient-national-id"
											className="mb-2 block"
									>
										National ID
									</label>

									<input
											id="recipient-national-id"
											type="text"
											value={recipientNationalId}
											onChange={(event) =>
													setRecipientNationalId(
															event.target.value
													)
											}
											className="w-full rounded-md border px-4 py-2"
											placeholder="National / legal entity ID"
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Business information */}
					<div className="border-t pt-6">
						<h3 className="text-lg font-semibold">
							Additional information
						</h3>

						<div className="mt-4 space-y-4">
							<div>
								<label
										htmlFor="handed-over-at"
										className="mb-2 block"
								>
									Handed over date
								</label>

								<input
										id="handed-over-at"
										type="date"
										value={handedOverAt}
										onChange={(event) =>
												setHandedOverAt(
														event.target.value
												)
										}
										className="w-full rounded-md border px-4 py-2"
								/>
							</div>

							<div>
								<label
										htmlFor="description"
										className="mb-2 block"
								>
									Description
								</label>

								<textarea
										id="description"
										value={description}
										onChange={(event) =>
												setDescription(
														event.target.value
												)
										}
										className="min-h-24 w-full rounded-md border px-4 py-2"
										placeholder="Optional description"
								/>
							</div>
						</div>
					</div>

					{error && (
							<p className="text-sm text-red-500">
								{error}
							</p>
					)}

					{success && (
							<p className="text-sm text-green-600">
								{success}
							</p>
					)}

					<button
							type="submit"
							disabled={loading}
							className="rounded-md bg-black px-5 py-2 text-white disabled:opacity-50"
					>
						{loading
								? "Creating..."
								: "Create Check"}
					</button>
				</form>
			</section>
	);
}