import {beforeEach, describe, expect, it, vi} from "vitest";

const {
	authMock,
	findManyMock,
	countMock,
} = vi.hoisted(() => ({
	authMock: vi.fn(),
	findManyMock: vi.fn(),
	countMock: vi.fn(),
}));

vi.mock("@/app/lib/auth", () => ({
	auth: authMock,
}));

vi.mock("@/app/lib/prisma", () => ({
	prisma: {
		notification: {
			findMany: findManyMock,
			count: countMock,
		},
	},
}));

import {GET} from "./route";

describe("GET /api/notifications", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns 401 when the user is not authenticated", async () => {
		authMock.mockResolvedValue(null);

		const response = await GET(
				new Request("http://localhost/api/notifications")
		);

		expect(response.status).toBe(401);

		expect(await response.json()).toEqual({
			error: "Unauthorized",
		});

		expect(findManyMock).not.toHaveBeenCalled();
		expect(countMock).not.toHaveBeenCalled();
	});

	it("returns notifications for the current user", async () => {
		authMock.mockResolvedValue({
			user: {
				id: "user-1",
			},
		});

		findManyMock.mockResolvedValue([
			{
				id: "notification-1",
				type: "CHECK_REMINDER",
				title: "یادآوری چک دریافتی",
				message: "چک 1234567890123456 سررسید می‌شود.",
				isRead: false,
				readAt: null,
				createdAt: new Date("2026-09-28T10:00:00.000Z"),
				companyId: "company-1",
				reminder: {
					check: {
						id: "check-1",
						type: "RECEIVABLE",
						sayadId: "1234567890123456",
						dueDate: new Date("2026-10-05T00:00:00.000Z"),
					},
				},
			},
		]);

		countMock.mockResolvedValue(1);

		const response = await GET(
				new Request("http://localhost/api/notifications")
		);

		expect(response.status).toBe(200);

		expect(await response.json()).toEqual({
			notifications: [
				{
					id: "notification-1",
					type: "CHECK_REMINDER",
					title: "یادآوری چک دریافتی",
					message: "چک 1234567890123456 سررسید می‌شود.",
					isRead: false,
					readAt: null,
					createdAt: "2026-09-28T10:00:00.000Z",
					companyId: "company-1",
					check: {
						id: "check-1",
						type: "RECEIVABLE",
						sayadId: "1234567890123456",
						dueDate: "2026-10-05T00:00:00.000Z",
					},
				},
			],
			unreadCount: 1,
		});

		expect(findManyMock).toHaveBeenCalledWith({
			where: {
				userId: "user-1",
			},
			orderBy: {
				createdAt: "desc",
			},
			take: 50,
			include: {
				reminder: {
					include: {
						check: {
							select: {
								id: true,
								type: true,
								sayadId: true,
								dueDate: true,
							},
						},
					},
				},
			},
		});

		expect(countMock).toHaveBeenCalledWith({
			where: {
				userId: "user-1",
				isRead: false,
			},
		});
	});

	it("respects the requested limit", async () => {
		authMock.mockResolvedValue({
			user: {
				id: "user-1",
			},
		});

		findManyMock.mockResolvedValue([]);
		countMock.mockResolvedValue(0);

		await GET(
				new Request(
						"http://localhost/api/notifications?limit=10"
				)
		);

		expect(findManyMock).toHaveBeenCalledWith(
				expect.objectContaining({
					take: 10,
				})
		);
	});

	it("clamps the limit to 100", async () => {
		authMock.mockResolvedValue({
			user: {
				id: "user-1",
			},
		});

		findManyMock.mockResolvedValue([]);
		countMock.mockResolvedValue(0);

		await GET(
				new Request(
						"http://localhost/api/notifications?limit=500"
				)
		);

		expect(findManyMock).toHaveBeenCalledWith(
				expect.objectContaining({
					take: 100,
				})
		);
	});
});