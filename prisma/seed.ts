import { prisma } from "@/app/lib/prisma";
import "dotenv/config";

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

async function main() {
	for (const name of banks) {
		const existingBank = await prisma.bank.findFirst({
			where: { name },
		});

		if (!existingBank) {
			await prisma.bank.create({
				data: { name },
			});

			console.log(`Created bank: ${name}`);
		} else {
			console.log(`Already exists: ${name}`);
		}
	}

	console.log("Bank seed completed.");
}

main()
		.catch((error) => {
			console.error(error);
			process.exit(1);
		})
		.finally(async () => {
			await prisma.$disconnect();
		});