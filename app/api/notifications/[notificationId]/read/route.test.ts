import {beforeEach, describe, expect, it, vi} from "vitest";

const {
	authMock,
	findFirstMock,
	updateMock,
} = vi.hoisted(() => ({
	authMock: vi.fn(),
	findFirstMock: vi.fn(),
	updateMock: vi.fn(),
}));

vi.mock("@/app/lib/auth", () => ({
	auth: authMock,
}));

vi.mock("@/app/lib/prisma", () => ({
	prisma: {
		notification: {
			findFirst: findFirstMock,
			update: updateMock,
		},
	},
}));

import {PATCH} from "./route";

describe("PATCH /api/notifications/[notificationId]/read", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns 401 when the user is not authenticated", async () => {
		authMock.mockResolvedValue(null);

		const response = await PATCH(
				new Request(
						"http://localhost/api/notifications/notification-1/read"
				),
				{
					params: Promise.resolve({
						notificationId: "notification-1",
					}),
				}
		);

		expect(response.status).toBe(401);

		expect(await response.json()).toEqual({
			error: "Unauthorized",
		});

		expect(findFirstMock).not.toHaveBeenCalled();
	});

	it("returns 404 when the notification does not belong to the current user", async () => {
		authMock.mockResolvedValue({
			user: {
				id: "user-1",
			},
		});

		findFirstMock.mockResolvedValue(null);

		const response = await PATCH(
				new Request(
						"http://localhost/api/notifications/notification-1/read"
				),
				{
					params: Promise.resolve({
						notificationId: "notification-1",
					}),
				}
		);

		expect(response.status).toBe(404);

		expect(await response.json()).toEqual({
			error: "Notification not found",
		});

		expect(findFirstMock).toHaveBeenCalledWith({
			where: {
				id: "notification-1",
				userId: "user-1",
			},
		});

		expect(updateMock).not.toHaveBeenCalled();
	});

	it("marks an unread notification as read", async () => {
		authMock.mockResolvedValue({
			user: {
				id: "user-1",
			},
		});

		findFirstMock.mockResolvedValue({
			id: "notification-1",
			isRead: false,
			readAt: null,
		});

		const readAt = new Date("2026-09-28T12:00:00.000Z");

		updateMock.mockResolvedValue({
			id: "notification-1",
			isRead: true,
			readAt,
		});

		const response = await PATCH(
				new Request(
						"http://localhost/api/notifications/notification-1/read"
				),
				{
					params: Promise.resolve({
						notificationId: "notification-1",
					}),
				}
		);

		expect(response.status).toBe(200);

		const body = await response.json();

		expect(body.notification.id).toBe("notification-1");
		expect(body.notification.isRead).toBe(true);
		expect(body.notification.readAt).toBe(readAt.toISOString());

		expect(updateMock).toHaveBeenCalledWith({
			where: {
				id: "notification-1",
			},
			data: {
				isRead: true,
				readAt: expect.any(Date),
			},
		});
	});

	it("does not update an already read notification", async () => {
		authMock.mockResolvedValue({
			user: {
				id: "user-1",
			},
		});

		const readAt = new Date("2026-09-28T11:00:00.000Z");

		findFirstMock.mockResolvedValue({
			id: "notification-1",
			isRead: true,
			readAt,
		});

		const response = await PATCH(
				new Request(
						"http://localhost/api/notifications/notification-1/read"
				),
				{
					params: Promise.resolve({
						notificationId: "notification-1",
					}),
				}
		);

		expect(response.status).toBe(200);

		expect(await response.json()).toEqual({
			notification: {
				id: "notification-1",
				isRead: true,
				readAt: readAt.toISOString(),
			},
		});

		expect(updateMock).not.toHaveBeenCalled();
	});
});