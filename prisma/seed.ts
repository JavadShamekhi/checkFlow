import "dotenv/config";
import bcrypt from "bcryptjs";

import { prisma } from "@/app/lib/prisma";
import {
	CheckStatus,
	CheckType,
	MemberRole,
	PartyType,
} from "@/app/generated/prisma/client";

// --------------------------------------------------
// Banks
// --------------------------------------------------

const banks = [
	"بانک ملی ایران",
	"بانک سپه",
	"بانک ملت",
	"بانک تجارت",
	"بانک صادرات ایران",
	"بانک رفاه کارگران",
	"بانک مسکن",
	"بانک کشاورزی",
	"بانک صنعت و معدن",
	"بانک توسعه صادرات ایران",
	"پست بانک ایران",
	"بانک توسعه تعاون",
	"بانک پارسیان",
	"بانک پاسارگاد",
	"بانک سامان",
	"بانک اقتصاد نوین",
	"بانک کارآفرین",
	"بانک سینا",
	"بانک شهر",
	"بانک دی",
	"بانک گردشگری",
	"بانک خاورمیانه",
	"بانک ایران زمین",
	"بانک قرض‌الحسنه مهر ایران",
	"بانک قرض‌الحسنه رسالت",
];

// --------------------------------------------------
// Users
// --------------------------------------------------

const users = [
	{
		email: "javad@checkflow.local",
		name: "جواد شمس",
		phone: "09120000001",
	},
	{
		email: "ali@checkflow.local",
		name: "علی رضایی",
		phone: "09120000002",
	},
	{
		email: "sara@checkflow.local",
		name: "سارا محمدی",
		phone: "09120000003",
	},
	{
		email: "mohammad@checkflow.local",
		name: "محمد احمدی",
		phone: "09120000004",
	},
	{
		email: "zahra@checkflow.local",
		name: "زهرا کریمی",
		phone: "09120000005",
	},
	{
		email: "reza@checkflow.local",
		name: "رضا حسینی",
		phone: "09120000006",
	},
	{
		email: "maryam@checkflow.local",
		name: "مریم اکبری",
		phone: "09120000007",
	},
	{
		email: "hossein@checkflow.local",
		name: "حسین مرادی",
		phone: "09120000008",
	},
];

// همه کاربران Seed با این پسورد وارد می‌شوند
const seedPassword = "Test123456!";

// --------------------------------------------------
// Companies
// --------------------------------------------------

const companies = [
	{
		name: "فروشگاه زنجیره‌ای پارس",
	},
	{
		name: "بازرگانی آریا",
	},
	{
		name: "شرکت توسعه تجارت نوین",
	},
	{
		name: "فروشگاه مرکزی ایرانیان",
	},
];

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function randomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(items: T[]): T {
	return items[randomInt(0, items.length - 1)];
}

function createDateWithOffset(days: number) {
	const date = new Date();

	date.setHours(12, 0, 0, 0);
	date.setDate(date.getDate() + days);

	return date;
}

function createSayadId(index: number, companyIndex: number) {
	return `${companyIndex + 1}${String(index).padStart(15, "0")}`;
}

function createSerial(index: number) {
	return String(100000 + index);
}

function createSeries(companyIndex: number) {
	return String(100 + companyIndex);
}

// --------------------------------------------------
// Check status distribution
// --------------------------------------------------

const checkStatuses: CheckStatus[] = [
	CheckStatus.PENDING,
	CheckStatus.PENDING,
	CheckStatus.PENDING,
	CheckStatus.DUE,
	CheckStatus.PAID,
	CheckStatus.RECEIVED,
	CheckStatus.BOUNCED,
	CheckStatus.CANCELLED,
];

// --------------------------------------------------
// Main
// --------------------------------------------------

