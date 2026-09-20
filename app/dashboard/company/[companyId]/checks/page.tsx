import ChecksClient from "@/app/components/ChecksClient";

type ChecksPageProps = {
	params: Promise<{
		companyId: string;
	}>;
};

export default async function ChecksPage({
	                                         params,
                                         }: ChecksPageProps) {
	const {companyId} = await params;

	return <ChecksClient companyId={companyId}/>;
}