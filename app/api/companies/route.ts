import {auth} from "@/app/lib/auth";
import {NextResponse} from "next/server";
import {prisma} from "@/app/lib/prisma";

export async function POST(request: Request) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({
						message: "Unauthorized",
					},
					{status: 401}
			);
		}

		const body = await request.json();
		const name = body?.name?.trim();

		if (!name || name.length < 2) {
			return NextResponse.json({
						message: "Company name must be at least 2 characters",
					},
					{status: 400}
			);
		}

		const company = await prisma.company.create({
			data: {
				name,
				members: {
					create: {
						userId: session.user.id,
						role: "OWNER",
					},
				},
			},

			include: {
				members: true,
			},
		});

		return NextResponse.json({
					message: "Company created successfully",
					company,
				},
				{status: 201}
		);
	} catch (error) {
		console.error("CREATE_COMPANY_ERROR:", error);

		return NextResponse.json({
					message: "Something went wrong",
				},
				{status: 500}
		);
	}
}

export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
					{message: "Unauthorized"},
					{status: 401}
			);
		}

		const memberships = await prisma.companyMember.findMany({
			where: {
				userId: session.user.id,
			},
			include: {
				company: true,
			},
			orderBy: {
				createdAt: "asc",
			},
		});

		const companies = memberships.map((membership) => ({
			id: membership.company.id,
			name: membership.company.name,
			role: membership.role,
		}));

		return NextResponse.json({
			companies,
		});

	} catch (error) {
		console.error("GET_COMPANIES_ERROR:", error);

		return NextResponse.json(
				{message: "Something went wrong"},
				{status: 500}
		);
	}
}