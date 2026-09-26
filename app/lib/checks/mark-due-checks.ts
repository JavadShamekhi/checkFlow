import {prisma} from "@/app/lib/prisma";

export async function markDueChecks(now = new Date()) {
	const result = await prisma.check.updateMany({
		where: {
			status: "PENDING",
			dueDate: {
				lte: now,
			},
		},
		data: {
			status: "DUE",
		},
	});

	return result.count;
}