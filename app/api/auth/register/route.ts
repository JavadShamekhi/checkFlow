import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/app/lib/prisma";
import { registerSchema } from "@/app/lib/validations/auth";

export async function POST(request: Request) {
	try {
		const body = await request.json();

		const result = registerSchema.safeParse(body);

		if (!result.success) {
			return NextResponse.json(
					{
						message: "Invalid input",
						errors: result.error.flatten(),
					},
					{ status: 400 }
			);
		}

		const { name, email, password } = result.data;

		const normalizedEmail = email.toLowerCase().trim();

		const existingUser = await prisma.user.findUnique({
			where: {
				email: normalizedEmail,
			},
		});

		if (existingUser) {
			return NextResponse.json(
					{
						message: "User already exists",
					},
					{ status: 409 }
			);
		}

		const passwordHash = await bcrypt.hash(password, 12);

		const user = await prisma.user.create({
			data: {
				name,
				email: normalizedEmail,
				passwordHash,
			},
			select: {
				id: true,
				name: true,
				email: true,
				createdAt: true,
			},
		});

		return NextResponse.json(
				{
					message: "User registered successfully",
					user,
				},
				{ status: 201 }
		);
	} catch (error) {
		console.error("REGISTER_ERROR:", error);

		return NextResponse.json(
				{
					message: "Something went wrong",
				},
				{ status: 500 }
		);
	}
}