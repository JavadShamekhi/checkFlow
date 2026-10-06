"use client";

import {useState} from "react";
import {signOut} from "next-auth/react";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
	const [open, setOpen] = useState(false);
	const [loggingOut, setLoggingOut] = useState(false);

	async function handleLogout() {
		setLoggingOut(true);

		await signOut({
			callbackUrl: "/login",
		});
	}

	return (
			<header className="sticky top-0 z-40 border-b border-[#DDD6FE] bg-white">
				<div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4C1D95]">
            <span className="text-lg font-bold text-white">
              C
            </span>
						</div>

						<div>
							<p className="text-lg font-bold text-[#4C1D95]">
								CheckFlow
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<NotificationBell/>

						<div className="relative">
							<button
									type="button"
									onClick={() => setOpen((current) => !current)}
									className="flex items-center gap-2 rounded-xl border border-[#DDD6FE] bg-white px-3 py-2 text-sm font-medium text-[#5B21B6] transition hover:bg-[#F5F3FF] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD]"
							>
								<div
										className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F3FF] text-xs font-bold text-[#6D28D9]">
									U
								</div>

								<span className="hidden sm:block">
                حساب کاربری
              </span>

								<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										className={`h-4 w-4 transition-transform ${
												open ? "rotate-180" : ""
										}`}
								>
									<path
											fillRule="evenodd"
											d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
											clipRule="evenodd"
									/>
								</svg>
							</button>

							{open && (
									<div
											className="absolute left-0 top-12 w-52 overflow-hidden rounded-xl border border-[#DDD6FE] bg-white p-2 shadow-lg">
										<div className="border-b border-[#E9D5FF] px-3 py-3">
											<p className="text-sm font-semibold text-[#2E1065]">
												حساب کاربری
											</p>

											<p className="mt-1 text-xs text-[#8B7AAE]">
												مدیریت حساب و خروج
											</p>
										</div>

										<button
												type="button"
												onClick={handleLogout}
												disabled={loggingOut}
												className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-right text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
										>
											<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="1.8"
													className="h-4 w-4"
											>
												<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
												/>
												<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="m10 17 5-5-5-5"
												/>
												<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M15 12H3"
												/>
											</svg>

											{loggingOut ? "در حال خروج..." : "خروج از حساب"}
										</button>
									</div>
							)}
						</div>
					</div>
				</div>
			</header>
	);
}