import { redirect } from "next/navigation";

import { getCompanyMembership } from "@/app/lib/authorization";

type CompanyPageProps = {
	params: Promise<{
		companyId: string;
	}>;
};

export default async function CompanyPage({
	                                          params,
                                          }: CompanyPageProps) {
	const { companyId } = await params;

	const membership = await getCompanyMembership(companyId);

	if (!membership) {
		redirect("/dashboard");
	}

	return (
			<main className="p-8">
				<h1 className="text-3xl font-bold">
					{membership.company.name}
				</h1>

				<p className="mt-2 text-gray-500">
					Role: {membership.role}
				</p>

				<div className="mt-8">
					<h2 className="text-xl font-semibold">
						Company Workspace
					</h2>

					<p className="mt-2 text-gray-600">
						Manage your company checks, bank accounts and reports.
					</p>
				</div>
			</main>
	);
}