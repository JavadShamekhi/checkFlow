import type {ReminderChannel} from "@/app/generated/prisma/client";
import type {NotificationProvider} from "./notification-provider";
import {InAppNotificationProvider} from "./providers/in-app-provider";

const providers: Record<ReminderChannel, NotificationProvider> = {
	IN_APP: new InAppNotificationProvider(),

	SMS: {
		async send() {
			throw new Error("SMS notification provider is not configured");
		},
	},

	EMAIL: {
		async send() {
			throw new Error("EMAIL notification provider is not configured");
		},
	},
};

export function getNotificationProvider(
		channel: ReminderChannel
): NotificationProvider {
	return providers[channel];
}