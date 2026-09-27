import {beforeEach, describe, expect, it, vi} from "vitest";

const {
	findUniqueMock,
	findManyMock,
	createManyMock,
} = vi.hoisted(() => ({
	findUniqueMock: vi.fn(),
	findManyMock: vi.fn(),
	createManyMock: vi.fn(),
}));

vi.mock("@/app/lib/prisma", () => ({
	prisma: {
		checkReminder: {
			findUnique: findUniqueMock,
		},
		companyMember: {
			findMany: findManyMock,
		},
		notification: {
			createMany: createManyMock,
		},
	},
}));

import {InAppNotificationProvider} from "./in-app-provider";

describe("InAppNotificationProvider", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rejects non-IN_APP reminders", async () => {
		const provider = new InAppNotificationProvider();

		await expect(
				provider.send({
					id: "reminder-1",
					channel: "SMS",
				} as never)
		).rejects.toThrow(
				"InAppNotificationProvider cannot handle SMS"
		);

		expect(findUniqueMock).not.toHaveBeenCalled();
	});

	it("throws when reminder does not exist", async () => {
		findUniqueMock.mockResolvedValue(null);

		const provider = new InAppNotificationProvider();

		await expect(
				provider.send({
					id: "reminder-1",
					channel: "IN_APP",
				} as never)
		).rejects.toThrow("Reminder not found");

		expect(findUniqueMock).toHaveBeenCalledWith({
			where: {
				id: "reminder-1",
			},
			include: {
				check: true,
			},
		});
	});

	it("does nothing when the company has no members", async () => {
		findUniqueMock.mockResolvedValue({
			id: "reminder-1",
			check: {
				companyId: "company-1",
				type: "RECEIVABLE",
				sayadId: "1234567890123456",
				dueDate: new Date("2026-10-10T00:00:00.000Z"),
			},
		});

		findManyMock.mockResolvedValue([]);

		const provider = new InAppNotificationProvider();

		await provider.send({
			id: "reminder-1",
			channel: "IN_APP",
		} as never);

		expect(createManyMock).not.toHaveBeenCalled();
	});

	it("creates notifications for all company members", async () => {
		findUniqueMock.mockResolvedValue({
			id: "reminder-1",
			check: {
				companyId: "company-1",
				type: "RECEIVABLE",
				sayadId: "1234567890123456",
				dueDate: new Date("2026-10-10T00:00:00.000Z"),
			},
		});

		findManyMock.mockResolvedValue([
			{userId: "user-1"},
			{userId: "user-2"},
		]);

		createManyMock.mockResolvedValue({
			count: 2,
		});

		const provider = new InAppNotificationProvider();

		await provider.send({
			id: "reminder-1",
			channel: "IN_APP",
		} as never);

		expect(createManyMock).toHaveBeenCalledWith({
			data: [
				{
					reminderId: "reminder-1",
					userId: "user-1",
					companyId: "company-1",
					type: "CHECK_REMINDER",
					title: "یادآوری چک دریافتی",
					message: expect.stringContaining(
							"1234567890123456"
					),
				},
				{
					reminderId: "reminder-1",
					userId: "user-2",
					companyId: "company-1",
					type: "CHECK_REMINDER",
					title: "یادآوری چک دریافتی",
					message: expect.stringContaining(
							"1234567890123456"
					),
				},
			],
			skipDuplicates: true,
		});
	});

	it("uses payable title for payable checks", async () => {
		findUniqueMock.mockResolvedValue({
			id: "reminder-1",
			check: {
				companyId: "company-1",
				type: "PAYABLE",
				sayadId: "1234567890123456",
				dueDate: new Date("2026-10-10T00:00:00.000Z"),
			},
		});

		findManyMock.mockResolvedValue([
			{userId: "user-1"},
		]);

		createManyMock.mockResolvedValue({
			count: 1,
		});

		const provider = new InAppNotificationProvider();

		await provider.send({
			id: "reminder-1",
			channel: "IN_APP",
		} as never);

		expect(createManyMock).toHaveBeenCalledWith(
				expect.objectContaining({
					data: [
						expect.objectContaining({
							title: "یادآوری چک پرداختی",
						}),
					],
				})
		);
	});
});