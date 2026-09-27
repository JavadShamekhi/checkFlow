import { describe, expect, it } from "vitest";
import {
	getNextRetryAt,
	getRetryDelayInMinutes,
} from "./retry-policy";

describe("getRetryDelayInMinutes", () => {
	it("returns zero for the first attempt", () => {
		expect(getRetryDelayInMinutes(0)).toBe(0);
	});

	it("returns one minute after the first failed attempt", () => {
		expect(getRetryDelayInMinutes(1)).toBe(1);
	});

	it("returns five minutes after the second failed attempt", () => {
		expect(getRetryDelayInMinutes(2)).toBe(5);
	});

	it("returns null after the maximum retry delay", () => {
		expect(getRetryDelayInMinutes(3)).toBeNull();
		expect(getRetryDelayInMinutes(4)).toBeNull();
	});
});

describe("getNextRetryAt", () => {
	const lastAttemptAt = new Date(
			"2026-10-20T12:00:00.000Z"
	);

	it("calculates the next retry time after first failure", () => {
		expect(
				getNextRetryAt(1, lastAttemptAt)
		).toEqual(
				new Date("2026-10-20T12:01:00.000Z")
		);
	});

	it("calculates the next retry time after second failure", () => {
		expect(
				getNextRetryAt(2, lastAttemptAt)
		).toEqual(
				new Date("2026-10-20T12:05:00.000Z")
		);
	});

	it("returns null when no retry is available", () => {
		expect(
				getNextRetryAt(3, lastAttemptAt)
		).toBeNull();
	});
});