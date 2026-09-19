import BankAccountsClient from "@/app/components/BankAccountsClient";

type BankAccountsPageProps = {
	params: Promise<{
		companyId: string;
	}>;
};

export default async function BankAccountsPage({
	                                               params,
                                               }: BankAccountsPageProps) {
	const { companyId } = await params;

	return <BankAccountsClient companyId={companyId} />;
}