import {beforeEach, describe, expect, it, vi} from "vitest";

vi.mock("./process-due-reminders", () => ({
	processDueReminders: vi.fn(),
}));

vi.mock("./recover-stale-reminders", () => ({
	recoverStaleReminders: vi.fn(),
}));

import {processDueReminders} from "./process-due-reminders";
import {recoverStaleReminders} from "./recover-stale-reminders";
import {runReminderWorker} from "./run-reminder-worker";

const processDueRemindersMock = vi.mocked(processDueReminders);
const recoverStaleRemindersMock = vi.mocked(recoverStaleReminders);

describe("runReminderWorker", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("recovers stale reminders before processing due reminders", async () => {
		const now = new Date("2026-10-20T12:00:00.000Z");

		recoverStaleRemindersMock.mockResolvedValue(2);

		processDueRemindersMock.mockResolvedValue({
			total: 5,
			sent: 4,
			failed: 1,
		});

		const workerResult = await runReminderWorker(now);

		expect(recoverStaleRemindersMock).toHaveBeenCalledWith(now);
		expect(processDueRemindersMock).toHaveBeenCalledWith(now);

		expect(workerResult).toEqual({
			recovered: 2,
			total: 5,
			sent: 4,
			failed: 1,
		});

		expect(
				recoverStaleRemindersMock.mock.invocationCallOrder[0]
		).toBeLessThan(
				processDueRemindersMock.mock.invocationCallOrder[0]
		);
	});

	it("uses the current time when no date is provided", async () => {
		recoverStaleRemindersMock.mockResolvedValue(0);

		processDueRemindersMock.mockResolvedValue({
			total: 0,
			sent: 0,
			failed: 0,
		});

		const workerResult = await runReminderWorker();

		expect(recoverStaleRemindersMock).toHaveBeenCalledWith(
				expect.any(Date)
		);

		expect(processDueRemindersMock).toHaveBeenCalledWith(
				expect.any(Date)
		);

		expect(workerResult).toEqual({
			recovered: 0,
			total: 0,
			sent: 0,
			failed: 0,
		});
	});
});