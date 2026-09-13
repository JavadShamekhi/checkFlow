import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";
import { getCompanyMembership } from "@/app/lib/authorization";
import { createCheckSchema } from "@/app/lib/validations/check";

type ChecksRouteProps = {
	params: Promise<{
		companyId: string;
	}>;
};

export async function POST(
		request: Request,
		{ params }: ChecksRouteProps
) {
	try {
		const { companyId } = await params;

		const membership = await getCompanyMembership(companyId);

		if (!membership) {
			return NextResponse.json(
					{ message: "Unauthorized" },
					{ status: 401 }
			);
		}

		const body = await request.json();

		const result = createCheckSchema.safeParse(body);

		if (!result.success) {
			return NextResponse.json(
					{
						message: "Invalid input",
						errors: result.error.flatten(),
					},
					{ status: 400 }
			);
		}

		const {
			type,
			sayadId,
			series,
			serial,
			bankId,
			bankAccountId,
			amount,
			dueDate,
			issuerType,
			issuerName,
			issuerNationalId,
			recipientType,
			recipientName,
			recipientNationalId,
			handedOverAt,
			description,
		} = result.data;

		// Validate amount
		const parsedAmount = Number(amount);

		if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
			return NextResponse.json(
					{ message: "Amount must be a valid positive number" },
					{ status: 400 }
			);
		}

		// Validate due date
		const parsedDueDate = new Date(dueDate);

		if (Number.isNaN(parsedDueDate.getTime())) {
			return NextResponse.json(
					{ message: "Invalid due date" },
					{ status: 400 }
			);
		}

		// Validate bank
		const bank = await prisma.bank.findUnique({
			where: {
				id: bankId,
			},
		});

		if (!bank) {
			return NextResponse.json(
					{ message: "Bank not found" },
					{ status: 404 }
			);
		}

		// Validate bank account
		if (bankAccountId) {
			const bankAccount = await prisma.bankAccount.findFirst({
				where: {
					id: bankAccountId,
					companyId,
					bankId,
				},
			});

			if (!bankAccount) {
				return NextResponse.json(
						{ message: "Bank account not found" },
						{ status: 404 }
				);
			}
		}

		// Check duplicate Sayad ID inside this company
		const existingCheck = await prisma.check.findUnique({
			where: {
				companyId_sayadId: {
					companyId,
					sayadId,
				},
			},
		});

		if (existingCheck) {
			return NextResponse.json(
					{
						message:
								"A check with this Sayad ID already exists in this company",
					},
					{ status: 409 }
			);
		}

		// Parse handed-over date
		let parsedHandedOverAt: Date | null = null;

		if (handedOverAt) {
			parsedHandedOverAt = new Date(handedOverAt);

			if (Number.isNaN(parsedHandedOverAt.getTime())) {
				return NextResponse.json(
						{ message: "Invalid handed over date" },
						{ status: 400 }
				);
			}
		}

		const check = await prisma.check.create({
			data: {
				companyId,

				type,

				sayadId,
				series,
				serial,

				bankId,
				bankAccountId: bankAccountId || null,

				amount: parsedAmount,
				dueDate: parsedDueDate,

				issuerType: issuerType || null,
				issuerName: issuerName || null,
				issuerNationalId: issuerNationalId || null,

				recipientType: recipientType || null,
				recipientName: recipientName || null,
				recipientNationalId: recipientNationalId || null,

				handedOverAt: parsedHandedOverAt,

				description: description || null,
			},
		});

		return NextResponse.json(
				{
					message: "Check created successfully",
					check,
				},
				{ status: 201 }
		);
	} catch (error) {
		console.error("CREATE_CHECK_ERROR:", error);

		return NextResponse.json(
				{ message: "Something went wrong" },
				{ status: 500 }
		);
	}
}

export async function GET(
		_request: Request,
		{ params }: ChecksRouteProps
) {
	try {
		const { companyId } = await params;

		const membership = await getCompanyMembership(companyId);

		if (!membership) {
			return NextResponse.json(
					{ message: "Unauthorized" },
					{ status: 401 }
			);
		}

		const checks = await prisma.check.findMany({
			where: {
				companyId,
			},
			orderBy: {
				dueDate: "asc",
			},
			include: {
				bank: true,
				bankAccount: true,
			},
		});

		return NextResponse.json({
			checks,
		});
	} catch (error) {
		console.error("GET_CHECKS_ERROR:", error);

		return NextResponse.json(
				{ message: "Something went wrong" },
				{ status: 500 }
		);
	}
}