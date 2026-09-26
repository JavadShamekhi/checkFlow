import { prisma } from "@/app/lib/prisma";

export async function sendNotification(reminderId: string) {
	const claimedReminder = await prisma.checkReminder.updateMany({
		where: {
			id: reminderId,
			status: "PENDING",
		},
		data: {
			status: "SENT",
			sentAt: new Date(),
		},
	});

	if (claimedReminder.count === 0) {
		return null;
	}

	return prisma.checkReminder.findUnique({
		where: {
			id: reminderId,
		},
	});
}