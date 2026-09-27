import {beforeEach, describe, expect, it, vi} from "vitest";

vi.mock("@/app/lib/prisma", () => ({
	prisma: {
		checkReminder: {
			findMany: vi.fn(),
		},
	},
}));

import {prisma} from "@/app/lib/prisma";
import {getDueReminders} from "./get-due-reminders";

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
				attempts: 0,
				lastAttemptAt: null,
			},
		];

		findManyMock.mockResolvedValue(reminders as never);

		const result = await getDueReminders(now);

		expect(result).toEqual(reminders);
	});

	it("returns a failed reminder when its retry time has arrived", async () => {
		const now = new Date("2026-10-20T12:02:00.000Z");

		const reminders = [
			{
				id: "reminder-2",
				status: "FAILED",
				remindAt: new Date("2026-10-20T10:00:00.000Z"),
				attempts: 1,
				lastAttemptAt: new Date("2026-10-20T12:00:00.000Z"),
			},
		];

		findManyMock.mockResolvedValue(reminders as never);

		const result = await getDueReminders(now);

		expect(result).toEqual(reminders);
	});

	it("does not return a failed reminder before its retry time", async () => {
		const now = new Date("2026-10-20T12:00:30.000Z");

		const reminders = [
			{
				id: "reminder-3",
				status: "FAILED",
				remindAt: new Date("2026-10-20T10:00:00.000Z"),
				attempts: 1,
				lastAttemptAt: new Date("2026-10-20T12:00:00.000Z"),
			},
		];

		findManyMock.mockResolvedValue(reminders as never);

		const result = await getDueReminders(now);

		expect(result).toEqual([]);
	});

	it("does not return a failed reminder after maximum attempts", async () => {
		const now = new Date("2026-10-20T20:00:00.000Z");

		const reminders = [
			{
				id: "reminder-4",
				status: "FAILED",
				remindAt: new Date("2026-10-20T10:00:00.000Z"),
				attempts: 3,
				lastAttemptAt: new Date("2026-10-20T12:00:00.000Z"),
			},
		];

		findManyMock.mockResolvedValue(reminders as never);

		const result = await getDueReminders(now);

		expect(result).toEqual([]);
	});

	it("does not return a failed reminder without lastAttemptAt", async () => {
		const now = new Date("2026-10-20T20:00:00.000Z");

		const reminders = [
			{
				id: "reminder-5",
				status: "FAILED",
				remindAt: new Date("2026-10-20T10:00:00.000Z"),
				attempts: 1,
				lastAttemptAt: null,
			},
		];

		findManyMock.mockResolvedValue(reminders as never);

		const result = await getDueReminders(now);

		expect(result).toEqual([]);
	});

	it("filters out pending reminders that are not due yet", async () => {
		const now = new Date("2026-10-20T12:00:00.000Z");

		const reminders = [
			{
				id: "reminder-6",
				status: "PENDING",
				remindAt: new Date("2026-10-20T13:00:00.000Z"),
				attempts: 0,
				lastAttemptAt: null,
			},
		];

		findManyMock.mockResolvedValue(reminders as never);

		const result = await getDueReminders(now);

		expect(result).toEqual([]);
	});

	it("limits the number of reminders returned", async () => {
		vi.mocked(prisma.checkReminder.findMany).mockResolvedValue(
				Array.from({length: 5}, (_, index) => ({
					id: `reminder-${index}`,
					checkId: `check-${index}`,
					remindAt: new Date("2026-09-20T10:00:00Z"),
					channel: "IN_APP",
					recipient: `company-${index}`,
					sentAt: null,
					status: "PENDING",
					attempts: 0,
					lastAttemptAt: null,
					createdAt: new Date(),
					check: {
						id: `check-${index}`,
						bank: {},
						bankAccount: null,
					},
				})) as any
		);

		await getDueReminders(
				new Date("2026-09-20T12:00:00Z"),
				3
		);

		expect(prisma.checkReminder.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					take: 3,
				})
		);
	});

	it("orders reminders deterministically by remindAt and id", async () => {
		vi.mocked(prisma.checkReminder.findMany).mockResolvedValue([]);

		await getDueReminders(
				new Date("2026-09-20T12:00:00Z")
		);

		expect(prisma.checkReminder.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					orderBy: [
						{remindAt: "asc"},
						{id: "asc"},
					],
				})
		);
	});
});