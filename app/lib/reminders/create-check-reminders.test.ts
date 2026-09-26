import {beforeEach, describe, expect, it, vi} from "vitest";

vi.mock("@/app/lib/prisma", () => ({
	prisma: {
		checkReminder: {
			createMany: vi.fn(),
		},
	},
}));

import {prisma} from "@/app/lib/prisma";
import {createCheckReminders} from "./create-check-reminders";

const createManyMock = vi.mocked(prisma.checkReminder.createMany);

const check = {
	id: "check-123",
	companyId: "company-123",
	dueDate: new Date("2026-10-20T12:00:00.000Z"),
} as Parameters<typeof createCheckReminders>[0];

describe("createCheckReminders", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("creates four reminders for a future check", async () => {
		createManyMock.mockResolvedValue({
			count: 4,
		});

		const now = new Date("2026-10-01T12:00:00.000Z");

		const result = await createCheckReminders(check, now);

		expect(createManyMock).toHaveBeenCalledWith({
			data: [
				{
					checkId: "check-123",
					remindAt: new Date("2026-10-13T12:00:00.000Z"),
					channel: "IN_APP",
					recipient: "company-123",
				},
				{
					checkId: "check-123",
					remindAt: new Date("2026-10-17T12:00:00.000Z"),
					channel: "IN_APP",
					recipient: "company-123",
				},
				{
					checkId: "check-123",
					remindAt: new Date("2026-10-19T12:00:00.000Z"),
					channel: "IN_APP",
					recipient: "company-123",
				},
				{
					checkId: "check-123",
					remindAt: new Date("2026-10-20T12:00:00.000Z"),
					channel: "IN_APP",
					recipient: "company-123",
				},
			],
			skipDuplicates: true,
		});

		expect(result).toBe(4);
	});

	it("does not create reminders that are already in the past", async () => {
		createManyMock.mockResolvedValue({
			count: 2,
		});

		const now = new Date("2026-10-18T12:00:00.000Z");

		const result = await createCheckReminders(check, now);

		expect(createManyMock).toHaveBeenCalledWith({
			data: [
				{
					checkId: "check-123",
					remindAt: new Date("2026-10-19T12:00:00.000Z"),
					channel: "IN_APP",
					recipient: "company-123",
				},
				{
					checkId: "check-123",
					remindAt: new Date("2026-10-20T12:00:00.000Z"),
					channel: "IN_APP",
					recipient: "company-123",
				},
			],
			skipDuplicates: true,
		});

		expect(result).toBe(2);
	});

	it("returns zero when all reminders are in the past", async () => {
		const now = new Date("2026-10-21T12:00:00.000Z");

		const result = await createCheckReminders(check, now);

		expect(createManyMock).not.toHaveBeenCalled();
		expect(result).toBe(0);
	});
});