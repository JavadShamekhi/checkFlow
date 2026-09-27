import {beforeEach, describe, expect, it, vi} from "vitest";

const {
	findUniqueMock,
	updateManyMock,
	updateMock,
	providerSendMock,
} = vi.hoisted(() => ({
	findUniqueMock: vi.fn(),
	updateManyMock: vi.fn(),
	updateMock: vi.fn(),
	providerSendMock: vi.fn(),
}));

vi.mock("@/app/lib/prisma", () => ({
	prisma: {
		checkReminder: {
			findUnique: findUniqueMock,
			updateMany: updateManyMock,
			update: updateMock,
		},
	},
}));

vi.mock("./notification-providers", () => ({
	getNotificationProvider: vi.fn(() => ({
		send: providerSendMock,
	})),
}));

import {sendNotification} from "./notification-service";

describe("sendNotification", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		providerSendMock.mockResolvedValue(undefined);
		updateMock.mockResolvedValue({
			id: "reminder-1",
			status: "SENT",
		});
	});

	it("sends a pending IN_APP reminder", async () => {
		const reminder = {
			id: "reminder-1",
			channel: "IN_APP",
			status: "PENDING",
			attempts: 0,
			check: {
				companyId: "company-1",
			},
		};

		findUniqueMock.mockResolvedValue(reminder);

		updateManyMock.mockResolvedValue({
			count: 1,
		});

		await sendNotification("reminder-1");

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

		expect(providerSendMock).toHaveBeenCalledTimes(1);

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
	});

	it("retries a FAILED reminder", async () => {
		const lastAttemptAt = new Date("2026-09-27T10:00:00.000Z");

		findUniqueMock.mockResolvedValue({
			id: "reminder-1",
			channel: "IN_APP",
			status: "FAILED",
			attempts: 1,
			lastAttemptAt,
			check: {
				companyId: "company-1",
			},
		});

		updateManyMock.mockResolvedValue({
			count: 1,
		});

		await sendNotification("reminder-1");

		expect(providerSendMock).toHaveBeenCalledTimes(1);

		expect(updateManyMock).toHaveBeenCalledTimes(1);

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
	});

	it("does not retry after maximum attempts", async () => {
		findUniqueMock.mockResolvedValue({
			id: "reminder-1",
			channel: "IN_APP",
			status: "FAILED",
			attempts: 3,
			check: {
				companyId: "company-1",
			},
		});

		const result = await sendNotification("reminder-1");

		expect(result).toEqual({
			id: "reminder-1",
			channel: "IN_APP",
			status: "FAILED",
			attempts: 3,
			check: {
				companyId: "company-1",
			},
		});

		expect(updateManyMock).not.toHaveBeenCalled();
		expect(providerSendMock).not.toHaveBeenCalled();
	});

	it("does not process an already sent reminder", async () => {
		const reminder = {
			id: "reminder-1",
			channel: "IN_APP",
			status: "SENT",
			attempts: 1,
			check: {
				companyId: "company-1",
			},
		};

		findUniqueMock.mockResolvedValue(reminder);

		const result = await sendNotification("reminder-1");

		expect(result).toEqual(reminder);

		expect(updateManyMock).not.toHaveBeenCalled();
		expect(providerSendMock).not.toHaveBeenCalled();
	});

	it("marks the reminder as FAILED when sending fails", async () => {
		findUniqueMock.mockResolvedValue({
			id: "reminder-1",
			channel: "IN_APP",
			status: "PENDING",
			attempts: 0,
			check: {
				companyId: "company-1",
			},
		});

		updateManyMock.mockResolvedValue({
			count: 1,
		});

		providerSendMock.mockRejectedValue(
				new Error("Notification failed")
		);

		await expect(
				sendNotification("reminder-1")
		).rejects.toThrow("Notification failed");

		expect(updateMock).toHaveBeenCalledWith({
			where: {
				id: "reminder-1",
			},
			data: {
				status: "FAILED",
				processingStartedAt: null,
			},
		});
	});

	it("does nothing when another worker already claimed the reminder", async () => {
		findUniqueMock.mockResolvedValue({
			id: "reminder-1",
			channel: "IN_APP",
			status: "PENDING",
			attempts: 0,
			check: {
				companyId: "company-1",
			},
		});

		updateManyMock.mockResolvedValue({
			count: 0,
		});

		const result = await sendNotification("reminder-1");

		expect(result).toBeNull();

		expect(providerSendMock).not.toHaveBeenCalled();
		expect(updateMock).not.toHaveBeenCalled();
	});
});