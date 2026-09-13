import { redirect } from "next/navigation";

import { getCompanyMembership } from "@/app/lib/authorization";
import CreateCheckForm from "@/app/components/CreateCheckForm";

type ChecksPageProps = {
	params: Promise<{
		companyId: string;
	}>;
};

export default async function ChecksPage({
	                                         params,
                                         }: ChecksPageProps) {
	const { companyId } = await params;

	const membership = await getCompanyMembership(companyId);

	if (!membership) {
		redirect("/dashboard");
	}

	return (
			<main className="p-8">
				<div>
					<p className="text-sm text-gray-500">
						{membership.company.name}
					</p>

					<h1 className="mt-1 text-3xl font-bold">
						Checks
					</h1>
				</div>

				<CreateCheckForm companyId={companyId} />

				<section className="mt-10">
					<h2 className="text-xl font-semibold">
						Your checks
					</h2>

					<p className="mt-2 text-gray-500">
						No checks yet.
					</p>
				</section>
			</main>
	);
}