async function main() {
	console.log("Starting CheckFlow seed...");

	// ------------------------------------------------
	// Reset development data
	// ------------------------------------------------

	console.log("Cleaning existing development data...");

	await prisma.checkReminder.deleteMany();
	await prisma.check.deleteMany();
	await prisma.bankAccount.deleteMany();
	await prisma.companyMember.deleteMany();
	await prisma.company.deleteMany();
	await prisma.user.deleteMany();
	await prisma.bank.deleteMany();

	// ------------------------------------------------
	// Password
	// ------------------------------------------------

	const passwordHash = await bcrypt.hash(seedPassword, 10);

	// ------------------------------------------------
	// Create users
	// ------------------------------------------------

	console.log("Creating users...");

	const createdUsers = [];

	for (const user of users) {
		const createdUser = await prisma.user.create({
			data: {
				email: user.email,
				name: user.name,
				phone: user.phone,
				passwordHash,
			},
		});

		createdUsers.push(createdUser);
	}

	console.log(`Created ${createdUsers.length} users.`);

	// ------------------------------------------------
	// Create companies
	// ------------------------------------------------

	console.log("Creating companies...");

	const createdCompanies = [];

	for (const company of companies) {
		const createdCompany = await prisma.company.create({
			data: {
				name: company.name,
			},
		});

		createdCompanies.push(createdCompany);
	}

	console.log(
			`Created ${createdCompanies.length} companies.`
	);

	// ------------------------------------------------
	// Create banks
	// ------------------------------------------------

	console.log("Creating banks...");

	const createdBanks = [];

	for (const name of banks) {
		const bank = await prisma.bank.create({
			data: {
				name,
			},
		});

		createdBanks.push(bank);
	}

	console.log(`Created ${createdBanks.length} banks.`);

	// ------------------------------------------------
	// Company memberships
	// ------------------------------------------------

	console.log("Creating company memberships...");

	const memberships = [
		// Company 1
		{
			companyIndex: 0,
			userIndex: 0,
			role: MemberRole.OWNER,
		},
		{
			companyIndex: 0,
			userIndex: 1,
			role: MemberRole.ADMIN,
		},
		{
			companyIndex: 0,
			userIndex: 2,
			role: MemberRole.ACCOUNTANT,
		},
		{
			companyIndex: 0,
			userIndex: 3,
			role: MemberRole.VIEWER,
		},

		// Company 2
		{
			companyIndex: 1,
			userIndex: 1,
			role: MemberRole.OWNER,
		},
		{
			companyIndex: 1,
			userIndex: 4,
			role: MemberRole.ADMIN,
		},
		{
			companyIndex: 1,
			userIndex: 5,
			role: MemberRole.ACCOUNTANT,
		},

		// Company 3
		{
			companyIndex: 2,
			userIndex: 2,
			role: MemberRole.OWNER,
		},
		{
			companyIndex: 2,
			userIndex: 5,
			role: MemberRole.ADMIN,
		},
		{
			companyIndex: 2,
			userIndex: 6,
			role: MemberRole.ACCOUNTANT,
		},
		{
			companyIndex: 2,
			userIndex: 7,
			role: MemberRole.VIEWER,
		},

		// Company 4
		{
			companyIndex: 3,
			userIndex: 3,
			role: MemberRole.OWNER,
		},
		{
			companyIndex: 3,
			userIndex: 6,
			role: MemberRole.ADMIN,
		},
		{
			companyIndex: 3,
			userIndex: 7,
			role: MemberRole.ACCOUNTANT,
		},
		{
			companyIndex: 3,
			userIndex: 0,
			role: MemberRole.VIEWER,
		},
	];

	for (const membership of memberships) {
		await prisma.companyMember.create({
			data: {
				companyId:
				createdCompanies[membership.companyIndex].id,
				userId:
				createdUsers[membership.userIndex].id,
				role: membership.role,
			},
		});
	}

	console.log(
			`Created ${memberships.length} company memberships.`
	);

	// ------------------------------------------------
	// Create bank accounts
	// ------------------------------------------------

	console.log("Creating bank accounts...");

	const bankAccountsByCompany = [];

	for (
			let companyIndex = 0;
			companyIndex < createdCompanies.length;
			companyIndex++
	) {
		const company = createdCompanies[companyIndex];

		const companyAccounts = [];

		// هر شرکت 4 حساب بانکی
		for (let accountIndex = 0; accountIndex < 4; accountIndex++) {
			const bank =
					createdBanks[
					(companyIndex * 4 + accountIndex) %
					createdBanks.length
							];

			const account = await prisma.bankAccount.create({
				data: {
					companyId: company.id,
					bankId: bank.id,
					accountNumber: `010${companyIndex + 1}${accountIndex + 1}123456789`,
					iban: `IR${String(
							1200000000000000000000000000 +
							companyIndex * 100000 +
							accountIndex
					).slice(0, 24)}`,
					ownerName: company.name,
				},
			});

			companyAccounts.push(account);
		}

		bankAccountsByCompany.push(companyAccounts);
	}

	console.log("Created bank accounts.");

	// ------------------------------------------------
	// Create checks
	// ------------------------------------------------

	console.log("Creating checks...");

	let totalChecks = 0;

	for (
			let companyIndex = 0;
			companyIndex < createdCompanies.length;
			companyIndex++
	) {
		const company = createdCompanies[companyIndex];

		const companyAccounts =
				bankAccountsByCompany[companyIndex];

		const checksToCreate = [];

		// 150 checks per company
		for (let index = 1; index <= 150; index++) {
			const type =
					index % 2 === 0
							? CheckType.PAYABLE
							: CheckType.RECEIVABLE;

			const status =
					checkStatuses[index % checkStatuses.length];

			// Spread dates between -60 and +120 days
			const dueDate = createDateWithOffset(
					randomInt(-60, 120)
			);

			const bank =
					createdBanks[
					(index + companyIndex) %
					createdBanks.length
							];

			// حدود مبلغ:
			// 5 میلیون تا 500 میلیون
			const amount =
					randomInt(5, 500) * 1_000_000;

			// حدود 70% چک‌ها حساب بانکی داشته باشند
			const bankAccount =
					index % 10 < 7
							? randomItem(companyAccounts)
							: null;

			const hasIssuerInfo = index % 3 !== 0;
			const hasRecipientInfo = index % 4 !== 0;

			checksToCreate.push({
				companyId: company.id,

				type,

				sayadId: createSayadId(
						index,
						companyIndex
				),

				series: createSeries(companyIndex),

				serial: createSerial(index),

				bankId: bank.id,

				bankAccountId: bankAccount?.id ?? null,

				amount,

				dueDate,

				status,

				issuerType: hasIssuerInfo
						? index % 2 === 0
								? PartyType.LEGAL_ENTITY
								: PartyType.INDIVIDUAL
						: null,

				issuerName: hasIssuerInfo
						? type === CheckType.RECEIVABLE
								? `صادرکننده ${index}`
								: `مشتری ${index}`
						: null,

				issuerNationalId: hasIssuerInfo
						? `${1000000000 + index}`
						: null,

				recipientType: hasRecipientInfo
						? index % 2 === 0
								? PartyType.LEGAL_ENTITY
								: PartyType.INDIVIDUAL
						: null,

				recipientName: hasRecipientInfo
						? `طرف معامله ${index}`
						: null,

				recipientNationalId: hasRecipientInfo
						? `${2000000000 + index}`
						: null,

				handedOverAt:
						index % 5 === 0
								? createDateWithOffset(
										randomInt(-90, -1)
								)
								: null,

				description:
						index % 6 === 0
								? `چک تستی شماره ${index} برای ${company.name}`
								: null,
			});
		}

		await prisma.check.createMany({
			data: checksToCreate,
		});

		totalChecks += checksToCreate.length;

		console.log(
				`Created 150 checks for: ${company.name}`
		);
	}

	console.log(
			`Created ${totalChecks} checks in total.`
	);

	// ------------------------------------------------
	// Summary
	// ------------------------------------------------

	console.log("");
	console.log("======================================");
	console.log("CheckFlow seed completed successfully");
	console.log("======================================");
	console.log(`Users: ${createdUsers.length}`);
	console.log(`Companies: ${createdCompanies.length}`);
	console.log(`Banks: ${createdBanks.length}`);
	console.log(
			`Memberships: ${memberships.length}`
	);
	console.log("Bank accounts: 16");
	console.log(`Checks: ${totalChecks}`);
	console.log("");
	console.log("Seed login password:");
	console.log(seedPassword);
	console.log("");
	console.log("Users:");

	for (const user of createdUsers) {
		console.log(`- ${user.email}`);
	}
}

main()
		.catch((error) => {
			console.error("Seed failed:");
			console.error(error);
			process.exit(1);
		})
		.finally(async () => {
			await prisma.$disconnect();
		});