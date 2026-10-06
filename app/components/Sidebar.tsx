"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {useState} from "react";

type SidebarProps = {
	companyId: string;
};

type NavItem = {
	label: string;
	href: string;
	icon: React.ReactNode;
};

export default function Sidebar({companyId}: SidebarProps) {
	const pathname = usePathname();
	const [collapsed, setCollapsed] = useState(false);

	const basePath = `/dashboard/company/${companyId}`;

	const navItems: NavItem[] = [
		{
			label: "داشبورد",
			href: basePath,
			icon: (
					<svg
							className="h-5 w-5 shrink-0"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.8"
					>
						<rect x="3" y="3" width="7" height="7" rx="1"/>
						<rect x="14" y="3" width="7" height="7" rx="1"/>
						<rect x="3" y="14" width="7" height="7" rx="1"/>
						<rect x="14" y="14" width="7" height="7" rx="1"/>
					</svg>
			),
		},
		{
			label: "چک‌ها",
			href: `${basePath}/checks`,
			icon: (
					<svg
							className="h-5 w-5 shrink-0"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.8"
					>
						<rect x="3" y="5" width="18" height="14" rx="2"/>
						<path d="M7 9h10M7 13h5"/>
					</svg>
			),
		},
		{
			label: "حساب‌های بانکی",
			href: `${basePath}/bank-accounts`,
			icon: (
					<svg
							className="h-5 w-5 shrink-0"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.8"
					>
						<path d="M3 10h18"/>
						<path d="M5 10v8M9 10v8M15 10v8M19 10v8"/>
						<path d="M3 20h18M4 7l8-4 8 4"/>
					</svg>
			),
		},
		{
			label: "گزارش‌ها",
			href: `${basePath}/reports`,
			icon: (
					<svg
							className="h-5 w-5 shrink-0"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.8"
					>
						<path d="M4 19V5"/>
						<path d="M4 19h17"/>
						<path d="M7 16l4-5 3 2 5-7"/>
					</svg>
			),
		},
		{
			label: "تنظیمات شرکت",
			href: `${basePath}/settings`,
			icon: (
					<svg
							className="h-5 w-5 shrink-0"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.8"
					>
						<circle cx="12" cy="12" r="3"/>
						<path
								d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20h-2.4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L8 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L7.3 8.6 9 6.9l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v2.4h-.1a1.7 1.7 0 0 0-1.6 1Z"/>
					</svg>
			),
		},
	];

	const isActive = (href: string) => {
		if (href === basePath) {
			return pathname === href;
		}

		return pathname.startsWith(href);
	};

	return (
			<aside
					className={`hidden min-h-[calc(100vh-72px)] shrink-0 border-l border-[#DDD6FE] bg-white transition-all duration-300 lg:block ${
							collapsed ? "w-[76px]" : "w-[260px]"
					}`}
			>
				<div className="flex h-full min-h-[calc(100vh-72px)] flex-col">
					{/* Header */}
					<div
							className={`flex items-center border-b border-[#E9D5FF] px-4 py-4 ${
									collapsed ? "justify-center" : "justify-between"
							}`}
					>
						{!collapsed && (
								<div className="min-w-0">
									<p className="truncate text-sm font-bold text-[#2E1065]">
										مدیریت شرکت
									</p>
									<p className="mt-1 text-xs text-[#8B7AAE]">
										پنل مدیریت
									</p>
								</div>
						)}

						<button
								type="button"
								onClick={() => setCollapsed((current) => !current)}
								aria-label={
									collapsed
											? "باز کردن منوی کناری"
											: "بستن منوی کناری"
								}
								title={
									collapsed
											? "باز کردن منو"
											: "بستن منو"
								}
								className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DDD6FE] bg-[#F5F3FF] text-[#5B21B6] transition hover:bg-[#EDE9FE] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] cursor-pointer"
						>
							<svg
									className={`h-5 w-5 transition-transform duration-300 ${
											collapsed ? "rotate-180" : ""
									}`}
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
							>
								<path d="m15 18-6-6 6-6"/>
							</svg>
						</button>
					</div>

					{/* Navigation */}
					<nav className="flex-1 space-y-2 p-3">
						{navItems.map((item) => {
							const active = isActive(item.href);

							return (
									<Link
											key={item.href}
											href={item.href}
											title={collapsed ? item.label : undefined}
											className={`flex h-11 items-center rounded-xl transition ${
													collapsed
															? "justify-center px-0"
															: "gap-3 px-3"
											} ${
													active
															? "bg-[#4C1D95] text-white"
															: "text-[#5B21B6] hover:bg-[#F5F3FF] hover:text-[#4C1D95]"
											}`}
									>
										{item.icon}

										{!collapsed && (
												<span className="truncate text-sm font-medium">
                    {item.label}
                  </span>
										)}
									</Link>
							);
						})}
					</nav>

					{/* Bottom */}
					<div className="border-t border-[#E9D5FF] p-3">
						<Link
								href="/dashboard"
								title={collapsed ? "لیست شرکت‌ها" : undefined}
								className={`flex h-11 items-center rounded-xl text-[#7C6AA8] transition hover:bg-[#F5F3FF] hover:text-[#4C1D95] ${
										collapsed
												? "justify-center px-0"
												: "gap-3 px-3"
								}`}
						>
							<svg
									className="h-5 w-5 shrink-0"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.8"
							>
								<path d="M15 18l-6-6 6-6"/>
							</svg>

							{!collapsed && (
									<span className="text-sm font-medium">
                لیست شرکت‌ها
              </span>
							)}
						</Link>
					</div>
				</div>
			</aside>
	);
}