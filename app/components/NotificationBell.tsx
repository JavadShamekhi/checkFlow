"use client";

import {useEffect, useRef, useState} from "react";

type NotificationItem = {
	id: string;
	type: "CHECK_REMINDER";
	title: string;
	message: string;
	isRead: boolean;
	readAt: string | null;
	createdAt: string;
	companyId: string;
	check: {
		id: string;
		type: "RECEIVABLE" | "PAYABLE";
		sayadId: string;
		dueDate: string;
	} | null;
};

type NotificationsResponse = {
	notifications: NotificationItem[];
	unreadCount: number;
};

function formatDate(date: string) {
	return new Intl.DateTimeFormat("fa-IR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(date));
}

export default function NotificationBell() {
	const [notifications, setNotifications] = useState<
			NotificationItem[]
	>([]);
	const [unreadCount, setUnreadCount] = useState(0);

	const [loading, setLoading] = useState(true);
	const [loadingList, setLoadingList] = useState(false);
	const [error, setError] = useState("");

	const [isOpen, setIsOpen] = useState(false);

	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		async function fetchNotifications() {
			try {
				setLoading(true);
				setError("");

				const response = await fetch(
						"/api/notifications?limit=50"
				);

				const data: NotificationsResponse & {
					error?: string;
				} = await response.json();

				if (!response.ok) {
					throw new Error(
							data.error || "Failed to fetch notifications"
					);
				}

				setNotifications(data.notifications);
				setUnreadCount(data.unreadCount);
			} catch (error) {
				console.error(error);
				setError("خطا در دریافت اعلان‌ها");
			} finally {
				setLoading(false);
			}
		}

		fetchNotifications();
	}, []);

	useEffect(() => {
		function handleOutsideClick(event: MouseEvent) {
			if (
					containerRef.current &&
					!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleOutsideClick);

		return () => {
			document.removeEventListener(
					"mousedown",
					handleOutsideClick
			);
		};
	}, []);

	async function handleOpen() {
		const nextIsOpen = !isOpen;

		setIsOpen(nextIsOpen);

		if (!nextIsOpen) {
			return;
		}

		try {
			setLoadingList(true);
			setError("");

			const response = await fetch(
					"/api/notifications?limit=50"
			);

			const data: NotificationsResponse & {
				error?: string;
			} = await response.json();

			if (!response.ok) {
				throw new Error(
						data.error || "Failed to fetch notifications"
				);
			}

			setNotifications(data.notifications);
			setUnreadCount(data.unreadCount);
		} catch (error) {
			console.error(error);
			setError("خطا در دریافت اعلان‌ها");
		} finally {
			setLoadingList(false);
		}
	}

	async function handleMarkAsRead(notificationId: string) {
		const notification = notifications.find(
				(item) => item.id === notificationId
		);

		if (!notification || notification.isRead) {
			return;
		}

		try {
			setError("");

			const response = await fetch(
					`/api/notifications/${notificationId}/read`,
					{
						method: "PATCH",
					}
			);

			const data: {
				notification?: {
					id: string;
					isRead: boolean;
					readAt: string | null;
				};
				error?: string;
			} = await response.json();

			if (!response.ok) {
				throw new Error(
						data.error || "Failed to mark notification as read"
				);
			}

			setNotifications((currentNotifications) =>
					currentNotifications.map((item) =>
							item.id === notificationId
									? {
										...item,
										isRead: true,
										readAt:
												data.notification?.readAt ??
												new Date().toISOString(),
									}
									: item
					)
			);

			setUnreadCount((currentCount) =>
					Math.max(currentCount - 1, 0)
			);
		} catch (error) {
			console.error(error);
			setError("خطا در خوانده‌شدن اعلان");
		}
	}

	async function handleMarkAllAsRead() {
		if (unreadCount === 0) {
			return;
		}

		try {
			setError("");

			const response = await fetch(
					"/api/notifications/read-all",
					{
						method: "PATCH",
					}
			);

			const data: {
				success?: boolean;
				updatedCount?: number;
				error?: string;
			} = await response.json();

			if (!response.ok) {
				throw new Error(
						data.error ||
						"Failed to mark all notifications as read"
				);
			}

			setNotifications((currentNotifications) =>
					currentNotifications.map((notification) => ({
						...notification,
						isRead: true,
						readAt:
								notification.readAt ??
								new Date().toISOString(),
					}))
			);

			setUnreadCount(0);
		} catch (error) {
			console.error(error);
			setError("خطا در خوانده‌شدن اعلان‌ها");
		}
	}

	return (
			<div
					ref={containerRef}
					className="relative"
					dir="rtl"
			>
				<button
						type="button"
						aria-label="اعلان‌ها"
						aria-expanded={isOpen}
						title="اعلان‌ها"
						onClick={handleOpen}
						disabled={loading}
						className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#C4B5FD] bg-[#6D28D9] text-white transition hover:bg-[#4C1D95] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
				>
					<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.8"
							className="h-5 w-5"
					>
						<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15 17h5l-1.4-1.6a2 2 0 0 1-.6-1.4V10a6 6 0 0 0-12 0v4a2 2 0 0 1-.6 1.4L4 17h5"
						/>
						<path
								strokeLinecap="round"
								d="M10 20h4"
						/>
					</svg>

					{unreadCount > 0 && (
							<span
									className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
					)}
				</button>

				{isOpen && (
						<div
								className="absolute left-0 top-14 z-50 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#DDD6FE] bg-white shadow-xl">
							{/* Header */}
							<div className="flex items-center justify-between border-b border-[#E9D5FF] bg-[#F5F3FF] p-4">
								<div>
									<h2 className="font-bold text-[#2E1065]">
										اعلان‌ها
									</h2>

									{unreadCount > 0 && (
											<p className="mt-1 text-xs text-[#7C6AA8]">
												{unreadCount} اعلان خوانده‌نشده
											</p>
									)}
								</div>

								{unreadCount > 0 && (
										<button
												type="button"
												onClick={handleMarkAllAsRead}
												className="rounded-lg px-2 py-1 text-xs font-semibold text-[#6D28D9] transition hover:bg-white hover:text-[#4C1D95]"
										>
											همه را خواندم
										</button>
								)}
							</div>

							{/* Error */}
							{error && (
									<div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
										{error}
									</div>
							)}

							{/* Loading */}
							{loadingList ? (
									<div className="p-8 text-center">
										<div
												className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-[#DDD6FE] border-t-[#6D28D9]"/>

										<p className="mt-3 text-sm text-[#7C6AA8]">
											در حال دریافت اعلان‌ها...
										</p>
									</div>
							) : notifications.length === 0 ? (
									<div className="p-8 text-center">
										<div
												className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F3FF] text-[#6D28D9]">
											<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="1.8"
													className="h-6 w-6"
											>
												<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M15 17h5l-1.4-1.6a2 2 0 0 1-.6-1.4V10a6 6 0 0 0-12 0v4a2 2 0 0 1-.6 1.4L4 17h5"
												/>
												<path
														strokeLinecap="round"
														d="M10 20h4"
												/>
											</svg>
										</div>

										<p className="mt-4 text-sm font-semibold text-[#2E1065]">
											اعلانی وجود ندارد
										</p>

										<p className="mt-1 text-xs text-[#8B7AAE]">
											در حال حاضر اعلان جدیدی برای شما ثبت نشده است.
										</p>
									</div>
							) : (
									<div className="max-h-[420px] overflow-y-auto">
										{notifications.map((notification) => (
												<button
														key={notification.id}
														type="button"
														onClick={() =>
																handleMarkAsRead(notification.id)
														}
														className={`block w-full border-b border-[#E9D5FF] p-4 text-right transition last:border-b-0 ${
																notification.isRead
																		? "bg-white hover:bg-[#F5F3FF]"
																		: "bg-[#F5F3FF] hover:bg-[#EDE9FE]"
														}`}
												>
													<div className="flex gap-3">
														<div
																className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E9D5FF] text-[#6D28D9]">
															<svg
																	xmlns="http://www.w3.org/2000/svg"
																	viewBox="0 0 24 24"
																	fill="none"
																	stroke="currentColor"
																	strokeWidth="1.8"
																	className="h-5 w-5"
															>
																<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		d="M15 17h5l-1.4-1.6a2 2 0 0 1-.6-1.4V10a6 6 0 0 0-12 0v4a2 2 0 0 1-.6 1.4L4 17h5"
																/>
																<path
																		strokeLinecap="round"
																		d="M10 20h4"
																/>
															</svg>
														</div>

														<div className="min-w-0 flex-1">
															<div className="flex items-start justify-between gap-2">
																<p className="font-semibold text-[#2E1065]">
																	{notification.title}
																</p>

																{!notification.isRead && (
																		<span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#6D28D9]"/>
																)}
															</div>

															<p className="mt-1 text-sm leading-6 text-[#7C6AA8]">
																{notification.message}
															</p>

															<p className="mt-2 text-xs text-[#A78BCA]">
																{formatDate(notification.createdAt)}
															</p>
														</div>
													</div>
												</button>
										))}
									</div>
							)}
						</div>
				)}
			</div>
	);
}