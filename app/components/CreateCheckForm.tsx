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

type Bank = {
	id: string;
	name: string;
};

type BankAccount = {
	id: string;
	bankId: string;
	accountNumber: string | null;
	iban: string | null;
	ownerName: string | null;
	bank: {
		id: string;
		name: string;
	};
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

function getInitialFormData(
		editingCheck: Check | null
): CheckFormData {
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
		dueDate: new Date(editingCheck.dueDate)
				.toISOString()
				.split("T")[0],
		issuerType: editingCheck.issuerType ?? "INDIVIDUAL",
		issuerName: editingCheck.issuerName ?? "",
		issuerNationalId:
				editingCheck.issuerNationalId ?? "",
		recipientType:
				editingCheck.recipientType ?? "INDIVIDUAL",
		recipientName:
				editingCheck.recipientName ?? "",
		recipientNationalId:
				editingCheck.recipientNationalId ?? "",
		handedOverAt: editingCheck.handedOverAt
				? new Date(editingCheck.handedOverAt)
						.toISOString()
						.split("T")[0]
				: "",
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

	const [formData, setFormData] =
			useState<CheckFormData>(() =>
					getInitialFormData(editingCheck)
			);

	const [banks, setBanks] = useState<Bank[]>([]);
	const [bankAccounts, setBankAccounts] = useState<
			BankAccount[]
	>([]);

	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);

	function updateFormData<K extends keyof CheckFormData>(
			field: K,
			value: CheckFormData[K]
	) {
		setFormData((current) => ({
			...current,
			[field]: value,
		}));
	}

	async function handleSubmit(
			event: FormEvent<HTMLFormElement>
	) {
		event.preventDefault();

		setError("");
		setSuccess("");
		setLoading(true);

		try {
			const response = await fetch(
					isEditing
							? `/api/companies/${companyId}/checks/${editingCheck.id}`
							: `/api/companies/${companyId}/checks`,
					{
						method: isEditing ? "PUT" : "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							...formData,
							bankId: formData.bankId || undefined,
							bankAccountId:
									formData.bankAccountId || undefined,
							handedOverAt:
									formData.handedOverAt || undefined,
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
					isEditing
							? "چک با موفقیت ویرایش شد."
							: "چک با موفقیت ثبت شد."
			);

			setFormData(initialFormData);

			onCheckCreated();

			if (isEditing) {
				onEditFinished();
			}

			router.refresh();
		} catch {
			setError("خطایی رخ داد. دوباره تلاش کنید.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		async function fetchData() {
			try {
				const [
					banksResponse,
					accountsResponse,
				] = await Promise.all([
					fetch("/api/banks"),
					fetch(
							`/api/companies/${companyId}/bank-accounts`
					),
				]);

				const banksData =
						await banksResponse.json();

				const accountsData =
						await accountsResponse.json();

				if (!banksResponse.ok) {
					throw new Error(
							banksData.message ||
							"Failed to fetch banks"
					);
				}

				if (!accountsResponse.ok) {
					throw new Error(
							accountsData.message ||
							"Failed to fetch bank accounts"
					);
				}

				setBanks(banksData.banks);
				setBankAccounts(
						accountsData.bankAccounts
				);
			} catch (error) {
				console.error(error);
			}
		}

		fetchData();
	}, [companyId]);

	function handleBankChange(value: string) {
		setFormData((current) => ({
			...current,
			bankId: value,
			bankAccountId: "",
		}));
	}

	const filteredBankAccounts =
			bankAccounts.filter(
					(account) =>
							account.bankId === formData.bankId
			);

	const inputClassName =
			"w-full rounded-xl border border-[#DDD6FE] bg-white px-4 py-3 text-sm text-[#2E1065] outline-none transition placeholder:text-[#A78BFA] focus:border-[#6D28D9] focus:ring-2 focus:ring-[#C4B5FD]/50 disabled:cursor-not-allowed disabled:bg-[#F5F3FF] disabled:text-[#8B7AAE]";

	const selectClassName =
			"w-full rounded-xl border border-[#DDD6FE] bg-white px-4 py-3 text-sm text-[#2E1065] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#C4B5FD]/50 disabled:cursor-not-allowed disabled:bg-[#F5F3FF] disabled:text-[#8B7AAE] cursor-pointer";

	const sectionClassName =
			"rounded-2xl border border-[#E9D5FF] bg-white p-5 shadow-sm";

	const sectionTitleClassName =
			"text-base font-bold text-[#4C1D95]";

	const labelClassName =
			"mb-2 block text-sm font-medium text-[#5B21B6]";

	return (
			<section
					dir="rtl"
					className="mt-8 max-w-4xl rounded-3xl border border-[#DDD6FE] bg-[#FAF9FF] p-6 shadow-[0_8px_30px_rgba(76,29,149,0.08)] md:p-8"
			>
				<div className="mb-8 border-b border-[#E9D5FF] pb-6">
					<div className="flex items-center gap-3">
						<div
								className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4C1D95] text-lg text-white shadow-sm">
							✓
						</div>

						<div>
							<h2 className="text-2xl font-bold text-[#2E1065]">
								{isEditing
										? "ویرایش چک"
										: "ثبت چک جدید"}
							</h2>

							<p className="mt-1 text-sm text-[#7C6AA8]">
								اطلاعات چک را با دقت وارد کنید.
							</p>
						</div>
					</div>
				</div>

				<form
						onSubmit={handleSubmit}
						className="space-y-5"
				>
					{/* Check type */}
					<section className={sectionClassName}>
						<div className="mb-5 flex items-center justify-between">
							<div>
								<h3
										className={sectionTitleClassName}
								>
									نوع چک
								</h3>

								<p className="mt-1 text-xs text-[#8B7AAE]">
									مشخص کنید این چک دریافتی است یا پرداختی.
								</p>
							</div>
						</div>

						<div>
							<label
									htmlFor="check-type"
									className={labelClassName}
							>
								نوع چک
							</label>

							<select
									id="check-type"
									value={formData.type}
									onChange={(event) =>
											updateFormData(
													"type",
													event.target.value as CheckType
											)
									}
									className={selectClassName}
							>
								<option value="RECEIVABLE">
									دریافتی
								</option>
								<option value="PAYABLE">
									پرداختی
								</option>
							</select>
						</div>
					</section>

					{/* Check identity */}
					<section className={sectionClassName}>
						<h3 className={sectionTitleClassName}>
							اطلاعات چک
						</h3>

						<p className="mt-1 text-xs text-[#8B7AAE]">
							مشخصات اصلی و شناسه چک را وارد کنید.
						</p>

						<div className="mt-5 grid gap-4 md:grid-cols-3">
							<div>
								<label
										htmlFor="sayad-id"
										className={labelClassName}
								>
									شناسه صیاد
								</label>

								<input
										id="sayad-id"
										type="text"
										inputMode="numeric"
										maxLength={16}
										value={formData.sayadId}
										onChange={(event) =>
												updateFormData(
														"sayadId",
														event.target.value
												)
										}
										className={inputClassName}
										placeholder="۱۶ رقم شناسه صیاد"
										required
								/>
							</div>

							<div>
								<label
										htmlFor="series"
										className={labelClassName}
								>
									سری
								</label>

								<input
										id="series"
										type="text"
										value={formData.series}
										onChange={(event) =>
												updateFormData(
														"series",
														event.target.value
												)
										}
										className={inputClassName}
										placeholder="سری چک"
										required
								/>
							</div>

							<div>
								<label
										htmlFor="serial"
										className={labelClassName}
								>
									سریال
								</label>

								<input
										id="serial"
										type="text"
										value={formData.serial}
										onChange={(event) =>
												updateFormData(
														"serial",
														event.target.value
												)
										}
										className={inputClassName}
										placeholder="سریال چک"
										required
								/>
							</div>
						</div>
					</section>

					{/* Bank */}
					<section className={sectionClassName}>
						<h3 className={sectionTitleClassName}>
							اطلاعات بانکی
						</h3>

						<p className="mt-1 text-xs text-[#8B7AAE]">
							بانک و حساب مرتبط با چک را انتخاب کنید.
						</p>

						<div className="mt-5 grid gap-4 md:grid-cols-2">
							<div>
								<label
										htmlFor="bankId"
										className={labelClassName}
								>
									بانک
								</label>

								<select
										id="bankId"
										value={formData.bankId}
										onChange={(event) =>
												handleBankChange(
														event.target.value
												)
										}
										className={selectClassName}
										required
								>
									<option value="">
										انتخاب بانک
									</option>

									{banks.map((bank) => (
											<option
													key={bank.id}
													value={bank.id}
											>
												{bank.name}
											</option>
									))}
								</select>
							</div>

							<div>
								<label
										htmlFor="bankAccountId"
										className={labelClassName}
								>
									حساب بانکی
								</label>

								<select
										id="bankAccountId"
										value={formData.bankAccountId}
										onChange={(event) =>
												updateFormData(
														"bankAccountId",
														event.target.value
												)
										}
										className={selectClassName}
										disabled={!formData.bankId}
								>
									<option value="">
										{formData.bankId
												? "انتخاب حساب بانکی"
												: "ابتدا بانک را انتخاب کنید"}
									</option>

									{filteredBankAccounts.map(
											(account) => (
													<option
															key={account.id}
															value={account.id}
													>
														{account.accountNumber ||
																account.iban ||
																account.ownerName ||
																"حساب بانکی"}
													</option>
											)
									)}
								</select>
							</div>
						</div>
					</section>

					{/* Financial information */}
					<section className={sectionClassName}>
						<h3 className={sectionTitleClassName}>
							اطلاعات مالی
						</h3>

						<p className="mt-1 text-xs text-[#8B7AAE]">
							مبلغ و تاریخ سررسید چک را مشخص کنید.
						</p>

						<div className="mt-5 grid gap-4 md:grid-cols-2">
							<div>
								<label
										htmlFor="amount"
										className={labelClassName}
								>
									مبلغ
								</label>

								<input
										id="amount"
										type="number"
										min="1"
										step="0.01"
										value={formData.amount}
										onChange={(event) =>
												updateFormData(
														"amount",
														event.target.value
												)
										}
										className={inputClassName}
										placeholder="مبلغ چک"
										required
								/>
							</div>

							<div>
								<label
										htmlFor="due-date"
										className={labelClassName}
								>
									تاریخ سررسید
								</label>

								<input
										id="due-date"
										type="date"
										value={formData.dueDate}
										onChange={(event) =>
												updateFormData(
														"dueDate",
														event.target.value
												)
										}
										className={inputClassName}
										required
								/>
							</div>
						</div>
					</section>

					{/* Issuer */}
					<section className={sectionClassName}>
						<h3 className={sectionTitleClassName}>
							صادرکننده
						</h3>

						<p className="mt-1 text-xs text-[#8B7AAE]">
							اطلاعات صادرکننده چک را وارد کنید.
						</p>

						<div className="mt-5 space-y-4">
							<div>
								<label
										htmlFor="issuer-type"
										className={labelClassName}
								>
									نوع شخص
								</label>

								<select
										id="issuer-type"
										value={formData.issuerType}
										onChange={(event) =>
												updateFormData(
														"issuerType",
														event.target.value as PartyType
												)
										}
										className={selectClassName}
								>
									<option value="INDIVIDUAL">
										شخص حقیقی
									</option>
									<option value="LEGAL_ENTITY">
										شخص حقوقی
									</option>
								</select>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<label
											htmlFor="issuer-name"
											className={labelClassName}
									>
										نام
									</label>

									<input
											id="issuer-name"
											type="text"
											value={formData.issuerName}
											onChange={(event) =>
													updateFormData(
															"issuerName",
															event.target.value
													)
											}
											className={inputClassName}
											placeholder="نام صادرکننده"
									/>
								</div>

								<div>
									<label
											htmlFor="issuer-national-id"
											className={labelClassName}
									>
										کد ملی / شناسه ملی
									</label>

									<input
											id="issuer-national-id"
											type="text"
											value={formData.issuerNationalId}
											onChange={(event) =>
													updateFormData(
															"issuerNationalId",
															event.target.value
													)
											}
											className={inputClassName}
											placeholder="کد ملی یا شناسه ملی"
									/>
								</div>
							</div>
						</div>
					</section>

					{/* Recipient */}
					<section className={sectionClassName}>
						<h3 className={sectionTitleClassName}>
							دریافت‌کننده
						</h3>

						<p className="mt-1 text-xs text-[#8B7AAE]">
							اطلاعات دریافت‌کننده چک را وارد کنید.
						</p>

						<div className="mt-5 space-y-4">
							<div>
								<label
										htmlFor="recipient-type"
										className={labelClassName}
								>
									نوع شخص
								</label>

								<select
										id="recipient-type"
										value={formData.recipientType}
										onChange={(event) =>
												updateFormData(
														"recipientType",
														event.target.value as PartyType
												)
										}
										className={selectClassName}
								>
									<option value="INDIVIDUAL">
										شخص حقیقی
									</option>
									<option value="LEGAL_ENTITY">
										شخص حقوقی
									</option>
								</select>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<label
											htmlFor="recipient-name"
											className={labelClassName}
									>
										نام
									</label>

									<input
											id="recipient-name"
											type="text"
											value={formData.recipientName}
											onChange={(event) =>
													updateFormData(
															"recipientName",
															event.target.value
													)
											}
											className={inputClassName}
											placeholder="نام دریافت‌کننده"
									/>
								</div>

								<div>
									<label
											htmlFor="recipient-national-id"
											className={labelClassName}
									>
										کد ملی / شناسه ملی
									</label>

									<input
											id="recipient-national-id"
											type="text"
											value={formData.recipientNationalId}
											onChange={(event) =>
													updateFormData(
															"recipientNationalId",
															event.target.value
													)
											}
											className={inputClassName}
											placeholder="کد ملی یا شناسه ملی"
									/>
								</div>
							</div>
						</div>
					</section>

					{/* Additional information */}
					<section className={sectionClassName}>
						<h3 className={sectionTitleClassName}>
							اطلاعات تکمیلی
						</h3>

						<p className="mt-1 text-xs text-[#8B7AAE]">
							اطلاعات اختیاری مربوط به تحویل و توضیحات چک.
						</p>

						<div className="mt-5 space-y-4">
							<div>
								<label
										htmlFor="handed-over-at"
										className={labelClassName}
								>
									تاریخ تحویل
								</label>

								<input
										id="handed-over-at"
										type="date"
										value={formData.handedOverAt}
										onChange={(event) =>
												updateFormData(
														"handedOverAt",
														event.target.value
												)
										}
										className={inputClassName}
								/>
							</div>

							<div>
								<label
										htmlFor="description"
										className={labelClassName}
								>
									توضیحات
								</label>

								<textarea
										id="description"
										value={formData.description}
										onChange={(event) =>
												updateFormData(
														"description",
														event.target.value
												)
										}
										className="min-h-28 w-full rounded-xl border border-[#DDD6FE] bg-white px-4 py-3 text-sm text-[#2E1065] outline-none transition placeholder:text-[#A78BFA] focus:border-[#6D28D9] focus:ring-2 focus:ring-[#C4B5FD]/50"
										placeholder="توضیحات اختیاری"
								/>
							</div>
						</div>
					</section>

					{/* Messages */}
					{error && (
							<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
								{error}
							</div>
					)}

					{success && (
							<div
									className="rounded-xl border border-[#C4B5FD] bg-[#F5F3FF] px-4 py-3 text-sm font-medium text-[#5B21B6]">
								{success}
							</div>
					)}

					{/* Actions */}
					<div className="flex flex-wrap items-center gap-3 border-t border-[#E9D5FF] pt-6">
						<button
								type="submit"
								disabled={loading}
								className="rounded-xl bg-[#4C1D95] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5B21B6] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
						>
							{loading
									? isEditing
											? "در حال ویرایش..."
											: "در حال ثبت..."
									: isEditing
											? "ذخیره تغییرات"
											: "ثبت چک"}
						</button>

						{isEditing && (
								<button
										type="button"
										onClick={onEditFinished}
										disabled={loading}
										className="rounded-xl border border-[#C4B5FD] bg-white px-6 py-3 text-sm font-semibold text-[#5B21B6] transition hover:bg-[#F5F3FF] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
								>
									انصراف
								</button>
						)}
					</div>
				</form>
			</section>
	);
}