import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/lib/prisma", () => ({
	prisma: {
		checkReminder: {
			findMany: vi.fn(),
		},
	},
}));

import { prisma } from "@/app/lib/prisma";
import { getDueReminders } from "./get-due-reminders";

const findManyMock = vi.mocked(prisma.checkReminder.findMany);

describe("getDueReminders", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns pending reminders whose remindAt is due", async () => {
		const now = new Date("2026-10-20T12:00:00.000Z");

		const reminders = [
			{
				id: "reminder-1",
				status: "PENDING",
				remindAt: new Date("2026-10-20T10:00:00.000Z"),
			},
		];

		findManyMock.mockResolvedValue(reminders as never);

		const result = await getDueReminders(now);

		expect(findManyMock).toHaveBeenCalledWith({
			where: {
				status: "PENDING",
				remindAt: {
					lte: now,
				},
			},
			orderBy: {
				remindAt: "asc",
			},
			include: {
				check: {
					include: {
						bank: true,
						bankAccount: {
							include: {
								bank: true,
							},
						},
					},
				},
			},
		});

		expect(result).toEqual(reminders);
	});

	it("returns an empty array when there are no due reminders", async () => {
		findManyMock.mockResolvedValue([]);

		const now = new Date("2026-10-20T12:00:00.000Z");

		const result = await getDueReminders(now);

		expect(result).toEqual([]);
	});
});