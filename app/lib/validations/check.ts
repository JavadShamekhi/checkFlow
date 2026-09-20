import {z} from "zod";

export const createCheckSchema = z.object({
	type: z.enum(["RECEIVABLE", "PAYABLE"]),

	// Check identity
	sayadId: z
			.string()
			.trim()
			.regex(/^\d{16}$/, "Sayad ID must be exactly 16 digits"),

	series: z
			.string()
			.trim()
			.min(1, "Series is required")
			.max(50),

	serial: z
			.string()
			.trim()
			.min(1, "Serial is required")
			.max(50),

	// Bank
	bankId: z
			.string()
			.trim()
			.min(1, "Bank is required"),

	bankAccountId: z
			.string()
			.trim()
			.optional(),

	// Financial information
	amount: z
			.string()
			.trim()
			.min(1, "Amount is required")
			.refine(
					(value) => {
						const amount = Number(value);
						return Number.isFinite(amount) && amount > 0;
					},
					{
						message: "Amount must be greater than zero",
					}
			),

	dueDate: z
			.string()
			.min(1, "Due date is required")
			.refine(
					(value) => !Number.isNaN(new Date(value).getTime()),
					{
						message: "Invalid due date",
					}
			),

	// Issuer
	issuerType: z
			.enum(["INDIVIDUAL", "LEGAL_ENTITY"])
			.optional(),

	issuerName: z
			.string()
			.trim()
			.max(200)
			.optional(),

	issuerNationalId: z
			.string()
			.trim()
			.max(50)
			.optional(),

	// Recipient
	recipientType: z
			.enum(["INDIVIDUAL", "LEGAL_ENTITY"])
			.optional(),

	recipientName: z
			.string()
			.trim()
			.max(200)
			.optional(),

	recipientNationalId: z
			.string()
			.trim()
			.max(50)
			.optional(),

	// Business information
	handedOverAt: z
			.string()
			.optional(),

	description: z
			.string()
			.trim()
			.max(1000)
			.optional(),
});

export type CreateCheckInput = z.infer<typeof createCheckSchema>;