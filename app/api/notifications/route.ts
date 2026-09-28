import {NextResponse} from "next/server";
import {auth} from "@/app/lib/auth";
import {prisma} from "@/app/lib/prisma";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(request: Request) {
	const session = await auth();

	if (!session?.user?.id) {
		return NextResponse.json(
				{error: "Unauthorized"},
				{status: 401}
		);
	}

	const {searchParams} = new URL(request.url);

	const requestedLimit = Number(
			searchParams.get("limit") ?? DEFAULT_LIMIT
	);

	const limit = Number.isFinite(requestedLimit)
			? Math.min(Math.max(Math.trunc(requestedLimit), 1), MAX_LIMIT)
			: DEFAULT_LIMIT;

	const notifications = await prisma.notification.findMany({
		where: {
			userId: session.user.id,
		},
		orderBy: {
			createdAt: "desc",
		},
		take: limit,
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

	const unreadCount = await prisma.notification.count({
		where: {
			userId: session.user.id,
			isRead: false,
		},
	});

	return NextResponse.json({
		notifications: notifications.map((notification) => ({
			id: notification.id,
			type: notification.type,
			title: notification.title,
			message: notification.message,
			isRead: notification.isRead,
			readAt: notification.readAt,
			createdAt: notification.createdAt,
			companyId: notification.companyId,
			check: notification.reminder?.check
					? {
						id: notification.reminder.check.id,
						type: notification.reminder.check.type,
						sayadId: notification.reminder.check.sayadId,
						dueDate: notification.reminder.check.dueDate,
					}
					: null,
		})),
		unreadCount,
	});
}