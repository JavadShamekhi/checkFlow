import {prisma} from "@/app/lib/prisma";

const DEFAULT_STALE_MINUTES = 10;

export async function recoverStaleReminders(
		now = new Date(),
		staleMinutes = DEFAULT_STALE_MINUTES
) {
	const cutoff = new Date(
			now.getTime() - staleMinutes * 60 * 1000
	);

	const result = await prisma.checkReminder.updateMany({
		where: {
			status: "PROCESSING",
			processingStartedAt: {
				not: null,
				lt: cutoff,
			},
		},
		data: {
			status: "FAILED",
			processingStartedAt: null,
		},
	});

	return result.count;
}