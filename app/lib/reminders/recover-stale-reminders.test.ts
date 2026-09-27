import {beforeEach, describe, expect, it, vi} from "vitest";

const {updateManyMock} = vi.hoisted(() => ({
	updateManyMock: vi.fn(),
}));

vi.mock("@/app/lib/prisma", () => ({
	prisma: {
		checkReminder: {
			updateMany: updateManyMock,
		},
	},
}));

import {recoverStaleReminders} from "./recover-stale-reminders";

describe("recoverStaleReminders", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("recovers stale PROCESSING reminders", async () => {
		updateManyMock.mockResolvedValue({
			count: 3,
		});

		const now = new Date("2026-09-27T14:00:00.000Z");

		const result = await recoverStaleReminders(now);

		expect(result).toBe(3);

		expect(updateManyMock).toHaveBeenCalledWith({
			where: {
				status: "PROCESSING",
				processingStartedAt: {
					not: null,
					lt: new Date("2026-09-27T13:50:00.000Z"),
				},
			},
			data: {
				status: "FAILED",
				processingStartedAt: null,
			},
		});
	});

	it("uses the provided stale timeout", async () => {
		updateManyMock.mockResolvedValue({
			count: 1,
		});

		const now = new Date("2026-09-27T14:00:00.000Z");

		await recoverStaleReminders(now, 30);

		expect(updateManyMock).toHaveBeenCalledWith({
			where: {
				status: "PROCESSING",
				processingStartedAt: {
					not: null,
					lt: new Date("2026-09-27T13:30:00.000Z"),
				},
			},
			data: {
				status: "FAILED",
				processingStartedAt: null,
			},
		});
	});

	it("returns zero when there are no stale reminders", async () => {
		updateManyMock.mockResolvedValue({
			count: 0,
		});

		const now = new Date("2026-09-27T14:00:00.000Z");

		const result = await recoverStaleReminders(now);

		expect(result).toBe(0);
	});
});