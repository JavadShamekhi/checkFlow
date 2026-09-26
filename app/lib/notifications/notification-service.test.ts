import {beforeEach, describe, expect, it, vi} from "vitest";

vi.mock("@/app/lib/prisma", () => ({
	prisma: {
		checkReminder: {
			updateMany: vi.fn(),
			findUnique: vi.fn(),
		},
	},
}));

import {prisma} from "@/app/lib/prisma";
import {sendNotification} from "./notification-service";

const updateManyMock = vi.mocked(prisma.checkReminder.updateMany);
const findUniqueMock = vi.mocked(prisma.checkReminder.findUnique);

describe("sendNotification", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("claims a pending reminder and marks it as SENT", async () => {
		updateManyMock.mockResolvedValue({
			count: 1,
		});

		const updatedReminder = {
			id: "reminder-1",
			status: "SENT",
			sentAt: new Date(),
		};

		findUniqueMock.mockResolvedValue(updatedReminder as never);

		const result = await sendNotification("reminder-1");

		expect(updateManyMock).toHaveBeenCalledWith({
			where: {
				id: "reminder-1",
				status: "PENDING",
			},
			data: {
				status: "SENT",
				sentAt: expect.any(Date),
			},
		});

		expect(findUniqueMock).toHaveBeenCalledWith({
			where: {
				id: "reminder-1",
			},
		});

		expect(result).toEqual(updatedReminder);
	});

	it("does not process a reminder that was already claimed", async () => {
		updateManyMock.mockResolvedValue({
			count: 0,
		});

		const result = await sendNotification("reminder-2");

		expect(result).toBeNull();

		expect(findUniqueMock).not.toHaveBeenCalled();
	});

	it("does not process an already sent reminder", async () => {
		updateManyMock.mockResolvedValue({
			count: 0,
		});

		const result = await sendNotification("reminder-3");

		expect(result).toBeNull();

		expect(updateManyMock).toHaveBeenCalledTimes(1);
		expect(findUniqueMock).not.toHaveBeenCalled();
	});
});