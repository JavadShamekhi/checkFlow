import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function getCompanyMembership(
		companyId: string
) {
	const session = await auth();

	if (!session?.user?.id) {
		return null;
	}

	const membership = await prisma.companyMember.findUnique({
		where: {
			userId_companyId: {
				userId: session.user.id,
				companyId,
			},
		},
		include: {
			company: true,
		},
	});

	return membership;
}