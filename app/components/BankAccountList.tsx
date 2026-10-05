"use client";

import {useEffect, useState} from "react";

type Bank = {
	id: string;
	name: string;
};

type BankAccount = {
	id: string;
	accountNumber: string | null;
	iban: string | null;
	ownerName: string | null;
	bank: Bank;
};

type BankAccountListProps = {
	companyId: string;
	refreshKey: number;
};

export default function BankAccountList({
	                                        companyId,
	                                        refreshKey,
                                        }: BankAccountListProps) {
	const [accounts, setAccounts] = useState<BankAccount[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [banks, setBanks] = useState<Bank[]>([]);
	const [editingAccountId, setEditingAccountId] =
			useState<string | null>(null);
	const [editBankId, setEditBankId] = useState("");
	const [editAccountNumber, setEditAccountNumber] = useState("");
	const [editIban, setEditIban] = useState("");
	const [editOwnerName, setEditOwnerName] = useState("");
	const [savingEdit, setSavingEdit] = useState(false);

	useEffect(() => {
		async function fetchData() {
			try {
				setLoading(true);
				setError("");

				const [accountsResponse, banksResponse] = await Promise.all([
					fetch(`/api/companies/${companyId}/bank-accounts`),
					fetch("/api/banks"),
				]);

				const accountsData = await accountsResponse.json();
				const banksData = await banksResponse.json();

				if (!accountsResponse.ok) {
					throw new Error(
							accountsData.message || "Failed to fetch accounts"
					);
				}

				if (!banksResponse.ok) {
					throw new Error(
							banksData.message || "Failed to fetch banks"
					);
				}

				setAccounts(accountsData.bankAccounts);
				setBanks(banksData.banks);
			} catch (error) {
				console.error(error);
				setError("خطا در دریافت اطلاعات");
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, [companyId, refreshKey]);

	async function handleDelete(accountId: string) {
		const confirmed = window.confirm(
				"آیا از حذف این حساب بانکی مطمئن هستید؟"
		);

		if (!confirmed) {
			return;
		}

		try {
			setError("");

			const response = await fetch(
					`/api/companies/${companyId}/bank-accounts/${accountId}`,
					{
						method: "DELETE",
					}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
						data.message || "Failed to delete account"
				);
			}

			setAccounts((current) =>
					current.filter((account) => account.id !== accountId)
			);
		} catch (error) {
			console.error(error);
			setError("خطا در حذف حساب بانکی");
		}
	}

	function startEditing(account: BankAccount) {
		setEditingAccountId(account.id);
		setEditBankId(account.bank.id);
		setEditAccountNumber(account.accountNumber || "");
		setEditIban(account.iban || "");
		setEditOwnerName(account.ownerName || "");
		setError("");
	}

	function cancelEditing() {
		setEditingAccountId(null);
		setEditBankId("");
		setEditAccountNumber("");
		setEditIban("");
		setEditOwnerName("");
	}

	async function handleUpdate(accountId: string) {
		if (!editBankId) {
			setError("بانک را انتخاب کنید");
			return;
		}

		try {
			setSavingEdit(true);
			setError("");

			const response = await fetch(
					`/api/companies/${companyId}/bank-accounts/${accountId}`,
					{
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							bankId: editBankId,
							accountNumber: editAccountNumber,
							iban: editIban,
							ownerName: editOwnerName,
						}),
					}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
						data.message || "Failed to update account"
				);
			}

			setAccounts((current) =>
					current.map((account) =>
							account.id === accountId
									? data.bankAccount
									: account
					)
			);

			cancelEditing();
		} catch (error) {
			console.error(error);
			setError("خطا در ویرایش حساب بانکی");
		} finally {
			setSavingEdit(false);
		}
	}

	if (loading) {
		return (
				<div className="rounded-2xl border border-[#DDD6FE] bg-[#F5F3FF] p-6">
					<p className="text-sm font-medium text-[#7C6AA8]">
						در حال دریافت حساب‌های بانکی...
					</p>
				</div>
		);
	}

	if (error && accounts.length === 0) {
		return (
				<div className="rounded-2xl border border-red-200 bg-red-50 p-6">
					<p className="text-sm font-medium text-red-600">
						{error}
					</p>
				</div>
		);
	}

	if (accounts.length === 0) {
		return (
				<div className="rounded-2xl border border-[#DDD6FE] bg-[#F5F3FF] p-8 text-center">
					<div
							className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#C4B5FD] text-[#4C1D95]">
						<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.8"
								className="h-6 w-6"
						>
							<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M3 10h18M5 10v8m4-8v8m6-8v8m4-8v8M4 21h16M3 10l9-7 9 7"
							/>
						</svg>
					</div>

					<p className="font-medium text-[#5B21B6]">
						هنوز حساب بانکی برای این شرکت ثبت نشده است.
					</p>
				</div>
		);
	}

	return (
			<div className="space-y-5">
				<div>
					<h2 className="text-xl font-bold text-[#2E1065]">
						حساب‌های ثبت‌شده
					</h2>

					<p className="mt-1 text-sm text-[#7C6AA8]">
						حساب‌های بانکی ثبت‌شده برای این شرکت
					</p>
				</div>

				{error && (
						<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
							<p className="text-sm font-medium text-red-600">
								{error}
							</p>
						</div>
				)}

				<div className="grid gap-4">
					{accounts.map((account) => {
						const isEditing =
								editingAccountId === account.id;

						return (
								<div
										key={account.id}
										className="rounded-2xl border border-[#DDD6FE] bg-white p-5 shadow-sm transition hover:border-[#C4B5FD] sm:p-6"
								>
									{!isEditing ? (
											<>
												<div
														className="mb-5 flex flex-col gap-4 border-b border-[#E9D5FF] pb-5 sm:flex-row sm:items-center sm:justify-between">
													<div className="flex items-center gap-3">
														<div
																className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F3FF] text-[#6D28D9]">
															<svg
																	xmlns="http://www.w3.org/2000/svg"
																	viewBox="0 0 24 24"
																	fill="none"
																	stroke="currentColor"
																	strokeWidth="1.8"
																	className="h-5 w-5"
															>
																<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		d="M3 10h18M5 10v8m4-8v8m6-8v8m4-8v8M4 21h16M3 10l9-7 9 7"
																/>
															</svg>
														</div>

														<h3 className="font-bold text-[#2E1065]">
															{account.bank.name}
														</h3>
													</div>

													<div className="flex gap-2">
														<button
																type="button"
																onClick={() => startEditing(account)}
																className="rounded-xl border border-[#C4B5FD] bg-white px-4 py-2 text-sm font-medium text-[#5B21B6] transition hover:bg-[#F5F3FF] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD]"
														>
															ویرایش
														</button>

														<button
																type="button"
																onClick={() => handleDelete(account.id)}
																className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
														>
															حذف
														</button>
													</div>
												</div>

												<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
													<div className="rounded-xl bg-[#F5F3FF] p-4">
														<p className="mb-1 text-xs font-medium text-[#7C6AA8]">
															شماره حساب
														</p>

														<p className="break-all font-medium text-[#2E1065]">
															{account.accountNumber || "-"}
														</p>
													</div>

													<div className="rounded-xl bg-[#F5F3FF] p-4">
														<p className="mb-1 text-xs font-medium text-[#7C6AA8]">
															شماره شبا
														</p>

														<p
																dir="ltr"
																className="break-all text-right font-medium text-[#2E1065]"
														>
															{account.iban || "-"}
														</p>
													</div>

													<div className="rounded-xl bg-[#F5F3FF] p-4">
														<p className="mb-1 text-xs font-medium text-[#7C6AA8]">
															صاحب حساب
														</p>

														<p className="font-medium text-[#2E1065]">
															{account.ownerName || "-"}
														</p>
													</div>
												</div>
											</>
									) : (
											<div className="space-y-5">
												<div className="border-b border-[#E9D5FF] pb-4">
													<h3 className="text-lg font-bold text-[#2E1065]">
														ویرایش حساب بانکی
													</h3>

													<p className="mt-1 text-sm text-[#7C6AA8]">
														اطلاعات حساب را به‌روزرسانی کنید.
													</p>
												</div>

												<div className="grid gap-4 md:grid-cols-2">
													<div className="space-y-2">
														<label className="block text-sm font-medium text-[#5B21B6]">
															بانک
														</label>

														<select
																value={editBankId}
																onChange={(event) =>
																		setEditBankId(event.target.value)
																}
																disabled={savingEdit}
																className="w-full rounded-xl border border-[#DDD6FE] bg-white px-3 py-3 text-sm text-[#2E1065] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#C4B5FD] disabled:cursor-not-allowed disabled:bg-[#F5F3FF] disabled:opacity-60"
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

													<div className="space-y-2">
														<label className="block text-sm font-medium text-[#5B21B6]">
															شماره حساب
														</label>

														<input
																value={editAccountNumber}
																onChange={(event) =>
																		setEditAccountNumber(
																				event.target.value
																		)
																}
																placeholder="شماره حساب"
																disabled={savingEdit}
																className="w-full rounded-xl border border-[#DDD6FE] bg-white px-3 py-3 text-sm text-[#2E1065] placeholder:text-[#A78BCA] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#C4B5FD] disabled:cursor-not-allowed disabled:bg-[#F5F3FF] disabled:opacity-60"
														/>
													</div>

													<div className="space-y-2">
														<label className="block text-sm font-medium text-[#5B21B6]">
															شماره شبا
														</label>

														<input
																value={editIban}
																onChange={(event) =>
																		setEditIban(event.target.value)
																}
																placeholder="IR..."
																dir="ltr"
																disabled={savingEdit}
																className="w-full rounded-xl border border-[#DDD6FE] bg-white px-3 py-3 text-sm text-[#2E1065] placeholder:text-[#A78BCA] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#C4B5FD] disabled:cursor-not-allowed disabled:bg-[#F5F3FF] disabled:opacity-60"
														/>
													</div>

													<div className="space-y-2">
														<label className="block text-sm font-medium text-[#5B21B6]">
															نام صاحب حساب
														</label>

														<input
																value={editOwnerName}
																onChange={(event) =>
																		setEditOwnerName(
																				event.target.value
																		)
																}
																placeholder="نام صاحب حساب"
																disabled={savingEdit}
																className="w-full rounded-xl border border-[#DDD6FE] bg-white px-3 py-3 text-sm text-[#2E1065] placeholder:text-[#A78BCA] outline-none transition focus:border-[#6D28D9] focus:ring-2 focus:ring-[#C4B5FD] disabled:cursor-not-allowed disabled:bg-[#F5F3FF] disabled:opacity-60"
														/>
													</div>
												</div>

												<div className="flex flex-wrap gap-2 pt-1">
													<button
															type="button"
															disabled={savingEdit}
															onClick={() =>
																	handleUpdate(account.id)
															}
															className="rounded-xl bg-[#6D28D9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4C1D95] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
													>
														{savingEdit
																? "در حال ذخیره..."
																: "ذخیره تغییرات"}
													</button>

													<button
															type="button"
															disabled={savingEdit}
															onClick={cancelEditing}
															className="rounded-xl border border-[#C4B5FD] bg-white px-5 py-3 text-sm font-medium text-[#5B21B6] transition hover:bg-[#F5F3FF] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] disabled:cursor-not-allowed disabled:opacity-50"
													>
														انصراف
													</button>
												</div>
											</div>
									)}
								</div>
						);
					})}
				</div>
			</div>
	);
}