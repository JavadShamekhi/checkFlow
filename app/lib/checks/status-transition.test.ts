import {describe, expect, it} from "vitest";
import {
	canTransitionCheckStatus,
	getAllowedCheckStatusTransitions,
} from "./status-transition";

describe("check status transitions", () => {
	it("allows valid transitions from PENDING", () => {
		expect(canTransitionCheckStatus("PENDING", "DUE")).toBe(true);
		expect(canTransitionCheckStatus("PENDING", "PAID")).toBe(true);
		expect(canTransitionCheckStatus("PENDING", "RECEIVED")).toBe(true);
		expect(canTransitionCheckStatus("PENDING", "CANCELLED")).toBe(true);
	});

	it("allows valid transitions from DUE", () => {
		expect(canTransitionCheckStatus("DUE", "PAID")).toBe(true);
		expect(canTransitionCheckStatus("DUE", "RECEIVED")).toBe(true);
		expect(canTransitionCheckStatus("DUE", "BOUNCED")).toBe(true);
	});

	it("allows BOUNCED to return to PAID", () => {
		expect(canTransitionCheckStatus("BOUNCED", "PAID")).toBe(true);
	});

	it("rejects invalid transitions from PAID", () => {
		expect(canTransitionCheckStatus("PAID", "PENDING")).toBe(false);
		expect(canTransitionCheckStatus("PAID", "DUE")).toBe(false);
		expect(canTransitionCheckStatus("PAID", "BOUNCED")).toBe(false);
	});

	it("rejects invalid transitions from RECEIVED", () => {
		expect(canTransitionCheckStatus("RECEIVED", "PENDING")).toBe(false);
		expect(canTransitionCheckStatus("RECEIVED", "DUE")).toBe(false);
	});

	it("rejects invalid transitions from CANCELLED", () => {
		expect(canTransitionCheckStatus("CANCELLED", "DUE")).toBe(false);
		expect(canTransitionCheckStatus("CANCELLED", "PAID")).toBe(false);
	});

	it("allows keeping the same status", () => {
		expect(canTransitionCheckStatus("PENDING", "PENDING")).toBe(true);
		expect(canTransitionCheckStatus("DUE", "DUE")).toBe(true);
		expect(canTransitionCheckStatus("PAID", "PAID")).toBe(true);
	});

	it("returns allowed transitions for a status", () => {
		expect(getAllowedCheckStatusTransitions("PENDING")).toEqual([
			"DUE",
			"PAID",
			"RECEIVED",
			"CANCELLED",
		]);

		expect(getAllowedCheckStatusTransitions("DUE")).toEqual([
			"PAID",
			"RECEIVED",
			"BOUNCED",
		]);

		expect(getAllowedCheckStatusTransitions("PAID")).toEqual([]);
	});
});