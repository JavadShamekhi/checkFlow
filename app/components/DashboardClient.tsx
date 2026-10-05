"use client";

import {useEffect, useState} from "react";
import CheckStatusChart from "@/app/components/CheckStatusChart";
import FinancialChart from "@/app/components/FinancialChart";
import NotificationBell from "@/app/components/NotificationBell";

type DashboardData = {
	summary: {
		totalChecks: number;
		receivableChecks: number;
		payableChecks: number;
		receivableAmount: string;
		payableAmount: string;
		pendingChecks: number;
		dueChecks: number;
		paidChecks: number;
		receivedChecks: number;
		bouncedChecks: number;
		cancelledChecks: number;
	};

	upcomingChecks: DashboardCheck[];

	recentChecks: DashboardCheck[];
};

type DashboardCheck = {
	id: string;
	type: "RECEIVABLE" | "PAYABLE";
	sayadId: string;
	series: string;
	serial: string;
	amount: string;
	dueDate: string;
	status:
			| "PENDING"
			| "DUE"
			| "PAID"
			| "RECEIVED"
			| "BOUNCED"
			| "CANCELLED";

	bank: {
		id: string;
		name: string;
	};

	bankAccount: {
		id: string;
		accountNumber: string | null;
		iban: string | null;
		ownerName: string | null;
	} | null;
};

type DashboardClientProps = {
	companyId: string;
};

function formatAmount(amount: string) {
	return new Intl.NumberFormat("fa-IR").format(Number(amount));
}

