"use client";

import { useEffect, useState } from "react";

type Check = {
	id: string;
	type: "RECEIVABLE" | "PAYABLE";
	sayadId: string;
	series: string;
	serial: string;
	amount: string;
	dueDate: string;
	status: string;
	bank: {
		id: string;
		name: string;
	};
	bankAccount: {
		id: string;
		accountNumber: string | null;
		iban: string | null;
	} | null;
};

type CheckListProps = {
	companyId: string;
	refreshKey: number;
};

export default function CheckList({
	                                  companyId,
	                                  refreshKey,
                                  }: CheckListProps) {
	const [checks, setChecks] = useState<Check[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		async function fetchChecks() {
			try {
				setLoading(true);
				setError("");

				const response = await fetch(
						`/api/companies/${companyId}/checks`
				);

				const data = await response.json();

				if (!response.ok) {
					throw new Error(
							data.message || "Failed to fetch checks"
					);
				}

				setChecks(data.checks);
			} catch (error) {
				console.error(error);
				setError("خطا در دریافت چک‌ها");
			} finally {
				setLoading(false);
			}
		}

		fetchChecks();
	}, [companyId, refreshKey]);

	if (loading) {
		return <p>در حال دریافت چک‌ها...</p>;
	}

	if (error) {
		return <p className="text-red-500">{error}</p>;
	}

	if (checks.length === 0) {
		return (
				<div className="rounded-lg border p-6 text-center">
					<p className="text-muted-foreground">
						هنوز چکی ثبت نشده است.
					</p>
				</div>
		);
	}

	return (
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">
					چک‌های ثبت‌شده
				</h2>

				<div className="overflow-x-auto rounded-lg border">
					<table className="w-full text-sm">
						<thead>
						<tr className="border-b bg-muted/50">
							<th className="p-3 text-right">نوع</th>
							<th className="p-3 text-right">Sayad ID</th>
							<th className="p-3 text-right">سری / سریال</th>
							<th className="p-3 text-right">بانک</th>
							<th className="p-3 text-right">مبلغ</th>
							<th className="p-3 text-right">سررسید</th>
							<th className="p-3 text-right">وضعیت</th>
						</tr>
						</thead>

						<tbody>
						{checks.map((check) => (
								<tr
										key={check.id}
										className="border-b last:border-b-0"
								>
									<td className="p-3">
										{check.type === "RECEIVABLE"
												? "دریافتی"
												: "پرداختی"}
									</td>

									<td className="p-3 font-mono">
										{check.sayadId}
									</td>

									<td className="p-3">
										{check.series} / {check.serial}
									</td>

									<td className="p-3">
										{check.bank.name}
									</td>

									<td className="p-3">
										{Number(check.amount).toLocaleString("fa-IR")}
									</td>

									<td className="p-3">
										{new Date(check.dueDate).toLocaleDateString(
												"fa-IR"
										)}
									</td>

									<td className="p-3">
										{check.status}
									</td>
								</tr>
						))}
						</tbody>
					</table>
				</div>
			</div>
	);
}