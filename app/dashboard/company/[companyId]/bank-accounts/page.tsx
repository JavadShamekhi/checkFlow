import CreateBankAccountForm from "@/app/components/CreateBankAccountForm";

type BankAccountsPageProps = {
	params: Promise<{
		companyId: string;
	}>;
};

export default async function BankAccountsPage({
	                                               params,
                                               }: BankAccountsPageProps) {
	const { companyId } = await params;

	return (
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold">حساب‌های بانکی</h1>
					<p className="text-muted-foreground">
						حساب‌های بانکی این شرکت را مدیریت کنید.
					</p>
				</div>

				<CreateBankAccountForm companyId={companyId} />
			</div>
	);
}