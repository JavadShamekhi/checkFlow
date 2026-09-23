"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

type FinancialChartProps = {
	receivableAmount: string;
	payableAmount: string;
};

function formatAmount(value: number) {
	return new Intl.NumberFormat("fa-IR").format(value);
}

export default function FinancialChart({
	                                       receivableAmount,
	                                       payableAmount,
                                       }: FinancialChartProps) {
	const data = [
		{
			name: "دریافتی",
			amount: Number(receivableAmount),
		},
		{
			name: "پرداختی",
			amount: Number(payableAmount),
		},
	];

	return (
			<div className="rounded-xl border bg-card p-6">
				<div>
					<h2 className="text-lg font-semibold">
						وضعیت مالی چک‌ها
					</h2>

					<p className="mt-1 text-sm text-muted-foreground">
						مقایسه مجموع مبالغ چک‌های دریافتی و پرداختی
					</p>
				</div>

				<div className="mt-6 h-[300px]">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
								data={data}
								margin={{
									top: 10,
									right: 10,
									left: 10,
									bottom: 10,
								}}
						>
							<CartesianGrid strokeDasharray="3 3"/>

							<XAxis dataKey="name"/>

							<YAxis
									tickFormatter={(value) =>
											formatAmount(value)
									}
							/>

							<Tooltip
									formatter={(value) => [
										`${formatAmount(Number(value))} تومان`,
										"مبلغ",
									]}
							/>

							<Bar
									dataKey="amount"
									radius={[8, 8, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
	);
}