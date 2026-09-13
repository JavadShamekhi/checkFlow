import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";
import { auth } from "@/app/lib/auth";

export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
					{ message: "Unauthorized" },
					{ status: 401 }
			);
		}

		const banks = await prisma.bank.findMany({
			orderBy: {
				name: "asc",
			},
		});

		return NextResponse.json({
			banks,
		});
	} catch (error) {
		console.error("GET_BANKS_ERROR:", error);

		return NextResponse.json(
				{ message: "Something went wrong" },
				{ status: 500 }
		);
	}
}