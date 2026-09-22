export type Check = {
	id: string;

	type: "RECEIVABLE" | "PAYABLE";

	sayadId: string;
	series: string;
	serial: string;

	bankId: string;

	bankAccountId: string | null;

	amount: string;

	dueDate: string;

	issuerType: "INDIVIDUAL" | "LEGAL_ENTITY" | null;
	issuerName: string | null;
	issuerNationalId: string | null;

	recipientType: "INDIVIDUAL" | "LEGAL_ENTITY" | null;
	recipientName: string | null;
	recipientNationalId: string | null;

	handedOverAt: string | null;

	description: string | null;

	status:
			| "PENDING"
			| "DUE"
			| "PAID"
			| "RECEIVED"
			| "BOUNCED"
			| "CANCELLED";

	createdAt: string;
	updatedAt: string;

	bank: {
		id: string;
		name: string;
	};

	bankAccount: {
		id: string;
		accountNumber: string | null;
		iban: string | null;
		ownerName: string | null;

		bank: {
			id: string;
			name: string;
		};
	} | null;
};