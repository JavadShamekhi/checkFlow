import { getDueReminders } from "./get-due-reminders";
import { sendNotification } from "@/app/lib/notifications/notification-service";

export async function processDueReminders(now = new Date()) {
	const reminders = await getDueReminders(now);

	let sent = 0;
	let failed = 0;

	for (const reminder of reminders) {
		try {
			await sendNotification(reminder.id);
			sent++;
		} catch {
			failed++;
		}
	}

	return {
		total: reminders.length,
		sent,
		failed,
	};
}