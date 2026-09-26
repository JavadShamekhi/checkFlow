import type {CheckStatus} from "@/app/generated/prisma/client";

const allowedTransitions: Record<CheckStatus, CheckStatus[]> = {
	PENDING: [
		"DUE",
		"PAID",
		"RECEIVED",
		"CANCELLED",
	],

	DUE: [
		"PAID",
		"RECEIVED",
		"BOUNCED",
	],

	PAID: [],

	RECEIVED: [],

	BOUNCED: [
		"PAID",
	],

	CANCELLED: [],
};

export function canTransitionCheckStatus(
		currentStatus: CheckStatus,
		nextStatus: CheckStatus
) {
	if (currentStatus === nextStatus) {
		return true;
	}

	return allowedTransitions[currentStatus].includes(nextStatus);
}

export function getAllowedCheckStatusTransitions(
		currentStatus: CheckStatus
) {
	return allowedTransitions[currentStatus];
}