import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/lib/reminders/run-reminder-worker", () => ({
	runReminderWorker: vi.fn(),
}));

import { runReminderWorker } from "@/app/lib/reminders/run-reminder-worker";
import { POST } from "./route";

const runReminderWorkerMock = vi.mocked(runReminderWorker);

describe("POST /api/internal/reminders", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		process.env.CRON_SECRET = "test-cron-secret";
	});

	it("returns 401 when authorization header is missing", async () => {
		const request = new Request(
				"http://localhost:3000/api/internal/reminders",
				{
					method: "POST",
				}
		);

		const response = await POST(request);

		expect(response.status).toBe(401);
		expect(await response.json()).toEqual({
			error: "Unauthorized",
		});

		expect(runReminderWorkerMock).not.toHaveBeenCalled();
	});

	it("returns 401 when authorization token is invalid", async () => {
		const request = new Request(
				"http://localhost:3000/api/internal/reminders",
				{
					method: "POST",
					headers: {
						Authorization: "Bearer wrong-secret",
					},
				}
		);

		const response = await POST(request);

		expect(response.status).toBe(401);
		expect(await response.json()).toEqual({
			error: "Unauthorized",
		});

		expect(runReminderWorkerMock).not.toHaveBeenCalled();
	});

	it("runs the worker with a valid authorization token", async () => {
		runReminderWorkerMock.mockResolvedValue({
			total: 5,
			sent: 4,
			failed: 1,
		});

		const request = new Request(
				"http://localhost:3000/api/internal/reminders",
				{
					method: "POST",
					headers: {
						Authorization: "Bearer test-cron-secret",
					},
				}
		);

		const response = await POST(request);

		expect(response.status).toBe(200);

		expect(await response.json()).toEqual({
			success: true,
			total: 5,
			sent: 4,
			failed: 1,
		});

		expect(runReminderWorkerMock).toHaveBeenCalledTimes(1);
	});

	it("returns 500 when CRON_SECRET is not configured", async () => {
		delete process.env.CRON_SECRET;

		const request = new Request(
				"http://localhost:3000/api/internal/reminders",
				{
					method: "POST",
					headers: {
						Authorization: "Bearer test-cron-secret",
					},
				}
		);

		const response = await POST(request);

		expect(response.status).toBe(500);

		expect(await response.json()).toEqual({
			error: "CRON_SECRET is not configured",
		});

		expect(runReminderWorkerMock).not.toHaveBeenCalled();
	});

	it("returns 500 when the worker throws", async () => {
		runReminderWorkerMock.mockRejectedValue(
				new Error("Database connection failed")
		);

		const request = new Request(
				"http://localhost:3000/api/internal/reminders",
				{
					method: "POST",
					headers: {
						Authorization: "Bearer test-cron-secret",
					},
				}
		);

		const response = await POST(request);

		expect(response.status).toBe(500);

		expect(await response.json()).toEqual({
			success: false,
			error: "Reminder worker failed",
		});
	});
});