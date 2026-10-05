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
			<div dir="rtl">
				<div>
					<h2 className="text-lg font-bold text-[#2E1065]">
						وضعیت مالی چک‌ها
					</h2>

					<p className="mt-1 text-sm text-[#7C6AA8]">
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
							<CartesianGrid
									stroke="#E9D5FF"
									strokeDasharray="3 3"
							/>

							<XAxis
									dataKey="name"
									tick={{
										fill: "#7C6AA8",
										fontSize: 12,
									}}
									axisLine={{
										stroke: "#DDD6FE",
									}}
									tickLine={false}
							/>

							<YAxis
									tickFormatter={(value) =>
											formatAmount(value)
									}
									tick={{
										fill: "#8B7AAE",
										fontSize: 11,
									}}
									axisLine={false}
									tickLine={false}
							/>

							<Tooltip
									contentStyle={{
										borderRadius: "12px",
										border: "1px solid #DDD6FE",
										backgroundColor: "#FFFFFF",
										color: "#2E1065",
									}}
									formatter={(value) => [
										`${formatAmount(Number(value))} تومان`,
										"مبلغ",
									]}
							/>

							<Bar
									dataKey="amount"
									fill="#6D28D9"
									radius={[8, 8, 0, 0]}
									maxBarSize={70}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
	);
}