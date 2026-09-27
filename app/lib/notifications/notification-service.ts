import { prisma } from "@/app/lib/prisma";
import { getNotificationProvider } from "./notification-providers";

const MAX_ATTEMPTS = 3;

export async function sendNotification(reminderId: string) {
	const reminder = await prisma.checkReminder.findUnique({
		where: {
			id: reminderId,
		},
	});

	if (!reminder) {
		throw new Error("Reminder not found");
	}

	if (
			reminder.status === "SENT" ||
			reminder.status === "PROCESSING"
	) {
		return reminder;
	}

	if (reminder.attempts >= MAX_ATTEMPTS) {
		return reminder;
	}

	const processingStartedAt = new Date();

	const claimedReminder = await prisma.checkReminder.updateMany({
		where: {
			id: reminderId,
			status: {
				in: ["PENDING", "FAILED"],
			},
			attempts: {
				lt: MAX_ATTEMPTS,
			},
		},
		data: {
			status: "PROCESSING",
			attempts: {
				increment: 1,
			},
			lastAttemptAt: processingStartedAt,
			processingStartedAt,
		},
	});

	if (claimedReminder.count === 0) {
		return null;
	}

	try {
		const provider = getNotificationProvider(reminder.channel);

		await provider.send(reminder);

		return await prisma.checkReminder.update({
			where: {
				id: reminderId,
			},
			data: {
				status: "SENT",
				sentAt: new Date(),
				processingStartedAt: null,
			},
		});
	} catch (error) {
		await prisma.checkReminder.update({
			where: {
				id: reminderId,
			},
			data: {
				status: "FAILED",
				processingStartedAt: null,
			},
		});

		throw error;
	}
}