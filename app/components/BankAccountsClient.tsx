"use client";

import { useState } from "react";

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
			<div className="space-y-8">
				<div>
					<h1 className="text-2xl font-bold">حساب‌های بانکی</h1>

					<p className="text-muted-foreground">
						حساب‌های بانکی این شرکت را مدیریت کنید.
					</p>
				</div>

				<CreateBankAccountForm
						companyId={companyId}
						onAccountCreated={handleAccountCreated}
				/>

				<BankAccountList
						companyId={companyId}
						refreshKey={refreshKey}
				/>
			</div>
	);
}