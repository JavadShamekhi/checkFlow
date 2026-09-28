import {NextResponse} from "next/server";
import {auth} from "@/app/lib/auth";
import {prisma} from "@/app/lib/prisma";

export async function PATCH() {
	const session = await auth();

	if (!session?.user?.id) {
		return NextResponse.json(
				{error: "Unauthorized"},
				{status: 401}
		);
	}

	const result = await prisma.notification.updateMany({
		where: {
			userId: session.user.id,
			isRead: false,
		},
		data: {
			isRead: true,
			readAt: new Date(),
		},
	});

	return NextResponse.json({
		success: true,
		updatedCount: result.count,
	});
}