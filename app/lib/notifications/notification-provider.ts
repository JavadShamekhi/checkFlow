import type { CheckReminder } from "@/app/generated/prisma/client";

export interface NotificationProvider {
	send(reminder: CheckReminder): Promise<void>;
}