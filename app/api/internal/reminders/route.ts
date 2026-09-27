import {NextResponse} from "next/server";
import {runReminderWorker} from "@/app/lib/reminders/run-reminder-worker";

export async function POST(request: Request) {
	const authHeader = request.headers.get("authorization");

	const expectedToken = process.env.CRON_SECRET;

	if (!expectedToken) {
		return NextResponse.json(
				{error: "CRON_SECRET is not configured"},
				{status: 500}
		);
	}

	if (authHeader !== `Bearer ${expectedToken}`) {
		return NextResponse.json(
				{error: "Unauthorized"},
				{status: 401}
		);
	}

	try {
		const result = await runReminderWorker();

		return NextResponse.json({
			success: true,
			...result,
		});
	} catch (error) {
		console.error("Reminder worker failed:", error);

		return NextResponse.json(
				{
					success: false,
					error: "Reminder worker failed",
				},
				{status: 500}
		);
	}
}