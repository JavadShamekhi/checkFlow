import {NextResponse} from "next/server";
import {prisma} from "@/app/lib/prisma";
import {requireCompanyRole} from "@/app/lib/authorization";
import {canTransitionCheckStatus} from "@/app/lib/checks/status-transition";

const allowedStatuses = [
	"PENDING",
	"DUE",
	"PAID",
	"RECEIVED",
	"BOUNCED",
	"CANCELLED",
] as const;

type CheckStatus = (typeof allowedStatuses)[number];

export async function PATCH(
		request: Request,
		{
			params,
		}: {
			params: Promise<{
				companyId: string;
				checkId: string;
			}>;
		}
) {
	try {
		const {companyId, checkId} = await params;

		const authorization = await requireCompanyRole(companyId, [
			"OWNER",
			"ADMIN",
			"ACCOUNTANT",
		]);

		if (!authorization.authorized) {
			return NextResponse.json(
					{message: authorization.message},
					{status: authorization.status}
			);
		}

		const body = await request.json();

		const status = body.status as CheckStatus;

		if (!allowedStatuses.includes(status)) {
			return NextResponse.json(
					{message: "Invalid check status"},
					{status: 400}
			);
		}

		const check = await prisma.check.findFirst({
			where: {
				id: checkId,
				companyId,
			},
		});

		if (!check) {
			return NextResponse.json(
					{message: "Check not found"},
					{status: 404}
			);
		}

		const isValidTransition = canTransitionCheckStatus(
				check.status,
				status
		);

		if (!isValidTransition) {
			return NextResponse.json(
					{message: `Cannot change check status from ${check.status} to ${status}`,},
					{status: 400}
			);
		}

		const updatedCheck = await prisma.check.update({
			where: {
				id: checkId,
			},
			data: {
				status,
			},
			include: {
				bank: true,
				bankAccount: {
					include: {
						bank: true,
					},
				},
			},
		});

		return NextResponse.json(
				{
					message: "Check status updated successfully",
					check: updatedCheck,
				},
				{status: 200}
		);
	} catch (error) {
		console.error("UPDATE_CHECK_STATUS_ERROR:", error);

		return NextResponse.json(
				{message: "Something went wrong"},
				{status: 500}
		);
	}
}

