import DashboardClient from "@/app/components/DashboardClient";

type CompanyPageProps = {
	params: Promise<{
		companyId: string;
	}>;
};

export default async function CompanyPage({
	                                          params,
                                          }: CompanyPageProps) {
	const { companyId } = await params;

	return <DashboardClient companyId={companyId} />;
}