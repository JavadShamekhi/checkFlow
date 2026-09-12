import {auth} from "@/app/lib/auth";
import {prisma} from "@/app/lib/prisma";

export default async function CompanyList() {
	const session = await auth();

	if (!session?.user?.id) {
		return null;
	}

	const memberships = await prisma.companyMember.findMany({
		where: {
			userId: session.user.id,
		},
		include: {
			company: true,
		},
		orderBy: {
			createdAt: "asc",
		},
	});

	if (memberships.length === 0) {
		return (
				<div className="mt-8">
					<p>No companies yet.</p>
				</div>
		);
	}

	return (
			<section className="mt-8">
				<h2 className="text-xl font-semibold">
					Your companies
				</h2>

				<div className="mt-4 space-y-3">
					{memberships.map((membership) => (
							<div
									key={membership.id}
									className="rounded-md border p-4"
							>
								<p className="font-medium">
									{membership.company.name}
								</p>

								<p className="font-medium">
									Role: {membership.role}
								</p>
							</div>
					))}
				</div>
			</section>
	);
}