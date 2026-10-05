"use client";

import {useState} from "react";

import CreateBankAccountForm from "./CreateBankAccountForm";
import BankAccountList from "./BankAccountList";

type BankAccountsClientProps = {
	companyId: string;
};

export default function BankAccountsClient({
	                                           companyId,
                                           }: BankAccountsClientProps) {
	const [refreshKey, setRefreshKey] = useState(0);

	function handleAccountCreated() {
		setRefreshKey((current) => current + 1);
	}

	return (
			<div
					dir="rtl"
					className="mx-auto w-full max-w-[1400px] space-y-8 px-4 py-6 sm:px-6 lg:px-8"
			>
				<section className="rounded-2xl bg-[#4C1D95] px-6 py-7 text-white shadow-sm sm:px-8">
					<div className="flex items-center gap-4">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#6D28D9] text-white">
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

						<div>
							<h1 className="text-2xl font-bold sm:text-3xl">
								حساب‌های بانکی
							</h1>

							<p className="mt-1 text-sm text-[#DDD6FE] sm:text-base">
								حساب‌های بانکی این شرکت را مدیریت کنید.
							</p>
						</div>
					</div>
				</section>

				<section className="rounded-2xl border border-[#DDD6FE] bg-white p-5 shadow-sm sm:p-7">
					<div className="mb-6">
						<h2 className="text-xl font-bold text-[#2E1065]">
							ثبت حساب بانکی جدید
						</h2>

						<p className="mt-1 text-sm text-[#7C6AA8]">
							اطلاعات حساب بانکی شرکت را وارد کنید.
						</p>
					</div>

					<CreateBankAccountForm
							companyId={companyId}
							onAccountCreated={handleAccountCreated}
					/>
				</section>

				<section className="rounded-2xl border border-[#DDD6FE] bg-white p-5 shadow-sm sm:p-7">
					<BankAccountList
							companyId={companyId}
							refreshKey={refreshKey}
					/>
				</section>
			</div>
	);
}