"use client";

import {useEffect, useState} from "react";
import CheckStatusChart from "@/app/components/CheckStatusChart";
import FinancialChart from "@/app/components/FinancialChart";

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
				<div className="flex min-h-[400px] items-center justify-center">
					<p className="text-muted-foreground">
						در حال دریافت اطلاعات...
					</p>
				</div>
		);
	}

	if (error || !data) {
		return (
				<div className="rounded-lg border p-6 text-center">
					<p className="text-destructive">
						{error || "اطلاعات داشبورد در دسترس نیست"}
					</p>
				</div>
		);
	}

	const {summary} = data;

	return (
			<div className="space-y-8">
				{/* Header */}
				<div>
					<h1 className="text-2xl font-bold">
						داشبورد
					</h1>

					<p className="mt-1 text-sm text-muted-foreground">
						نمای کلی وضعیت چک‌های شرکت
					</p>
				</div>

				{/* Summary Cards */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<div className="rounded-xl border bg-card p-5">
						<p className="text-sm text-muted-foreground">
							کل چک‌ها
						</p>

						<p className="mt-2 text-3xl font-bold">
							{summary.totalChecks}
						</p>
					</div>

					<div className="rounded-xl border bg-card p-5">
						<p className="text-sm text-muted-foreground">
							چک‌های دریافتی
						</p>

						<p className="mt-2 text-3xl font-bold">
							{summary.receivableChecks}
						</p>

						<p className="mt-1 text-sm text-muted-foreground">
							{formatAmount(summary.receivableAmount)} تومان
						</p>
					</div>

					<div className="rounded-xl border bg-card p-5">
						<p className="text-sm text-muted-foreground">
							چک‌های پرداختی
						</p>

						<p className="mt-2 text-3xl font-bold">
							{summary.payableChecks}
						</p>

						<p className="mt-1 text-sm text-muted-foreground">
							{formatAmount(summary.payableAmount)} تومان
						</p>
					</div>

					<div className="rounded-xl border bg-card p-5">
						<p className="text-sm text-muted-foreground">
							سررسید شده
						</p>

						<p className="mt-2 text-3xl font-bold">
							{summary.dueChecks}
						</p>
					</div>
				</div>

				{/* Financial Overview */}
				<div className="grid gap-6 lg:grid-cols-2">
					<FinancialChart
							receivableAmount={summary.receivableAmount}
							payableAmount={summary.payableAmount}
					/>

					<CheckStatusChart
							pending={summary.pendingChecks}
							due={summary.dueChecks}
							paid={summary.paidChecks}
							received={summary.receivedChecks}
							bounced={summary.bouncedChecks}
							cancelled={summary.cancelledChecks}
					/>
				</div>

				{/* Status Overview */}
				<CheckStatusChart
						pending={summary.pendingChecks}
						due={summary.dueChecks}
						paid={summary.paidChecks}
						received={summary.receivedChecks}
						bounced={summary.bouncedChecks}
						cancelled={summary.cancelledChecks}
				/>

				{/* Upcoming Checks */}
				<div className="rounded-xl border bg-card">
					<div className="border-b p-6">
						<h2 className="text-lg font-semibold">
							چک‌های نزدیک سررسید
						</h2>

						<p className="mt-1 text-sm text-muted-foreground">
							نزدیک‌ترین چک‌هایی که هنوز تسویه نشده‌اند
						</p>
					</div>

					{data.upcomingChecks.length === 0 ? (
							<div className="p-8 text-center text-sm text-muted-foreground">
								چکی برای سررسیدهای آینده وجود ندارد.
							</div>
					) : (
							<div className="divide-y">
								{data.upcomingChecks.map((check) => (
										<div
												key={check.id}
												className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
										>
											<div>
												<p className="font-medium">
													{check.bank.name}
												</p>

												<p className="mt-1 text-sm text-muted-foreground">
													Sayad: {check.sayadId}
												</p>
											</div>

											<div className="text-sm">
												<p>
													{formatDate(check.dueDate)}
												</p>

												<p className="mt-1 font-semibold">
													{formatAmount(check.amount)} تومان
												</p>
											</div>

											<div className="text-sm">
												{statusLabels[check.status]}
											</div>
										</div>
								))}
							</div>
					)}
				</div>

				{/* Recent Checks */}
				<div className="rounded-xl border bg-card">
					<div className="border-b p-6">
						<h2 className="text-lg font-semibold">
							آخرین چک‌ها
						</h2>
					</div>

					{data.recentChecks.length === 0 ? (
							<div className="p-8 text-center text-sm text-muted-foreground">
								هنوز چکی ثبت نشده است.
							</div>
					) : (
							<div className="divide-y">
								{data.recentChecks.map((check) => (
										<div
												key={check.id}
												className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
										>
											<div>
												<p className="font-medium">
													{check.bank.name}
												</p>

												<p className="mt-1 text-sm text-muted-foreground">
													Sayad: {check.sayadId}
												</p>
											</div>

											<div>
												<p className="font-semibold">
													{formatAmount(check.amount)} تومان
												</p>

												<p className="mt-1 text-sm text-muted-foreground">
													سررسید: {formatDate(check.dueDate)}
												</p>
											</div>

											<div className="text-sm">
												{statusLabels[check.status]}
											</div>
										</div>
								))}
							</div>
					)}
				</div>
			</div>
	);
}