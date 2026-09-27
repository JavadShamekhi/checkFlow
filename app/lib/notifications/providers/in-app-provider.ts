import {prisma} from "@/app/lib/prisma";
import type {CheckReminder} from "@/app/generated/prisma/client";
import type {NotificationProvider} from "../notification-provider";

export class InAppNotificationProvider
		implements NotificationProvider {
	async send(reminder: CheckReminder): Promise<void> {
		if (reminder.channel !== "IN_APP") {
			throw new Error(
					`InAppNotificationProvider cannot handle ${reminder.channel}`);
		}

		const reminderWithCheck = await prisma.checkReminder.findUnique({
			where: {
				id: reminder.id,
			},
			include: {
				check: true,
			},
		});

		if (!reminderWithCheck) {
			throw new Error("Reminder not found");
		}

		const companyId = reminderWithCheck.check.companyId;

		const members = await prisma.companyMember.findMany({
			where: {
				companyId,
			},
			select: {
				userId: true,
			},
		});

		if (members.length === 0) {
			return;
		}

		const title =
				reminderWithCheck.check.type === "RECEIVABLE"
						? "یادآوری چک دریافتی"
						: "یادآوری چک پرداختی";

		const message =
				`چک${reminderWithCheck.check.sayadId} در تاریخ 
				${reminderWithCheck.check.dueDate.toLocaleDateString("fa-IR")}
سررسید می‌شود.`;

		await prisma.notification.createMany({
			data: members.map((member) => ({
				reminderId: reminder.id,
				userId: member.userId,
				companyId,
				type: "CHECK_REMINDER" as const,
				title,
				message,
			})),
			skipDuplicates: true,
		});
	}
}
