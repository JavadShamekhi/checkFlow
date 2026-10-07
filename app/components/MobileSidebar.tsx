"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect} from "react";

type MobileSidebarProps = {
	companyId: string;
	open: boolean;
	onClose: () => void;
};

export default function MobileSidebar({
	                                      companyId,
	                                      open,
	                                      onClose,
                                      }: MobileSidebarProps) {
	const pathname = usePathname();

	const basePath = `/dashboard/company/${companyId}`;

	const navItems = [
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
								d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20h-2.4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L8 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L7.3 8.6 9 6.9l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0-1.6 1Z"/>
					</svg>
			),
		},
	];

	useEffect(() => {
		if (!open) {
			return;
		}

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscape);

		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [open, onClose]);

	useEffect(() => {
		if (!open) {
			return;
		}

		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = originalOverflow;
		};
	}, [open]);

	const isActive = (href: string) => {
		if (href === basePath) {
			return pathname === href;
		}

		return pathname.startsWith(href);
	};

	return (
			<>
				<div
						aria-hidden={!open}
						onClick={onClose}
						className={`fixed inset-0 z-40 bg-[#2E1065]/40 transition-opacity duration-300 lg:hidden ${
								open
										? "pointer-events-auto opacity-100"
										: "pointer-events-none opacity-0"
						}`}
				/>

				<aside
						aria-hidden={!open}
						className={`fixed inset-y-0 right-0 z-50 flex w-[280px] max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 lg:hidden ${
								open
										? "translate-x-0"
										: "translate-x-full"
						}`}
				>
					<div className="flex items-center justify-between border-b border-[#E9D5FF] px-5 py-5">
						<div>
							<p className="text-sm font-bold text-[#2E1065]">
								مدیریت شرکت
							</p>

							<p className="mt-1 text-xs text-[#8B7AAE]">
								پنل مدیریت
							</p>
						</div>

						<button
								type="button"
								onClick={onClose}
								aria-label="بستن منو"
								className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDD6FE] bg-[#F5F3FF] text-[#5B21B6] transition hover:bg-[#EDE9FE] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD]"
						>
							<svg
									className="h-5 w-5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
							>
								<path d="M6 6l12 12M18 6 6 18"/>
							</svg>
						</button>
					</div>

					<nav className="flex-1 space-y-2 overflow-y-auto p-4">
						{navItems.map((item) => {
							const active = isActive(item.href);

							return (
									<Link
											key={item.href}
											href={item.href}
											onClick={onClose}
											className={`flex h-12 items-center gap-3 rounded-xl px-4 transition ${
													active
															? "bg-[#4C1D95] text-white"
															: "text-[#5B21B6] hover:bg-[#F5F3FF] hover:text-[#4C1D95]"
											}`}
									>
										{item.icon}

										<span className="text-sm font-medium">
                  {item.label}
                </span>
									</Link>
							);
						})}
					</nav>

					<div className="border-t border-[#E9D5FF] p-4">
						<Link
								href="/dashboard"
								onClick={onClose}
								className="flex h-12 items-center gap-3 rounded-xl px-4 text-[#7C6AA8] transition hover:bg-[#F5F3FF] hover:text-[#4C1D95]"
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

							<span className="text-sm font-medium">
              لیست شرکت‌ها
            </span>
						</Link>
					</div>
				</aside>
			</>
	);
}