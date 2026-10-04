import {auth} from "@/app/lib/auth";
import {prisma} from "@/app/lib/prisma";
import Link from "next/link";

export default async function CompanyList() {
	const session = await auth();

	if (!session?.user?.id) {
		return null;
	}

	const memberships = await prisma.companyMember.findMany({
		where: {
			userId: session.user.id,
		},
		include: {
			company: true,
		},
		orderBy: {
			createdAt: "asc",
		},
	});

	if (memberships.length === 0) {
		return (
				<div className="rounded-2xl border border-[#DDD6FE] bg-[#F5F3FF] p-8 text-center">
					<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E9D5FF] text-[#6D28D9]">
						<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.8"
								className="h-7 w-7"
						>
							<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 9h.01M15 9h.01M9 12h.01M15 12h.01"
							/>
						</svg>
					</div>

					<h3 className="mt-4 text-lg font-bold text-[#2E1065]">
						هنوز شرکتی ثبت نشده است
					</h3>

					<p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7C6AA8]">
						برای شروع مدیریت چک‌ها، حساب‌های بانکی و اطلاعات مالی،
						ابتدا یک شرکت ایجاد کنید.
					</p>
				</div>
		);
	}

	return (
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{memberships.map((membership) => (
						<Link
								key={membership.id}
								href={`/dashboard/company/${membership.company.id}`}
								className="group rounded-2xl border border-[#DDD6FE] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C4B5FD] hover:bg-[#F5F3FF] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:ring-offset-2"
						>
							<div className="flex items-start justify-between gap-4">
								<div className="flex min-w-0 items-center gap-3">
									<div
											className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4C1D95] text-white transition-colors group-hover:bg-[#6D28D9]">
										<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="1.8"
												className="h-5 w-5"
										>
											<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 9h.01M15 9h.01M9 12h.01M15 12h.01"
											/>
										</svg>
									</div>

									<div className="min-w-0">
										<p className="truncate font-bold text-[#2E1065]">
											{membership.company.name}
										</p>

										<p className="mt-1 text-xs text-[#8B7AAE]">
											شرکت ثبت‌شده در CheckFlow
										</p>
									</div>
								</div>

								<span
										className="shrink-0 text-[#C4B5FD] transition-transform duration-200 group-hover:translate-x-[-3px]">
              ←
            </span>
							</div>

							<div className="mt-5 border-t border-[#E9D5FF] pt-4">
            <span className="inline-flex rounded-full bg-[#F5F3FF] px-3 py-1 text-xs font-medium text-[#6D28D9]">
              نقش:{" "}
	            {membership.role === "OWNER"
			            ? "مالک"
			            : membership.role === "ADMIN"
					            ? "مدیر"
					            : membership.role === "ACCOUNTANT"
							            ? "حسابدار"
							            : "مشاهده‌گر"}
            </span>
							</div>
						</Link>
				))}
			</div>
	);
}