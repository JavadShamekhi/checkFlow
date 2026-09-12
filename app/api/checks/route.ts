import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";
import { createCheckSchema } from "@/app/lib/validations/check";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const result = createCheckSchema.safeParse(body);

		if (!result.success) {
			return NextResponse.json(
					{
						error: "Invalid request data",
						details: result.error.flatten(),
					},
					{ status: 400 },
			);
		}

		const check = await prisma.check.create({
			data: {
				companyId: result.data.companyId,
				bankAccountId: result.data.bankAccountId,

				type: result.data.type,
				checkNumber: result.data.checkNumber,
				amount: result.data.amount,

				dueDate: result.data.dueDate,

				issuerName: result.data.issuerName,
				recipientName: result.data.recipientName,
				description: result.data.description,
			},
		});

		return NextResponse.json(check, { status: 201 });
	} catch (error) {
		console.error(error);

		return NextResponse.json(
				{ error: "Failed to create check" },
				{ status: 500 },
		);
	}
}