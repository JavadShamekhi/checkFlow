import {prisma} from "@/app/lib/prisma";
import {getNextRetryAt} from "../notifications/retry-policy";

const DEFAULT_LIMIT = 100;

export async function getDueReminders(
		now = new Date(),
		limit = DEFAULT_LIMIT
) {
	const reminders = await prisma.checkReminder.findMany({
		where: {
			status: {
				in: ["PENDING", "FAILED"],
			},
			OR: [
				{
					status: "PENDING",
					remindAt: {
						lte: now,
					},
				},
				{
					status: "FAILED",
					lastAttemptAt: {
						not: null,
					},
					attempts: {
						lt: 3,
					},
				},
			],
		},

		orderBy: [
			{
				remindAt: "asc",
			},
			{
				id: "asc",
			},
		],

		take: limit,

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

	return reminders.filter((reminder) => {
		if (reminder.status === "PENDING") {
			return reminder.remindAt <= now;
		}

		if (!reminder.lastAttemptAt) {
			return false;
		}

		const nextRetryAt = getNextRetryAt(
				reminder.attempts,
				reminder.lastAttemptAt
		);

		return nextRetryAt !== null && nextRetryAt <= now;
	});
}