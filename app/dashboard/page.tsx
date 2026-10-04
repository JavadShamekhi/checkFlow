import {auth} from "@/app/lib/auth";
import {redirect} from "next/navigation";
import CreateCompanyForm from "@/app/components/CreateCompanyForm";
import CompanyList from "@/app/components/CompanyList";

export default async function DashboardPage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/login");
	}

	return (
			<main
					dir="rtl"
					className="min-h-screen bg-[#F5F3FF] px-4 py-8 sm:px-6 lg:px-10"
			>
				<div className="mx-auto w-full max-w-[1400px] space-y-8">
					{/* Header */}
					<section className="rounded-2xl bg-[#4C1D95] px-6 py-8 text-white shadow-sm sm:px-8">
						<div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p className="mb-2 text-sm font-medium text-[#C4B5FD]">
									پنل مدیریت CheckFlow
								</p>

								<h1 className="text-2xl font-bold sm:text-3xl">
									داشبورد
								</h1>

								<p className="mt-3 text-sm text-white/80 sm:text-base">
									خوش آمدید،{" "}
									<span className="font-semibold text-white">
                  {session.user.name ?? session.user.email}
                </span>
								</p>
							</div>

							<div
									className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#6D28D9] text-xl font-bold text-white">
								CF
							</div>
						</div>
					</section>

					{/* Create Company */}
					<section
							dir="rtl"
							className="rounded-2xl border border-[#DDD6FE] bg-white p-5 shadow-sm sm:p-7"
					>
						<div className="mb-6">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F3FF] text-[#6D28D9]">
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
												d="M12 5v14M5 12h14"
										/>
									</svg>
								</div>

								<div>
									<h2 className="text-xl font-bold text-[#2E1065]">
										ایجاد شرکت جدید
									</h2>

									<p className="mt-1 text-sm text-[#7C6AA8]">
										یک شرکت جدید برای مدیریت چک‌ها و حساب‌های بانکی ایجاد کنید.
									</p>
								</div>
							</div>
						</div>

						<CreateCompanyForm/>
					</section>

					{/* Companies */}
					<section className="rounded-2xl border border-[#DDD6FE] bg-white p-5 shadow-sm sm:p-7">
						<div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h2 className="text-xl font-bold text-[#2E1065]">
									شرکت‌های من
								</h2>

								<p className="mt-1 text-sm text-[#7C6AA8]">
									شرکت‌های ثبت‌شده و قابل مدیریت را مشاهده کنید.
								</p>
							</div>

							<div className="rounded-full bg-[#F5F3FF] px-4 py-2 text-sm font-medium text-[#6D28D9]">
								مدیریت شرکت‌ها
							</div>
						</div>

						<CompanyList/>
					</section>
				</div>
			</main>
	);
}