"use client";

import {
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from "recharts";

type CheckStatusChartProps = {
	pending: number;
	due: number;
	paid: number;
	received: number;
	bounced: number;
	cancelled: number;
};

const statusConfig = [
	{
		key: "pending",
		label: "در انتظار",
	},
	{
		key: "due",
		label: "سررسید",
	},
	{
		key: "paid",
		label: "پرداخت شده",
	},
	{
		key: "received",
		label: "دریافت شده",
	},
	{
		key: "bounced",
		label: "برگشتی",
	},
	{
		key: "cancelled",
		label: "لغو شده",
	},
] as const;

const chartColors = [
	"#3b82f6",
	"#f59e0b",
	"#22c55e",
	"#14b8a6",
	"#ef4444",
	"#6b7280",
];

export default function CheckStatusChart({
	                                         pending,
	                                         due,
	                                         paid,
	                                         received,
	                                         bounced,
	                                         cancelled,
                                         }: CheckStatusChartProps) {
	const values = {
		pending,
		due,
		paid,
		received,
		bounced,
		cancelled,
	};

	const data = statusConfig
			.map((status) => ({
				name: status.label,
				value: values[status.key],
			}))
			.filter((item) => item.value > 0);

	const total = data.reduce(
			(sum, item) => sum + item.value,
			0
	);

	return (
			<div className="rounded-xl border bg-card p-6">
				<div>
					<h2 className="text-lg font-semibold">
						وضعیت چک‌ها
					</h2>

					<p className="mt-1 text-sm text-muted-foreground">
						توزیع چک‌های شرکت بر اساس وضعیت فعلی
					</p>
				</div>

				{total === 0 ? (
						<div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
							اطلاعاتی برای نمایش وجود ندارد.
						</div>
				) : (
						<div className="mt-6 grid items-center gap-6 md:grid-cols-2">
							<div className="h-[280px]">
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
												data={data}
												dataKey="value"
												nameKey="name"
												cx="50%"
												cy="50%"
												innerRadius={70}
												outerRadius={105}
												paddingAngle={2}
										>
											{data.map((entry, index) => (
													<Cell
															key={entry.name}
															fill={
																chartColors[index % chartColors.length]
															}
													/>
											))}
										</Pie>

										<Tooltip
												formatter={(value) => [
													value,
													"تعداد",
												]}
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>

							<div className="space-y-3">
								{data.map((item, index) => (
										<div
												key={item.name}
												className="flex items-center justify-between"
										>
											<div className="flex items-center gap-2">
                  <span
		                  className="h-3 w-3 rounded-full"
		                  style={{
			                  backgroundColor:
					                  chartColors[
					                  index % chartColors.length
							                  ],
		                  }}
                  />

												<span className="text-sm">
                    {item.name}
                  </span>
											</div>

											<span className="text-sm font-semibold">
                  {item.value}
                </span>
										</div>
								))}
							</div>
						</div>
				)}
			</div>
	);
}