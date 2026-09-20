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

export async function requireCompanyRole(
		companyId: string,
		allowedRoles: string[]
) {
	const membership = await getCompanyMembership(companyId);

	if (!membership) {
		return {
			authorized: false,
			status: 401,
			message: "Unauthorized",
			membership: null,
		};
	}

	if (!allowedRoles.includes(membership.role)) {
		return {
			authorized: false,
			status: 403,
			message: "Forbidden",
			membership,
		};
	}

	return {
		authorized: true,
		status: 200,
		message: null,
		membership,
	};
}