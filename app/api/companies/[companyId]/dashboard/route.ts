import {NextResponse} from "next/server";
import {prisma} from "@/app/lib/prisma";
import {requireCompanyRole} from "@/app/lib/authorization";

type RouteContext = {
	params: Promise<{
		companyId: string;
	}>;
};

export async function GET(
		request: Request,
		context: RouteContext
) {
	try {
		const {companyId} = await context.params;

		const authorization = await requireCompanyRole(companyId, [
			"OWNER",
			"ADMIN",
			"ACCOUNTANT",
			"VIEWER",
		]);

		if (!authorization.authorized) {
			return NextResponse.json(
					{message: authorization.message},
					{status: authorization.status}
			);
		}

		const now = new Date();

		const [
			totalChecks,
			receivableChecks,
			payableChecks,
			pendingChecks,
			dueChecks,
			paidChecks,
			receivedChecks,
			bouncedChecks,
			cancelledChecks,
			receivableAmount,
			payableAmount,
			upcomingChecks,
			recentChecks,
		] = await Promise.all([
			// Total
			prisma.check.count({
				where: {companyId},
			}),

			// Receivable
			prisma.check.count({
				where: {
					companyId,
					type: "RECEIVABLE",
				},
			}),

			// Payable
			prisma.check.count({
				where: {
					companyId,
					type: "PAYABLE",
				},
			}),

			// Statuses
			prisma.check.count({
				where: {
					companyId,
					status: "PENDING",
				},
			}),

			prisma.check.count({
				where: {
					companyId,
					status: "DUE",
				},
			}),

			prisma.check.count({
				where: {
					companyId,
					status: "PAID",
				},
			}),

			prisma.check.count({
				where: {
					companyId,
					status: "RECEIVED",
				},
			}),

			prisma.check.count({
				where: {
					companyId,
					status: "BOUNCED",
				},
			}),

			prisma.check.count({
				where: {
					companyId,
					status: "CANCELLED",
				},
			}),

			// Receivable amount
			prisma.check.aggregate({
				where: {
					companyId,
					type: "RECEIVABLE",
				},
				_sum: {
					amount: true,
				},
			}),

			// Payable amount
			prisma.check.aggregate({
				where: {
					companyId,
					type: "PAYABLE",
				},
				_sum: {
					amount: true,
				},
			}),

			// Upcoming checks
			prisma.check.findMany({
				where: {
					companyId,
					dueDate: {
						gte: now,
					},
					status: {
						notIn: ["PAID", "RECEIVED", "CANCELLED"],
					},
				},
				include: {
					bank: {
						select: {
							id: true,
							name: true,
						},
					},
					bankAccount: {
						select: {
							id: true,
							accountNumber: true,
							iban: true,
							ownerName: true,
						},
					},
				},
				orderBy: {
					dueDate: "asc",
				},
				take: 5,
			}),

			// Recent checks
			prisma.check.findMany({
				where: {
					companyId,
				},
				include: {
					bank: {
						select: {
							id: true,
							name: true,
						},
					},
					bankAccount: {
						select: {
							id: true,
							accountNumber: true,
							iban: true,
							ownerName: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
				take: 5,
			}),
		]);

		return NextResponse.json({
			summary: {
				totalChecks,
				receivableChecks,
				payableChecks,

				receivableAmount:
						receivableAmount._sum.amount?.toString() ?? "0",

				payableAmount:
						payableAmount._sum.amount?.toString() ?? "0",

				pendingChecks,
				dueChecks,
				paidChecks,
				receivedChecks,
				bouncedChecks,
				cancelledChecks,
			},

			upcomingChecks,
			recentChecks,
		});
	} catch (error) {
		console.error("GET_DASHBOARD_ERROR:", error);

		return NextResponse.json(
				{message: "Something went wrong"},
				{status: 500}
		);
	}
}