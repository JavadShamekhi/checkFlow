import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {prisma} from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
			Credentials({
				credentials: {
					email: {},
					password: {},
				},

				async authorize(credentials) {
					if (!credentials?.email || !credentials?.password) {
						return null;
					}

					const email = String(credentials.email).toLowerCase().trim();
					const password = String(credentials.password);

					const user = await prisma.user.findUnique({
						where: { email },
					});

					if (!user) {
						return null;
					}

					const isPasswordValid = await bcrypt.compare(
							password,
							user.passwordHash
					);

					if (!isPasswordValid) {
						return null
					}
					return {
						id: user.id,
						email: user.email,
						name: user.name,
					};
				},
			}),
	],

	session: {
		strategy: "jwt",
	},

	secret: process.env.AUTH_SECRET,
});