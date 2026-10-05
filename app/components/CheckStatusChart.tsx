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
		color: "#8B5CF6",
	},
	{
		key: "due",
		label: "سررسید",
		color: "#C4B5FD",
	},
	{
		key: "paid",
		label: "پرداخت شده",
		color: "#6D28D9",
	},
	{
		key: "received",
		label: "دریافت شده",
		color: "#A78BFA",
	},
	{
		key: "bounced",
		label: "برگشتی",
		color: "#DC2626",
	},
	{
		key: "cancelled",
		label: "لغو شده",
		color: "#9CA3AF",
	},
] as const;

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
				color: status.color,
			}))
			.filter((item) => item.value > 0);

	const total = data.reduce(
			(sum, item) => sum + item.value,
			0
	);

	return (
			<div dir="rtl">
				<div>
					<h2 className="text-lg font-bold text-[#2E1065]">
						وضعیت چک‌ها
					</h2>

					<p className="mt-1 text-sm text-[#7C6AA8]">
						توزیع چک‌های شرکت بر اساس وضعیت فعلی
					</p>
				</div>

				{total === 0 ? (
						<div className="flex h-[300px] items-center justify-center text-sm text-[#8B7AAE]">
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
												stroke="#FFFFFF"
												strokeWidth={2}
										>
											{data.map((entry) => (
													<Cell
															key={entry.name}
															fill={entry.color}
													/>
											))}
										</Pie>

										<Tooltip
												contentStyle={{
													borderRadius: "12px",
													border: "1px solid #DDD6FE",
													backgroundColor: "#FFFFFF",
													color: "#2E1065",
												}}
												formatter={(value) => [
													value,
													"تعداد",
												]}
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>

							<div className="space-y-3">
								{data.map((item) => (
										<div
												key={item.name}
												className="flex items-center justify-between rounded-xl border border-[#E9D5FF] bg-[#F5F3FF] px-3 py-2.5"
										>
											<div className="flex items-center gap-2.5">
                  <span
		                  className="h-3 w-3 shrink-0 rounded-full"
		                  style={{
			                  backgroundColor: item.color,
		                  }}
                  />

												<span className="text-sm font-medium text-[#5B21B6]">
                    {item.name}
                  </span>
											</div>

											<span className="text-sm font-bold text-[#2E1065]">
                  {item.value.toLocaleString("fa-IR")}
                </span>
										</div>
								))}
							</div>
						</div>
				)}
			</div>
	);
}