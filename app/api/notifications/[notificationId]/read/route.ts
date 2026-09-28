import {NextResponse} from "next/server";
import {auth} from "@/app/lib/auth";
import {prisma} from "@/app/lib/prisma";

type RouteContext = {
	params: Promise<{
		notificationId: string;
	}>;
};

export async function PATCH(
		_request: Request,
		context: RouteContext
) {
	const session = await auth();

	if (!session?.user?.id) {
		return NextResponse.json(
				{error: "Unauthorized"},
				{status: 401}
		);
	}

	const {notificationId} = await context.params;

	const notification = await prisma.notification.findFirst({
		where: {
			id: notificationId,
			userId: session.user.id,
		},
	});

	if (!notification) {
		return NextResponse.json(
				{error: "Notification not found"},
				{status: 404}
		);
	}

	if (notification.isRead) {
		return NextResponse.json({
			notification: {
				id: notification.id,
				isRead: true,
				readAt: notification.readAt,
			},
		});
	}

	const updatedNotification = await prisma.notification.update({
		where: {
			id: notification.id,
		},
		data: {
			isRead: true,
			readAt: new Date(),
		},
	});

	return NextResponse.json({
		notification: {
			id: updatedNotification.id,
			isRead: updatedNotification.isRead,
			readAt: updatedNotification.readAt,
		},
	});
}