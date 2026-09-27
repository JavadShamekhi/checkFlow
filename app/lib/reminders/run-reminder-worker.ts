import {processDueReminders} from "./process-due-reminders";
import {recoverStaleReminders} from "./recover-stale-reminders";

export async function runReminderWorker(now = new Date()) {
	const recovered = await recoverStaleReminders(now);

	const result = await processDueReminders(now);

	return {
		recovered,
		...result,
	};
}