const retryDelaysInMinutes = [1, 5];

export function getRetryDelayInMinutes(attempts: number) {
	if (attempts <= 0) {
		return 0;
	}

	const index = attempts - 1;

	return retryDelaysInMinutes[index] ?? null;
}

export function getNextRetryAt(
		attempts: number,
		lastAttemptAt: Date
) {
	const delay = getRetryDelayInMinutes(attempts);

	if (delay === null) {
		return null;
	}

	return new Date(
			lastAttemptAt.getTime() + delay * 60 * 1000
	);
}