function formatDate(date: string) {
	return new Intl.DateTimeFormat("fa-IR", {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(new Date(date));
}

const statusLabels: Record<DashboardCheck["status"], string> = {
	PENDING: "در انتظار",
	DUE: "سررسید",
	PAID: "پرداخت شده",
	RECEIVED: "دریافت شده",
	BOUNCED: "برگشتی",
	CANCELLED: "لغو شده",
};

export default function DashboardClient({
	                                        companyId,
                                        }: DashboardClientProps) {
	const [data, setData] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		async function fetchDashboard() {
			try {
				setLoading(true);
				setError("");

				const response = await fetch(
						`/api/companies/${companyId}/dashboard`
				);

				const result = await response.json();

				if (!response.ok) {
					throw new Error(
							result.message || "Failed to fetch dashboard"
					);
				}

				setData(result);
			} catch (error) {
				console.error(error);
				setError("خطا در دریافت اطلاعات داشبورد");
			} finally {
				setLoading(false);
			}
		}

		fetchDashboard();
	}, [companyId]);

	if (loading) {
		return (
				<div
						dir="rtl"
						className="flex min-h-[400px] items-center justify-center"
				>
					<div className="text-center">
						<div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#DDD6FE] border-t-[#6D28D9]"/>

						<p className="mt-4 text-sm font-medium text-[#7C6AA8]">
							در حال دریافت اطلاعات...
						</p>
					</div>
				</div>
		);
	}

	if (error || !data) {
		return (
				<div
						dir="rtl"
						className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
				>
					<p className="text-sm font-medium text-red-600">
						{error || "اطلاعات داشبورد در دسترس نیست"}
					</p>
				</div>
		);
	}

	const {summary} = data;

	return (
			<div
					dir="rtl"
					className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 lg:px-8"
			>
				{/* Header */}
				<section className="rounded-2xl bg-[#4C1D95] px-6 py-7 text-white shadow-sm sm:px-8">
					<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="text-sm font-medium text-[#C4B5FD]">
								مدیریت مالی شرکت
							</p>

							<h1 className="mt-1 text-2xl font-bold sm:text-3xl">
								داشبورد
							</h1>

							<p className="mt-2 text-sm text-white/75">
								نمای کلی وضعیت چک‌های شرکت
							</p>
						</div>

						<NotificationBell/>
					</div>
				</section>

				{/* Summary Cards */}
				<section>
					<div className="mb-4">
						<h2 className="text-lg font-bold text-[#2E1065]">
							خلاصه وضعیت
						</h2>

						<p className="mt-1 text-sm text-[#7C6AA8]">
							وضعیت کلی چک‌های ثبت‌شده در شرکت
						</p>
					</div>

					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{/* Total Checks */}
						<div className="rounded-2xl border border-[#DDD6FE] bg-white p-5 shadow-sm">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm font-medium text-[#7C6AA8]">
										کل چک‌ها
									</p>

									<p className="mt-3 text-3xl font-bold text-[#2E1065]">
										{summary.totalChecks.toLocaleString("fa-IR")}
									</p>
								</div>

								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F3FF] text-[#6D28D9]">
									<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.8"
											className="h-5 w-5"
									>
										<rect
												x="3"
												y="5"
												width="18"
												height="14"
												rx="2"
										/>
										<path
												strokeLinecap="round"
												d="M7 9h4M7 13h7"
										/>
									</svg>
								</div>
							</div>
						</div>

						{/* Receivable */}
						<div className="rounded-2xl border border-[#DDD6FE] bg-white p-5 shadow-sm">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm font-medium text-[#7C6AA8]">
										چک‌های دریافتی
									</p>

									<p className="mt-3 text-3xl font-bold text-[#2E1065]">
										{summary.receivableChecks.toLocaleString("fa-IR")}
									</p>

									<p className="mt-2 text-sm font-medium text-[#6D28D9]">
										{formatAmount(summary.receivableAmount)} تومان
									</p>
								</div>

								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F3FF] text-[#6D28D9]">
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
												d="M12 3v18M7 8l5-5 5 5M7 16l5 5 5-5"
										/>
									</svg>
								</div>
							</div>
						</div>

						{/* Payable */}
						<div className="rounded-2xl border border-[#DDD6FE] bg-white p-5 shadow-sm">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm font-medium text-[#7C6AA8]">
										چک‌های پرداختی
									</p>

									<p className="mt-3 text-3xl font-bold text-[#2E1065]">
										{summary.payableChecks.toLocaleString("fa-IR")}
									</p>

									<p className="mt-2 text-sm font-medium text-[#6D28D9]">
										{formatAmount(summary.payableAmount)} تومان
									</p>
								</div>

								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F3FF] text-[#6D28D9]">
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
												d="M12 21V3M7 16l5 5 5-5M7 8l5-5 5 5"
										/>
									</svg>
								</div>
							</div>
						</div>

						{/* Due */}
						<div className="rounded-2xl border border-[#DDD6FE] bg-white p-5 shadow-sm">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm font-medium text-[#7C6AA8]">
										سررسید شده
									</p>

									<p className="mt-3 text-3xl font-bold text-[#2E1065]">
										{summary.dueChecks.toLocaleString("fa-IR")}
									</p>

									<p className="mt-2 text-sm text-[#8B7AAE]">
										چک نیازمند پیگیری
									</p>
								</div>

								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F3FF] text-[#6D28D9]">
									<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.8"
											className="h-5 w-5"
									>
										<circle cx="12" cy="12" r="9"/>
										<path
												strokeLinecap="round"
												d="M12 7v5l3 2"
										/>
									</svg>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Charts */}
				<section>
					<div className="mb-4">
						<h2 className="text-lg font-bold text-[#2E1065]">
							تحلیل مالی
						</h2>

						<p className="mt-1 text-sm text-[#7C6AA8]">
							نمای کلی مبالغ و وضعیت چک‌ها
						</p>
					</div>

					<div className="grid gap-6 lg:grid-cols-2">
						<div className="rounded-2xl border border-[#DDD6FE] bg-white p-5 shadow-sm sm:p-6">
							<FinancialChart
									receivableAmount={summary.receivableAmount}
									payableAmount={summary.payableAmount}
							/>
						</div>

						<div className="rounded-2xl border border-[#DDD6FE] bg-white p-5 shadow-sm sm:p-6">
							<CheckStatusChart
									pending={summary.pendingChecks}
									due={summary.dueChecks}
									paid={summary.paidChecks}
									received={summary.receivedChecks}
									bounced={summary.bouncedChecks}
									cancelled={summary.cancelledChecks}
							/>
						</div>
					</div>
				</section>

				{/* Upcoming Checks */}
				<section className="overflow-hidden rounded-2xl border border-[#DDD6FE] bg-white shadow-sm">
					<div className="border-b border-[#E9D5FF] p-6">
						<h2 className="text-lg font-bold text-[#2E1065]">
							چک‌های نزدیک سررسید
						</h2>

						<p className="mt-1 text-sm text-[#7C6AA8]">
							نزدیک‌ترین چک‌هایی که هنوز تسویه نشده‌اند
						</p>
					</div>

					{data.upcomingChecks.length === 0 ? (
							<div className="p-10 text-center">
								<div
										className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F3FF] text-[#6D28D9]">
									<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.8"
											className="h-6 w-6"
									>
										<circle cx="12" cy="12" r="9"/>
										<path
												strokeLinecap="round"
												d="M12 7v5l3 2"
										/>
									</svg>
								</div>

								<p className="mt-4 text-sm font-medium text-[#7C6AA8]">
									چکی برای سررسیدهای آینده وجود ندارد.
								</p>
							</div>
					) : (
							<div className="divide-y divide-[#E9D5FF]">
								{data.upcomingChecks.map((check) => (
										<div
												key={check.id}
												className="flex flex-col gap-4 p-5 transition-colors hover:bg-[#F5F3FF] md:flex-row md:items-center md:justify-between"
										>
											<div className="min-w-0">
												<div className="flex items-center gap-3">
													<div
															className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F5F3FF] text-[#6D28D9]">
														<svg
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="1.8"
																className="h-5 w-5"
														>
															<rect
																	x="3"
																	y="5"
																	width="18"
																	height="14"
																	rx="2"
															/>
															<path
																	strokeLinecap="round"
																	d="M7 9h4M7 13h7"
															/>
														</svg>
													</div>

													<div className="min-w-0">
														<p className="truncate font-semibold text-[#2E1065]">
															{check.bank.name}
														</p>

														<p className="mt-1 truncate font-mono text-xs text-[#8B7AAE]">
															Sayad: {check.sayadId}
														</p>
													</div>
												</div>
											</div>

											<div className="md:text-center">
												<p className="text-sm font-medium text-[#5B21B6]">
													{formatDate(check.dueDate)}
												</p>

												<p className="mt-1 font-bold text-[#2E1065]">
													{formatAmount(check.amount)} تومان
												</p>
											</div>

											<div>
                  <span
		                  className="inline-flex rounded-full bg-[#F5F3FF] px-3 py-1.5 text-xs font-semibold text-[#6D28D9]">
                    {statusLabels[check.status]}
                  </span>
											</div>
										</div>
								))}
							</div>
					)}
				</section>

				{/* Recent Checks */}
				<section className="overflow-hidden rounded-2xl border border-[#DDD6FE] bg-white shadow-sm">
					<div className="border-b border-[#E9D5FF] p-6">
						<h2 className="text-lg font-bold text-[#2E1065]">
							آخرین چک‌ها
						</h2>

						<p className="mt-1 text-sm text-[#7C6AA8]">
							آخرین چک‌های ثبت‌شده در شرکت
						</p>
					</div>

					{data.recentChecks.length === 0 ? (
							<div className="p-10 text-center">
								<p className="text-sm font-medium text-[#7C6AA8]">
									هنوز چکی ثبت نشده است.
								</p>
							</div>
					) : (
							<div className="divide-y divide-[#E9D5FF]">
								{data.recentChecks.map((check) => (
										<div
												key={check.id}
												className="flex flex-col gap-4 p-5 transition-colors hover:bg-[#F5F3FF] md:flex-row md:items-center md:justify-between"
										>
											<div className="min-w-0">
												<div className="flex items-center gap-3">
													<div
															className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F5F3FF] text-[#6D28D9]">
														<svg
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="1.8"
																className="h-5 w-5"
														>
															<rect
																	x="3"
																	y="5"
																	width="18"
																	height="14"
																	rx="2"
															/>
															<path
																	strokeLinecap="round"
																	d="M7 9h4M7 13h7"
															/>
														</svg>
													</div>

													<div className="min-w-0">
														<p className="truncate font-semibold text-[#2E1065]">
															{check.bank.name}
														</p>

														<p className="mt-1 truncate font-mono text-xs text-[#8B7AAE]">
															Sayad: {check.sayadId}
														</p>
													</div>
												</div>
											</div>

											<div>
												<p className="font-bold text-[#2E1065]">
													{formatAmount(check.amount)} تومان
												</p>

												<p className="mt-1 text-sm text-[#8B7AAE]">
													سررسید: {formatDate(check.dueDate)}
												</p>
											</div>

											<div>
                  <span
		                  className="inline-flex rounded-full bg-[#F5F3FF] px-3 py-1.5 text-xs font-semibold text-[#6D28D9]">
                    {statusLabels[check.status]}
                  </span>
											</div>
										</div>
								))}
							</div>
					)}
				</section>
			</div>
	);
}