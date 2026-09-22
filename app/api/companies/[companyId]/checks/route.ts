import {NextResponse} from "next/server";

import {prisma} from "@/app/lib/prisma";
import {requireCompanyRole} from "@/app/lib/authorization";
import {createCheckSchema} from "@/app/lib/validations/check";
import {Prisma} from "@/app/generated/prisma/client";

type ChecksRouteProps = {
	params: Promise<{
		companyId: string;
	}>;
};

const allowedTypes =
		["RECEIVABLE",
			"PAYABLE"] as const;

const allowedStatuses =
		["PENDING",
			"DUE",
			"PAID",
			"RECEIVED",
			"BOUNCED",
			"CANCELLED"] as const;

export async function POST(
		request: Request,
		{params}: ChecksRouteProps
) {
	try {
		const {companyId} = await params;

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

		const body = await request.json();

		const result = createCheckSchema.safeParse(body);

		if (!result.success) {
			return NextResponse.json(
					{
						message: "Invalid input",
						errors: result.error.flatten(),
					},
					{status: 400}
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
					{message: "Amount must be a valid positive number"},
					{status: 400}
			);
		}

		// Validate due date
		const parsedDueDate = new Date(dueDate);

		if (Number.isNaN(parsedDueDate.getTime())) {
			return NextResponse.json(
					{message: "Invalid due date"},
					{status: 400}
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
					{message: "Bank not found"},
					{status: 404}
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
						{message: "Bank account not found"},
						{status: 404}
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
					{status: 409}
			);
		}

		// Parse handed-over date
		let parsedHandedOverAt: Date | null = null;

		if (handedOverAt) {
			parsedHandedOverAt = new Date(handedOverAt);

			if (Number.isNaN(parsedHandedOverAt.getTime())) {
				return NextResponse.json(
						{message: "Invalid handed over date"},
						{status: 400}
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
				{status: 201}
		);
	} catch (error) {
		console.error("CREATE_CHECK_ERROR:", error);

		return NextResponse.json(
				{message: "Something went wrong"},
				{status: 500}
		);
	}
}

export async function GET(
		request: Request,
		{params}: ChecksRouteProps
) {
	try {
		const {companyId} = await params;

		const access = await requireCompanyRole(companyId, [
			"OWNER",
			"ADMIN",
			"ACCOUNTANT",
			"VIEWER",
		]);

		if (!access.authorized) {
			return NextResponse.json(
					{message: access.message},
					{status: access.status}
			);
		}

		const {searchParams} = new URL(request.url);

		// -----------------------------------
		// Pagination
		// -----------------------------------

		const pageParam = searchParams.get("page");
		const limitParam = searchParams.get("limit");

		const page = pageParam ? Number(pageParam) : 1;
		const limit = limitParam ? Number(limitParam) : 20;

		if (!Number.isInteger(page) || page < 1) {
			return NextResponse.json(
					{message: "Invalid page"},
					{status: 400}
			);
		}

		if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
			return NextResponse.json(
					{message: "Invalid limit. Maximum allowed is 100",},
					{status: 400}
			);
		}

		// -----------------------------------
		// Filters
		// -----------------------------------

		const sayadId = searchParams.get("sayadId")?.trim();
		const type = searchParams.get("type");
		const status = searchParams.get("status");
		const bankId = searchParams.get("bankId");
		const series = searchParams.get("series")?.trim();
		const serial = searchParams.get("serial")?.trim();
		const fromDate = searchParams.get("fromDate");
		const toDate = searchParams.get("toDate");
		const minAmount = searchParams.get("minAmount");
		const maxAmount = searchParams.get("maxAmount");
		const sortBy = searchParams.get("sortBy") || "dueDate";
		const sortOrder = searchParams.get("sortOrder") || "asc";

		// -----------------------------------
		// Validate type
		// -----------------------------------

		if (type && !allowedTypes.includes(type as (typeof allowedTypes)[number])) {
			return NextResponse.json({message: "Invalid check type"}, {status: 400});
		}

		// -----------------------------------
		// Validate status
		// -----------------------------------

		if (status && !allowedStatuses.includes(status as (typeof allowedStatuses)[number])) {
			return NextResponse.json({message: "Invalid check status"}, {status: 400});
		}

		const allowedSortFields = [
			"dueDate",
			"amount",
			"createdAt",
		] as const;

		const allowedSortOrders = ["asc", "desc"] as const;

		if (!allowedSortFields.includes(
				sortBy as (typeof allowedSortFields)[number])) {
			return NextResponse.json(
					{message: "Invalid sortBy"},
					{status: 400}
			);
		}

		if (!allowedSortOrders.includes(
				sortOrder as (typeof allowedSortOrders)[number])) {
			return NextResponse.json(
					{message: "Invalid sortOrder"},
					{status: 400}
			);
		}

		// -----------------------------------
		// Build where
		// -----------------------------------

		const where: {
			companyId: string;
			sayadId?: { contains: string; };
			type?: (typeof allowedTypes)[number];
			status?: (typeof allowedStatuses)[number];
			bankId?: string;
			series?: { contains: string; };
			serial?: { contains: string; };
			dueDate?: { gte?: Date; lte?: Date; };
			amount?: { gte?: number; lte?: number; };
		} = {companyId,};

		// Sayad ID
		if (sayadId) {
			where.sayadId = {contains: sayadId,};
		}

		// Type
		if (type) {
			where.type = type as (typeof allowedTypes)[number];
		}

		// Status
		if (status) {
			where.status = status as (typeof allowedStatuses)[number];
		}

		// Bank
		if (bankId) {
			where.bankId = bankId;
		}

		// Series
		if (series) {
			where.series = {contains: series,};
		}

		// Serial
		if (serial) {
			where.serial = {contains: serial,};
		}
		// -----------------------------------
		// Date filters
		// -----------------------------------
		if (fromDate || toDate) {
			where.dueDate = {};
			if (fromDate) {
				const parsedFromDate = new Date(fromDate);
				if (Number.isNaN(parsedFromDate.getTime())) {
					return NextResponse.json({message: "Invalid fromDate"}, {status: 400});
				}
				where.dueDate.gte = parsedFromDate;
			}
			if (toDate) {
				const parsedToDate = new Date(toDate);
				if (Number.isNaN(parsedToDate.getTime())) {
					return NextResponse.json({message: "Invalid toDate"}, {status: 400});
				}
				parsedToDate.setHours(23, 59, 59, 999);
				where.dueDate.lte = parsedToDate;
			}
		}

		// -----------------------------------
		// Amount filters
		// -----------------------------------

		if (minAmount || maxAmount) {
			where.amount = {};
			if (minAmount) {
				const parsedMinAmount = Number(minAmount);
				if (!Number.isFinite(parsedMinAmount) || parsedMinAmount < 0) {
					return NextResponse.json({message: "Invalid minAmount"}, {status: 400});
				}
				where.amount.gte = parsedMinAmount;
			}
			if (maxAmount) {
				const parsedMaxAmount = Number(maxAmount);
				if (!Number.isFinite(parsedMaxAmount) || parsedMaxAmount < 0) {
					return NextResponse.json({message: "Invalid maxAmount"}, {status: 400});
				}
				where.amount.lte = parsedMaxAmount;
			}
		}

		// -----------------------------------
		// Pagination
		// -----------------------------------

		const skip = (page - 1) * limit;

		// -----------------------------------
		// Sort
		// -----------------------------------

		const orderBy: Prisma.CheckOrderByWithRelationInput[] = [
			{
				[sortBy]: sortOrder,
			},
			{
				id: "asc",
			},
		];

		// -----------------------------------
		// Get checks + total count
		// -----------------------------------

		const [checks, total] = await Promise.all([prisma.check.findMany({
			where,
			orderBy,
			skip,
			take: limit,
			include: {
				bank: true,
				bankAccount: {
					include: {
						bank: true,
					},
				},
			},
		}),
			prisma.check.count({
				where,
			}),
		]);

		const totalPages = Math.ceil(total / limit);

		return NextResponse.json({
			checks,
			pagination: {
				page,
				limit,
				total,
				totalPages,
			},
		});
	} catch (error) {
		console.error("GET_CHECKS_ERROR:", error);

		return NextResponse.json(
				{message: "Something went wrong"},
				{status: 500}
		);
	}
}