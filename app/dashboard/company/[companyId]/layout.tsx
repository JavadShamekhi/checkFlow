"use client";

import {use, useState} from "react";
import Sidebar from "@/app/components/Sidebar";
import MobileSidebar from "@/app/components/MobileSidebar";

type CompanyLayoutProps = {
	children: React.ReactNode;
	params: Promise<{
		companyId: string;
	}>;
};

export default function CompanyLayout({
	                                      children,
	                                      params,
                                      }: CompanyLayoutProps) {
	const [mobileSidebarOpen, setMobileSidebarOpen] =
			useState(false);

	const {companyId} = use(params);

	return (
			<div
					dir="rtl"
					className="flex min-h-[calc(100vh-72px)] bg-[#F5F3FF]"
			>
				<Sidebar companyId={companyId}/>

				<MobileSidebar
						companyId={companyId}
						open={mobileSidebarOpen}
						onClose={() => setMobileSidebarOpen(false)}
				/>

				<main className="min-w-0 flex-1">
					<div className="border-b border-[#E9D5FF] bg-white px-4 py-3 lg:hidden">
						<button
								type="button"
								onClick={() => setMobileSidebarOpen(true)}
								aria-label="باز کردن منوی شرکت"
								className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#DDD6FE] bg-[#F5F3FF] text-[#5B21B6] transition hover:bg-[#EDE9FE] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD]"
						>
							<svg
									className="h-5 w-5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
							>
								<path d="M4 6h16M4 12h16M4 18h16"/>
							</svg>
						</button>
					</div>

					{children}
				</main>
			</div>
	);
}