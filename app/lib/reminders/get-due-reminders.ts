import { prisma } from "@/app/lib/prisma";

export async function getDueReminders(now = new Date()) {
	return prisma.checkReminder.findMany({
		where: {
			status: "PENDING",
			remindAt: {
				lte: now,
			},
		},
		orderBy: {
			remindAt: "asc",
		},
		include: {
			check: {
				include: {
					bank: true,
					bankAccount: {
						include: {
							bank: true,
						},
					},
				},
			},
		},
	});
}