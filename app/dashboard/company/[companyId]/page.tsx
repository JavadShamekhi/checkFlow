import Link from "next/link";
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
				<p className="text-sm text-gray-500">
					Company
				</p>

				<h1 className="mt-1 text-3xl font-bold">
					{membership.company.name}
				</h1>

				<p className="mt-2 text-gray-500">
					Role: {membership.role}
				</p>

				<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<Link
							href={`/dashboard/company/${companyId}/checks`}
							className="rounded-lg border p-6 transition hover:bg-gray-50"
					>
						<h2 className="text-lg font-semibold">
							Checks
						</h2>

						<p className="mt-2 text-sm text-gray-500">
							Manage receivable and payable checks.
						</p>
					</Link>

					<div className="rounded-lg border p-6">
						<h2 className="text-lg font-semibold">
							Bank Accounts
						</h2>

						<p className="mt-2 text-sm text-gray-500">
							Coming soon
						</p>
					</div>

					<div className="rounded-lg border p-6">
						<h2 className="text-lg font-semibold">
							Reports
						</h2>

						<p className="mt-2 text-sm text-gray-500">
							Coming soon
						</p>
					</div>
				</div>
			</main>
	);
}