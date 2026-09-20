import {NextResponse} from "next/server";

import {prisma} from "@/app/lib/prisma";
import {requireCompanyRole} from "@/app/lib/authorization";

type BankAccountRouteProps = {
	params: Promise<{
		companyId: string;
		accountId: string;
	}>;
};

export async function DELETE(
		_request: Request,
		{params}: BankAccountRouteProps
) {
	try {
		const {companyId, accountId} = await params;

		const access = await requireCompanyRole(companyId, [
			"OWNER",
			"ADMIN",
			"ACCOUNTANT",
		]);

		if (!access.authorized) {
			return NextResponse.json(
					{message: access.message},
					{status: access.status}
			);
		}

		const bankAccount = await prisma.bankAccount.findFirst({
			where: {
				id: accountId,
				companyId,
			},
		});

		if (!bankAccount) {
			return NextResponse.json(
					{message: "Bank account not found"},
					{status: 404}
			);
		}

		await prisma.bankAccount.delete({
			where: {
				id: accountId,
			},
		});

		return NextResponse.json({
			message: "Bank account deleted successfully",
		});
	} catch (error) {
		console.error("DELETE_BANK_ACCOUNT_ERROR:", error);

		return NextResponse.json(
				{message: "Something went wrong"},
				{status: 500}
		);
	}
}

export async function PUT(
		request: Request,
		{params}: BankAccountRouteProps
) {
	try {
		const {companyId, accountId} = await params;

		const access = await requireCompanyRole(companyId, [
			"OWNER",
			"ADMIN",
		]);

		if (!access.authorized) {
			return NextResponse.json(
					{message: access.message},
					{status: access.status}
			);
		}

		const existingAccount = await prisma.bankAccount.findFirst({
			where: {
				id: accountId,
				companyId,
			},
		});

		if (!existingAccount) {
			return NextResponse.json(
					{message: "Bank account not found"},
					{status: 404}
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
			where: {
				id: bankId,
			},
		});

		if (!bank) {
			return NextResponse.json(
					{message: "Bank not found"},
					{status: 404}
			);
		}

		const updatedAccount = await prisma.bankAccount.update({
			where: {
				id: accountId,
			},
			data: {
				bankId,
				accountNumber: accountNumber?.trim() || null,
				iban: iban?.trim() || null,
				ownerName: ownerName?.trim() || null,
			},
			include: {
				bank: true,
			},
		});

		return NextResponse.json({
			message: "Bank account updated successfully",
			bankAccount: updatedAccount,
		});
	} catch (error) {
		console.error("UPDATE_BANK_ACCOUNT_ERROR:", error);

		return NextResponse.json(
				{message: "Something went wrong"},
				{status: 500}
		);
	}
}