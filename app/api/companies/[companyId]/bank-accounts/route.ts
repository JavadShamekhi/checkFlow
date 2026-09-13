import {NextResponse} from "next/server";

import {prisma} from "@/app/lib/prisma";
import {getCompanyMembership} from "@/app/lib/authorization";

type BankAccountsRouteProps = {
	params: Promise<{ companyId: string }>;
};

export async function GET(
		_request: Request,
		{params}: BankAccountsRouteProps
) {
	try {
		const {companyId} = await params;

		const membership = await getCompanyMembership(companyId);

		if (!membership) {
			return NextResponse.json(
					{message: "Unauthorized"},
					{status: 401}
			);
		}

		const bankAccounts = await prisma.bankAccount.findMany({
			where: {companyId},
			include: {bank: true},
			orderBy: {createdAt: "desc"},
		});

		return NextResponse.json({bankAccounts});
	} catch (error) {
		console.error("GET_BANK_ACCOUNTS_ERROR:", error);

		return NextResponse.json(
				{message: "Something went wrong"},
				{status: 500}
		);
	}
}

export async function POST(
		request: Request,
		{params}: BankAccountsRouteProps
) {
	try {
		const {companyId} = await params;

		const membership = await getCompanyMembership(companyId);

		if (!membership) {
			return NextResponse.json(
					{message: "Unauthorized"},
					{status: 401}
			);
		}

		const body = await request.json();

		const {
			bankId,
			accountNumber,
			iban,
			ownerName,
		} = body;

		if (!bankId) {
			return NextResponse.json(
					{message: "Bank is required"},
					{status: 400}
			);
		}

		const bank = await prisma.bank.findUnique({
			where: {id: bankId},
		});

		if (!bank) {
			return NextResponse.json(
					{message: "Bank not found"},
					{status: 404}
			);
		}

		const bankAccount = await prisma.bankAccount.create({
			data: {
				companyId,
				bankId,
				accountNumber: accountNumber?.trim() || null,
				iban: iban?.trim() || null,
				ownerName: ownerName?.trim() || null,
			},
			include: {
				bank: true,
			},
		});

		return NextResponse.json(
				{
					message: "Bank account created successfully",
					bankAccount,
				},
				{status: 201}
		);
	} catch (error) {
		console.error("CREATE_BANK_ACCOUNT_ERROR:", error);

		return NextResponse.json(
				{message: "Something went wrong"},
				{status: 500}
		);
	}
}