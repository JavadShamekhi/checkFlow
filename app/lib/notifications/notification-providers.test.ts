import {describe, expect, it, vi} from "vitest";

vi.mock("@/app/lib/prisma", () => ({
	prisma: {
		checkReminder: {
			findUnique: vi.fn(),
		},
		companyMember: {
			findMany: vi.fn(),
		},
		notification: {
			createMany: vi.fn(),
		},
	},
}));

import {getNotificationProvider} from "./notification-providers";

describe("notification providers", () => {
	it("returns the in-app provider for IN_APP", () => {
		const provider = getNotificationProvider("IN_APP");

		expect(provider).toBeDefined();
		expect(provider.send).toBeTypeOf("function");
	});

	it("returns an SMS provider for SMS", () => {
		const provider = getNotificationProvider("SMS");

		expect(provider).toBeDefined();
		expect(provider.send).toBeTypeOf("function");
	});

	it("returns an email provider for EMAIL", () => {
		const provider = getNotificationProvider("EMAIL");

		expect(provider).toBeDefined();
		expect(provider.send).toBeTypeOf("function");
	});

	it("SMS provider throws when it is not configured", async () => {
		const provider = getNotificationProvider("SMS");

		await expect(
				provider.send({
					channel: "SMS",
				} as never)
		).rejects.toThrow(
				"SMS notification provider is not configured"
		);
	});

	it("EMAIL provider throws when it is not configured", async () => {
		const provider = getNotificationProvider("EMAIL");

		await expect(
				provider.send({
					channel: "EMAIL",
				} as never)
		).rejects.toThrow(
				"EMAIL notification provider is not configured"
		);
	});

});