import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/lib/prisma", () => ({
	prisma: {
		check: {
			updateMany: vi.fn(),
		},
	},
}));

import { prisma } from "@/app/lib/prisma";
import { markDueChecks } from "./mark-due-checks";

const updateManyMock = vi.mocked(prisma.check.updateMany);

describe("markDueChecks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("marks pending overdue checks as DUE", async () => {
		updateManyMock.mockResolvedValue({
			count: 3,
		});

		const now = new Date("2026-09-20T12:00:00.000Z");

		const result = await markDueChecks(now);

		expect(updateManyMock).toHaveBeenCalledWith({
			where: {
				status: "PENDING",
				dueDate: {
					lte: now,
				},
			},
			data: {
				status: "DUE",
			},
		});

		expect(result).toBe(3);
	});

	it("returns zero when there are no overdue checks", async () => {
		updateManyMock.mockResolvedValue({
			count: 0,
		});

		const now = new Date("2026-09-20T12:00:00.000Z");

		const result = await markDueChecks(now);

		expect(result).toBe(0);
	});
});