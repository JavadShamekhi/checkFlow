import {prisma} from "@/app/lib/prisma";
import type {Check} from "@/app/generated/prisma/client";

const reminderOffsets = [
	{daysBefore: 7},
	{daysBefore: 3},
	{daysBefore: 1},
	{daysBefore: 0},
];

export async function createCheckReminders(
		check: Check,
		now = new Date()
) {
	const reminders = reminderOffsets
			.map(({daysBefore}) => {
				const remindAt = new Date(check.dueDate);

				remindAt.setDate(remindAt.getDate() - daysBefore);

				return {
					checkId: check.id,
					remindAt,
					channel: "IN_APP" as const,
					recipient: check.companyId,
				};
			})
			.filter((reminder) => reminder.remindAt > now);

	if (reminders.length === 0) {
		return 0;
	}

	const result = await prisma.checkReminder.createMany({
		data: reminders,
		skipDuplicates: true,
	});

	return result.count;
}