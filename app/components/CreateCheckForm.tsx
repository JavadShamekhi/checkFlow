"use client";
import {FormEvent, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import type {Check} from "@/app/types/check-types";

type CreateCheckFormProps = {
	companyId: string;
	onCheckCreated: () => void;
	editingCheck: Check | null;
	onEditFinished: () => void;
};
type CheckType = "RECEIVABLE" | "PAYABLE";
type PartyType = "INDIVIDUAL" | "LEGAL_ENTITY";
type Bank = { id: string; name: string; };
type BankAccount = {
	id: string;
	bankId: string;
	accountNumber: string | null;
	iban: string | null;
	ownerName: string | null;
	bank: { id: string; name: string; };
};
type CheckFormData = {
	type: CheckType;
	sayadId: string;
	series: string;
	serial: string;
	bankId: string;
	bankAccountId: string;
	amount: string;
	dueDate: string;
	issuerType: PartyType;
	issuerName: string;
	issuerNationalId: string;
	recipientType: PartyType;
	recipientName: string;
	recipientNationalId: string;
	handedOverAt: string;
	description: string;
};
const initialFormData: CheckFormData = {
	type: "RECEIVABLE",
	sayadId: "",
	series: "",
	serial: "",
	bankId: "",
	bankAccountId: "",
	amount: "",
	dueDate: "",
	issuerType: "INDIVIDUAL",
	issuerName: "",
	issuerNationalId: "",
	recipientType: "INDIVIDUAL",
	recipientName: "",
	recipientNationalId: "",
	handedOverAt: "",
	description: "",
};

function getInitialFormData(editingCheck: Check | null): CheckFormData {
	if (!editingCheck) {
		return initialFormData;
	}
	return {
		type: editingCheck.type,
		sayadId: editingCheck.sayadId,
		series: editingCheck.series,
		serial: editingCheck.serial,
		bankId: editingCheck.bankId,
		bankAccountId: editingCheck.bankAccountId ?? "",
		amount: editingCheck.amount,
		dueDate: new Date(editingCheck.dueDate).toISOString().split("T")[0],
		issuerType: editingCheck.issuerType ?? "INDIVIDUAL",
		issuerName: editingCheck.issuerName ?? "",
		issuerNationalId: editingCheck.issuerNationalId ?? "",
		recipientType: editingCheck.recipientType ?? "INDIVIDUAL",
		recipientName: editingCheck.recipientName ?? "",
		recipientNationalId: editingCheck.recipientNationalId ?? "",
		handedOverAt: editingCheck.handedOverAt ? new Date(editingCheck.handedOverAt).toISOString().split("T")[0] : "",
		description: editingCheck.description ?? "",
	};
}

export default function CreateCheckForm({
	                                        companyId,
	                                        onCheckCreated,
	                                        editingCheck,
	                                        onEditFinished,
                                        }: CreateCheckFormProps) {
	const router = useRouter();
	const isEditing = editingCheck !== null;
	const [formData, setFormData] = useState<CheckFormData>(() => getInitialFormData(editingCheck));
	const [banks, setBanks] = useState<Bank[]>([]);
	const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);

	function updateFormData<K extends keyof CheckFormData>(field: K, value: CheckFormData[K]) {
		setFormData((current) => ({...current, [field]: value,}));
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);
		try {
			const response = await fetch(isEditing ? `/api/companies/${companyId}/checks/${editingCheck.id}` : `/api/companies/${companyId}/checks`, {
				method: isEditing ? "PUT" : "POST",
				headers: {"Content-Type": "application/json",},
				body: JSON.stringify({
					...formData,
					bankId: formData.bankId || undefined,
					bankAccountId: formData.bankAccountId || undefined,
					handedOverAt: formData.handedOverAt || undefined,
				}),
			});
			const data = await response.json();
			if (!response.ok) {
				setError(data.message ?? "Something went wrong");
				return;
			}
			setSuccess(isEditing ? "Check updated successfully." : "Check created successfully.");
			setFormData(initialFormData);
			onCheckCreated();
			if (isEditing) {
				onEditFinished();
			}
			router.refresh();
		} catch {
			setError("Something went wrong");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		async function fetchData() {
			try {
				const [banksResponse, accountsResponse,] = await Promise.all([fetch("/api/banks"), fetch(`/api/companies/${companyId}/bank-accounts`),]);
				const banksData = await banksResponse.json();
				const accountsData = await accountsResponse.json();
				if (!banksResponse.ok) {
					throw new Error(banksData.message || "Failed to fetch banks");
				}
				if (!accountsResponse.ok) {
					throw new Error(accountsData.message || "Failed to fetch bank accounts");
				}
				setBanks(banksData.banks);
				setBankAccounts(accountsData.bankAccounts);
			} catch (error) {
				console.error(error);
			}
		}

		fetchData();
	}, [companyId]);

	function handleBankChange(value: string) {
		setFormData((current) => ({...current, bankId: value, bankAccountId: "",}));
	}

	const filteredBankAccounts = bankAccounts.filter((account) => account.bankId === formData.bankId);
	return (
			<section className="mt-8 max-w-3xl rounded-lg border p-6">
				<h2
						className="text-xl font-semibold"> {isEditing ? "ویرایش چک" : "ثبت چک جدید"}
				</h2>
				<form onSubmit={handleSubmit} className="mt-6 space-y-6">
					{/* Check type */}
					<div>
						<label className="mb-2 block"> Check type </label>
						<select
								value={formData.type}
								onChange={(event) => updateFormData("type", event.target.value as CheckType)}
								className="w-full rounded-md border px-4 py-2">
							<option value="RECEIVABLE"> Receivable</option>
							<option value="PAYABLE"> Payable</option>
						</select>
					</div>
					{/* Check identity */}
					<div className="border-t pt-6">
						<h3 className="text-lg font-semibold"> Check information </h3>
						<div className="mt-4 grid gap-4 md:grid-cols-3">
							<div>
								<label htmlFor="sayad-id" className="mb-2 block"> Sayad ID </label>
								<input
										id="sayad-id"
										type="text"
										inputMode="numeric"
										maxLength={16}
										value={formData.sayadId}
										onChange={(event) => updateFormData("sayadId", event.target.value)}
										className="w-full rounded-md border px-4 py-2"
										placeholder="16 digits"
										required
								/>
							</div>
							<div>
								<label htmlFor="series" className="mb-2 block"> Series </label>
								<input
										id="series"
										type="text"
										value={formData.series}
										onChange={(event) => updateFormData("series", event.target.value)}
										className="w-full rounded-md border px-4 py-2"
										placeholder="Check series"
										required
								/>
							</div>
							<div>
								<label htmlFor="serial" className="mb-2 block"> Serial </label>
								<input
										id="serial"
										type="text"
										value={formData.serial}
										onChange={(event) => updateFormData("serial", event.target.value)}
										className="w-full rounded-md border px-4 py-2"
										placeholder="Check serial"
										required
								/>
							</div>
						</div>
					</div>
					{/* Bank */}
					<div className="border-t pt-6">
						<h3 className="text-lg font-semibold"> Bank information </h3>
						<div className="mt-4 grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<label htmlFor="bankId" className="text-sm font-medium"> بانک </label>
								<select
										id="bankId"
										value={formData.bankId}
										onChange={(event) => handleBankChange(event.target.value)}
										className="w-full rounded-md border bg-background px-3 py-2"
										required
								>
									<option value=""> انتخاب بانک</option>
									{banks.map((bank) => (
											<option key={bank.id} value={bank.id}> {bank.name} </option>))}
								</select>
							</div>
							<div className="space-y-2">
								<label htmlFor="bankAccountId" className="text-sm font-medium"> حساب بانکی </label>
								<select
										id="bankAccountId"
										value={formData.bankAccountId}
										onChange={(event) => updateFormData("bankAccountId", event.target.value)}
										className="w-full rounded-md border bg-background px-3 py-2"
										disabled={!formData.bankId}
								>
									<option value=""> {formData.bankId ? "انتخاب حساب بانکی" : "ابتدا بانک را انتخاب کنید"} </option>
									{filteredBankAccounts.map((account) => (<option key={account.id}
									                                                value={account.id}> {account.accountNumber || account.iban || account.ownerName || "حساب بانکی"} </option>))}
								</select>
							</div>
						</div>
					</div>
					{/* Financial information */}
					<div className="border-t pt-6">
						<h3 className="text-lg font-semibold"> Financial information </h3>
						<div className="mt-4 grid gap-4 md:grid-cols-2">
							<div>
								<label htmlFor="amount" className="mb-2 block"> Amount </label>
								<input
										id="amount"
										type="number"
										min="1"
										step="0.01"
										value={formData.amount}
										onChange={(event) => updateFormData("amount", event.target.value)}
										className="w-full rounded-md border px-4 py-2"
										placeholder="Enter amount"
										required
								/>
							</div>
							<div>
								<label htmlFor="due-date" className="mb-2 block"> Due date </label>
								<input
										id="due-date"
										type="date"
										value={formData.dueDate}
										onChange={(event) => updateFormData("dueDate", event.target.value)}
										className="w-full rounded-md border px-4 py-2"
										required
								/>
							</div>
						</div>
					</div>
					{/* Issuer */}
					<div className="border-t pt-6">
						<h3 className="text-lg font-semibold"> Issuer </h3>
						<div className="mt-4 space-y-4">
							<div>
								<label className="mb-2 block"> Party type </label>
								<select value={formData.issuerType}
								        onChange={(event) => updateFormData("issuerType", event.target.value as PartyType)}
								        className="w-full rounded-md border px-4 py-2"
								>
									<option value="INDIVIDUAL"> Individual</option>
									<option value="LEGAL_ENTITY"> Legal entity</option>
								</select>
							</div>
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<label htmlFor="issuer-name" className="mb-2 block"> Name </label>
									<input
											id="issuer-name"
											type="text"
											value={formData.issuerName}
											onChange={(event) => updateFormData("issuerName", event.target.value)}
											className="w-full rounded-md border px-4 py-2"
											placeholder="Issuer name"
									/>
								</div>
								<div>
									<label htmlFor="issuer-national-id" className="mb-2 block"> National ID </label>
									<input
											id="issuer-national-id"
											type="text" value={formData.issuerNationalId}
											onChange={(event) => updateFormData("issuerNationalId", event.target.value)}
											className="w-full rounded-md border px-4 py-2"
											placeholder="National / legal entity ID"
									/>
								</div>
							</div>
						</div>
					</div>
					{/* Recipient */}
					<div className="border-t pt-6">
						<h3 className="text-lg font-semibold"> Recipient </h3>
						<div className="mt-4 space-y-4">
							<div>
								<label className="mb-2 block"> Party type </label>
								<select value={formData.recipientType}
								        onChange={(event) => updateFormData("recipientType", event.target.value as PartyType)}
								        className="w-full rounded-md border px-4 py-2"
								>
									<option value="INDIVIDUAL"> Individual</option>
									<option value="LEGAL_ENTITY"> Legal entity</option>
								</select>
							</div>
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<label htmlFor="recipient-name" className="mb-2 block"> Name </label>
									<input
											id="recipient-name"
											type="text"
											value={formData.recipientName}
											onChange={(event) => updateFormData("recipientName", event.target.value)}
											className="w-full rounded-md border px-4 py-2"
											placeholder="Recipient name"
									/>
								</div>
								<div>
									<label htmlFor="recipient-national-id" className="mb-2 block"> National ID </label>
									<input
											id="recipient-national-id"
											type="text"
											value={formData.recipientNationalId}
											onChange={(event) => updateFormData("recipientNationalId", event.target.value)}
											className="w-full rounded-md border px-4 py-2"
											placeholder="National / legal entity ID"/>
								</div>
							</div>
						</div>
					</div>
					{/* Business information */}
					<div className="border-t pt-6">
						<h3 className="text-lg font-semibold"> Additional information </h3>
						<div className="mt-4 space-y-4">
							<div>
								<label htmlFor="handed-over-at" className="mb-2 block"> Handed over date </label>
								<input
										id="handed-over-at"
										type="date"
										value={formData.handedOverAt}
										onChange={(event) => updateFormData("handedOverAt", event.target.value)}
										className="w-full rounded-md border px-4 py-2"/>
							</div>
							<div>
								<label htmlFor="description" className="mb-2 block"> Description </label>
								<textarea
										id="description"
										value={formData.description}
										onChange={(event) => updateFormData("description", event.target.value)}
										className="min-h-24 w-full rounded-md border px-4 py-2"
										placeholder="Optional description"
								/>
							</div>
						</div>
					</div>
					{error && (<p className="text-sm text-red-500"> {error} </p>)} {success && (
						<p className="text-sm text-green-600"> {success} </p>)}
					<button
							type="submit" disabled={loading}
							className="rounded-md bg-black px-5 py-2 text-white disabled:opacity-50"> {loading ? isEditing ? "Updating..." : "Creating..." : isEditing ? "Update Check" : "Create Check"} </button>
					{isEditing && (<button type="button" onClick={onEditFinished} disabled={loading}
					                       className="ml-3 rounded-md border px-5 py-2 disabled:opacity-50"> Cancel </button>)}
				</form>
			</section>);
}