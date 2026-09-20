import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireCompanyRole } from "@/app/lib/authorization";
import { createCheckSchema } from "@/app/lib/validations/check";

type CheckRouteProps = {
	params: Promise<{
		companyId: string;
		checkId: string;
	}>;
};

export async function PUT(
		request: Request,
		{ params }: CheckRouteProps
) {
	try {
		const { companyId, checkId } = await params;

		const access = await requireCompanyRole(companyId, [
			"OWNER",
			"ADMIN",
			"ACCOUNTANT",
		]);

		if (!access.authorized) {
			return NextResponse.json(
					{ message: access.message },
					{ status: access.status }
			);
		}

		const existingCheck = await prisma.check.findFirst({
			where: {
				id: checkId,
				companyId,
			},
		});

		if (!existingCheck) {
			return NextResponse.json(
					{ message: "Check not found" },
					{ status: 404 }
			);
		}

		const body = await request.json();

		const validation = createCheckSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
					{
						message: "Validation failed",
						errors: validation.error.flatten(),
					},
					{ status: 400 }
			);
		}

		const data = validation.data;

		const amount = Number(data.amount);

		if (!Number.isFinite(amount) || amount <= 0) {
			return NextResponse.json(
					{ message: "Amount must be greater than zero" },
					{ status: 400 }
			);
		}

		const dueDate = new Date(data.dueDate);

		if (Number.isNaN(dueDate.getTime())) {
			return NextResponse.json(
					{ message: "Invalid due date" },
					{ status: 400 }
			);
		}

		const bank = await prisma.bank.findUnique({
			where: {
				id: data.bankId,
			},
		});

		if (!bank) {
			return NextResponse.json(
					{ message: "Bank not found" },
					{ status: 404 }
			);
		}

		if (data.bankAccountId) {
			const bankAccount = await prisma.bankAccount.findFirst({
				where: {
					id: data.bankAccountId,
					companyId,
					bankId: data.bankId,
				},
			});

			if (!bankAccount) {
				return NextResponse.json(
						{
							message:
									"Bank account not found or does not belong to the selected bank",
						},
						{ status: 400 }
				);
			}
		}

		if (data.sayadId !== existingCheck.sayadId) {
			const duplicateCheck = await prisma.check.findFirst({
				where: {
					companyId,
					sayadId: data.sayadId,
					NOT: {
						id: checkId,
					},
				},
			});

			if (duplicateCheck) {
				return NextResponse.json(
						{
							message:
									"A check with this Sayad ID already exists in this company",
						},
						{ status: 409 }
				);
			}
		}

		let handedOverAt: Date | null = null;

		if (data.handedOverAt) {
			handedOverAt = new Date(data.handedOverAt);

			if (Number.isNaN(handedOverAt.getTime())) {
				return NextResponse.json(
						{ message: "Invalid handover date" },
						{ status: 400 }
				);
			}
		}

		const updatedCheck = await prisma.check.update({
			where: {
				id: checkId,
			},
			data: {
				type: data.type,
				sayadId: data.sayadId,
				series: data.series,
				serial: data.serial,
				bankId: data.bankId,
				bankAccountId: data.bankAccountId || null,
				amount,
				dueDate,
				issuerType: data.issuerType || null,
				issuerName: data.issuerName || null,
				issuerNationalId: data.issuerNationalId || null,
				recipientType: data.recipientType || null,
				recipientName: data.recipientName || null,
				recipientNationalId: data.recipientNationalId || null,
				handedOverAt,
				description: data.description || null,
			},
			include: {
				bank: true,
				bankAccount: true,
			},
		});

		return NextResponse.json({
			message: "Check updated successfully",
			check: updatedCheck,
		});
	} catch (error) {
		console.error("UPDATE_CHECK_ERROR:", error);

		return NextResponse.json(
				{ message: "Something went wrong" },
				{ status: 500 }
		);
	}
}