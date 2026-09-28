import {beforeEach, describe, expect, it, vi} from "vitest";

const {
	authMock,
	updateManyMock,
} = vi.hoisted(() => ({
	authMock: vi.fn(),
	updateManyMock: vi.fn(),
}));

vi.mock("@/app/lib/auth", () => ({
	auth: authMock,
}));

vi.mock("@/app/lib/prisma", () => ({
	prisma: {
		notification: {
			updateMany: updateManyMock,
		},
	},
}));

import {PATCH} from "./route";

describe("PATCH /api/notifications/read-all", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns 401 when the user is not authenticated", async () => {
		authMock.mockResolvedValue(null);

		const response = await PATCH();

		expect(response.status).toBe(401);

		expect(await response.json()).toEqual({
			error: "Unauthorized",
		});

		expect(updateManyMock).not.toHaveBeenCalled();
	});

	it("marks all unread notifications of the current user as read", async () => {
		authMock.mockResolvedValue({
			user: {
				id: "user-1",
			},
		});

		updateManyMock.mockResolvedValue({
			count: 3,
		});

		const response = await PATCH();

		expect(response.status).toBe(200);

		const body = await response.json();

		expect(body).toEqual({
			success: true,
			updatedCount: 3,
		});

		expect(updateManyMock).toHaveBeenCalledWith({
			where: {
				userId: "user-1",
				isRead: false,
			},
			data: {
				isRead: true,
				readAt: expect.any(Date),
			},
		});
	});

	it("returns zero when there are no unread notifications", async () => {
		authMock.mockResolvedValue({
			user: {
				id: "user-1",
			},
		});

		updateManyMock.mockResolvedValue({
			count: 0,
		});

		const response = await PATCH();

		expect(response.status).toBe(200);

		expect(await response.json()).toEqual({
			success: true,
			updatedCount: 0,
		});
	});
});