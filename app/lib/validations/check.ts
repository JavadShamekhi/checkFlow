import { z } from "zod";

export const createCheckSchema = z.object({
	companyId: z.string().min(1),
	bankAccountId: z.string().optional(),

	type: z.enum(["RECEIVABLE", "PAYABLE"]),

	checkNumber: z.string().min(1),
	amount: z.coerce.number().positive(),

	dueDate: z.coerce.date(),

	issuerName: z.string().optional(),
	recipientName: z.string().optional(),
	description: z.string().optional(),
});

export type CreateCheckInput = z.infer<typeof createCheckSchema>;