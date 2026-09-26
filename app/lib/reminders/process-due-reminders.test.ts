import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./get-due-reminders", () => ({
	getDueReminders: vi.fn(),
}));

vi.mock("@/app/lib/notifications/notification-service", () => ({
	sendNotification: vi.fn(),
}));

import { getDueReminders } from "./get-due-reminders";
import { sendNotification } from "@/app/lib/notifications/notification-service";
import { processDueReminders } from "./process-due-reminders";

const getDueRemindersMock = vi.mocked(getDueReminders);
const sendNotificationMock = vi.mocked(sendNotification);

describe("processDueReminders", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("processes all due reminders successfully", async () => {
		const reminders = [
			{ id: "reminder-1" },
			{ id: "reminder-2" },
			{ id: "reminder-3" },
		];

		getDueRemindersMock.mockResolvedValue(reminders as never);
		sendNotificationMock.mockResolvedValue({} as never);

		const now = new Date("2026-10-20T12:00:00.000Z");

		const result = await processDueReminders(now);

		expect(getDueRemindersMock).toHaveBeenCalledWith(now);

		expect(sendNotificationMock).toHaveBeenCalledTimes(3);
		expect(sendNotificationMock).toHaveBeenNthCalledWith(
				1,
				"reminder-1"
		);
		expect(sendNotificationMock).toHaveBeenNthCalledWith(
				2,
				"reminder-2"
		);
		expect(sendNotificationMock).toHaveBeenNthCalledWith(
				3,
				"reminder-3"
		);

		expect(result).toEqual({
			total: 3,
			sent: 3,
			failed: 0,
		});
	});

	it("continues processing when one reminder fails", async () => {
		const reminders = [
			{ id: "reminder-1" },
			{ id: "reminder-2" },
			{ id: "reminder-3" },
		];

		getDueRemindersMock.mockResolvedValue(reminders as never);

		sendNotificationMock
				.mockResolvedValueOnce({} as never)
				.mockRejectedValueOnce(new Error("Notification failed"))
				.mockResolvedValueOnce({} as never);

		const result = await processDueReminders();

		expect(sendNotificationMock).toHaveBeenCalledTimes(3);

		expect(result).toEqual({
			total: 3,
			sent: 2,
			failed: 1,
		});
	});

	it("returns zero counts when there are no due reminders", async () => {
		getDueRemindersMock.mockResolvedValue([]);

		const result = await processDueReminders();

		expect(sendNotificationMock).not.toHaveBeenCalled();

		expect(result).toEqual({
			total: 0,
			sent: 0,
			failed: 0,
		});
	});
});