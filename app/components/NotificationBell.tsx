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
					!containerRef.current.contains(
							event.target as Node
					)
			) {
				setIsOpen(false);
			}
		}

		document.addEventListener(
				"mousedown",
				handleOutsideClick
		);

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

	async function handleMarkAsRead(
			notificationId: string
	) {
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
						data.error || "Failed to mark all notifications as read"
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
						className="relative flex h-10 w-10 items-center justify-center rounded-md border hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
				>
					<span className="text-lg">🔔</span>

					{unreadCount > 0 && (
							<span
									className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-medium text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
					)}
				</button>

				{isOpen && (
						<div
								className="absolute right-0 top-12 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border bg-card shadow-lg">
							{/* Header */}
							<div className="flex items-center justify-between border-b p-4">
								<div>
									<h2 className="font-semibold">
										اعلان‌ها
									</h2>

									{unreadCount > 0 && (
											<p className="mt-1 text-xs text-muted-foreground">
												{unreadCount} اعلان خوانده‌نشده
											</p>
									)}
								</div>

								{unreadCount > 0 && (
										<button
												type="button"
												onClick={handleMarkAllAsRead}
												className="text-xs text-primary hover:underline"
										>
											همه را خواندم
										</button>
								)}
							</div>

							{/* Error */}
							{error && (
									<div className="border-b px-4 py-3 text-sm text-destructive">
										{error}
									</div>
							)}

							{/* Loading */}
							{loadingList ? (
									<div className="p-6 text-center text-sm text-muted-foreground">
										در حال دریافت اعلان‌ها...
									</div>
							) : notifications.length === 0 ? (
									<div className="p-8 text-center">
										<div className="text-3xl">🔕</div>

										<p className="mt-3 text-sm font-medium">
											اعلانی وجود ندارد
										</p>

										<p className="mt-1 text-xs text-muted-foreground">
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
														className={`block w-full border-b p-4 text-right transition last:border-b-0 hover:bg-muted ${
																notification.isRead
																		? "bg-card"
																		: "bg-muted/40"
														}`}
												>
													<div className="flex gap-3">
                    <span className="mt-0.5 text-lg">
                      🔔
                    </span>

														<div className="min-w-0 flex-1">
															<div className="flex items-start justify-between gap-2">
																<p className="font-medium">
																	{notification.title}
																</p>

																{!notification.isRead && (
																		<span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500"/>
																)}
															</div>

															<p className="mt-1 text-sm text-muted-foreground">
																{notification.message}
															</p>

															<p className="mt-2 text-xs text-muted-foreground">
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