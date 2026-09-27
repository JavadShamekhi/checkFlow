import {beforeEach, describe, expect, it, vi} from "vitest";

vi.mock("@/app/lib/prisma", () => ({
	prisma: {
		checkReminder: {
			findUnique: vi.fn(),
			updateMany: vi.fn(),
			update: vi.fn(),
		},
	},
}));

import {prisma} from "@/app/lib/prisma";
import {sendNotification} from "./notification-service";

const findUniqueMock = vi.mocked(prisma.checkReminder.findUnique);
const updateManyMock = vi.mocked(prisma.checkReminder.updateMany);
const updateMock = vi.mocked(prisma.checkReminder.update);

describe("sendNotification", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("sends a pending IN_APP reminder", async () => {
		const reminder = {
			id: "reminder-1",
			status: "PENDING",
			channel: "IN_APP",
			attempts: 0,
		};

		const sentReminder = {
			...reminder,
			status: "SENT",
			attempts: 1,
		};

		findUniqueMock.mockResolvedValue(reminder as never);
		updateManyMock.mockResolvedValue({count: 1});
		updateMock.mockResolvedValue(sentReminder as never);

		const result = await sendNotification("reminder-1");

		expect(updateManyMock).toHaveBeenCalledWith({
			where: {
				id: "reminder-1",
				status: {
					in: ["PENDING", "FAILED"],
				},
				attempts: {
					lt: 3,
				},
			},
			data: {
				status: "PROCESSING",
				attempts: {
					increment: 1,
				},
				lastAttemptAt: expect.any(Date),
				processingStartedAt: expect.any(Date),
			},
		});

		expect(updateMock).toHaveBeenCalledWith({
			where: {
				id: "reminder-1",
			},
			data: {
				status: "SENT",
				sentAt: expect.any(Date),
				processingStartedAt: null,
			},
		});

		expect(result).toEqual(sentReminder);
	});

	it("retries a FAILED reminder", async () => {
		const reminder = {
			id: "reminder-2",
			status: "FAILED",
			channel: "IN_APP",
			attempts: 1,
		};

		const sentReminder = {
			...reminder,
			status: "SENT",
			attempts: 2,
		};

		findUniqueMock.mockResolvedValue(reminder as never);
		updateManyMock.mockResolvedValue({count: 1});
		updateMock.mockResolvedValue(sentReminder as never);

		const result = await sendNotification("reminder-2");

		expect(result).toEqual(sentReminder);
		expect(updateManyMock).toHaveBeenCalledTimes(1);
	});

	it("does not retry after maximum attempts", async () => {
		const reminder = {
			id: "reminder-3",
			status: "FAILED",
			channel: "IN_APP",
			attempts: 3,
		};

		findUniqueMock.mockResolvedValue(reminder as never);

		const result = await sendNotification("reminder-3");

		expect(result).toEqual(reminder);
		expect(updateManyMock).not.toHaveBeenCalled();
		expect(updateMock).not.toHaveBeenCalled();
	});

	it("does not process an already sent reminder", async () => {
		const reminder = {
			id: "reminder-4",
			status: "SENT",
			channel: "IN_APP",
			attempts: 1,
		};

		findUniqueMock.mockResolvedValue(reminder as never);

		const result = await sendNotification("reminder-4");

		expect(result).toEqual(reminder);
		expect(updateManyMock).not.toHaveBeenCalled();
	});

	it("marks the reminder as FAILED when sending fails", async () => {
		const reminder = {
			id: "reminder-5",
			status: "PENDING",
			channel: "SMS",
			attempts: 0,
		};

		findUniqueMock.mockResolvedValue(reminder as never);
		updateManyMock.mockResolvedValue({count: 1});
		updateMock.mockResolvedValue({
			...reminder,
			status: "FAILED",
			attempts: 1,
		} as never);

		await expect(
				sendNotification("reminder-5")
		).rejects.toThrow("Unsupported notification channel: SMS");

		expect(updateMock).toHaveBeenCalledWith({
			where: {
				id: "reminder-5",
			},
			data: {
				status: "FAILED",
				processingStartedAt: null,
			},
		});
	});

	it("does nothing when another worker already claimed the reminder", async () => {
		const reminder = {
			id: "reminder-6",
			status: "PENDING",
			channel: "IN_APP",
			attempts: 0,
		};

		findUniqueMock.mockResolvedValue(reminder as never);
		updateManyMock.mockResolvedValue({count: 0});

		const result = await sendNotification("reminder-6");

		expect(result).toBeNull();
		expect(updateMock).not.toHaveBeenCalled();
	});
});