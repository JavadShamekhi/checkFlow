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
	const [editingAccountId, setEditingAccountId] = useState<string | null>(
			null
	);
	const [editBankId, setEditBankId] = useState("");
	const [editAccountNumber, setEditAccountNumber] = useState("");
	const [editIban, setEditIban] = useState("");
	const [editOwnerName, setEditOwnerName] = useState("");
	const [savingEdit, setSavingEdit] = useState(false);

	useEffect(() => {
		async function fetchData() {
			try {
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
			const response = await fetch(
					`/api/companies/${companyId}/bank-accounts/${accountId}`,
					{
						method: "DELETE",
					}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to delete account");
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
				throw new Error(data.message || "Failed to update account");
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
		return <p>در حال دریافت حساب‌های بانکی...</p>;
	}

	if (error) {
		return <p className="text-red-500">{error}</p>;
	}

	if (accounts.length === 0) {
		return (
				<div className="rounded-lg border p-6">
					<p className="text-muted-foreground">
						هنوز حساب بانکی برای این شرکت ثبت نشده است.
					</p>
				</div>
		);
	}

	return (
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">حساب‌های ثبت‌شده</h2>

				<div className="grid gap-4">
					{accounts.map((account) => {
						const isEditing = editingAccountId === account.id;

						return (
								<div
										key={account.id}
										className="rounded-lg border p-5"
								>
									{!isEditing ? (
											<>
												<div className="mb-4 flex items-center justify-between">
													<h3 className="font-semibold">
														{account.bank.name}
													</h3>

													<div className="flex gap-2">
														<button
																type="button"
																onClick={() => startEditing(account)}
																className="rounded-md border px-3 py-2 text-sm"
														>
															ویرایش
														</button>

														<button
																type="button"
																onClick={() => handleDelete(account.id)}
																className="rounded-md border px-3 py-2 text-sm text-red-600"
														>
															حذف
														</button>
													</div>
												</div>

												<div className="grid gap-3 text-sm md:grid-cols-3">
													<div>
														<p className="text-muted-foreground">
															شماره حساب
														</p>

														<p className="font-medium">
															{account.accountNumber || "-"}
														</p>
													</div>

													<div>
														<p className="text-muted-foreground">
															شماره شبا
														</p>

														<p className="font-medium">
															{account.iban || "-"}
														</p>
													</div>

													<div>
														<p className="text-muted-foreground">
															صاحب حساب
														</p>

														<p className="font-medium">
															{account.ownerName || "-"}
														</p>
													</div>
												</div>
											</>
									) : (
											<div className="space-y-4">
												<h3 className="font-semibold">
													ویرایش حساب بانکی
												</h3>

												<select
														value={editBankId}
														onChange={(event) => setEditBankId(event.target.value)}
														className="w-full rounded-md border bg-background px-3 py-2"
												>
													<option value="">انتخاب بانک</option>

													{banks.map((bank) => (
															<option key={bank.id} value={bank.id}>
																{bank.name}
															</option>
													))}
												</select>

												<input
														value={editAccountNumber}
														onChange={(event) =>
																setEditAccountNumber(event.target.value)
														}
														placeholder="شماره حساب"
														className="w-full rounded-md border bg-background px-3 py-2"
												/>

												<input
														value={editIban}
														onChange={(event) =>
																setEditIban(event.target.value)
														}
														placeholder="شماره شبا"
														className="w-full rounded-md border bg-background px-3 py-2"
												/>

												<input
														value={editOwnerName}
														onChange={(event) =>
																setEditOwnerName(event.target.value)
														}
														placeholder="نام صاحب حساب"
														className="w-full rounded-md border bg-background px-3 py-2"
												/>

												<div className="flex gap-2">
													<button
															type="button"
															disabled={savingEdit}
															onClick={() => handleUpdate(account.id)}
															className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
													>
														{savingEdit ? "در حال ذخیره..." : "ذخیره تغییرات"}
													</button>

													<button
															type="button"
															disabled={savingEdit}
															onClick={cancelEditing}
															className="rounded-md border px-4 py-2"
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