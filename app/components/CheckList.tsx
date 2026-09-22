"use client";

import {useEffect, useState} from "react";
import type {Check} from "@/app/types/check-types";

type CheckListProps = {
	companyId: string;
	refreshKey: number;
	onEdit: (check: Check) => void;
};

type Pagination = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

type PageItem = number | "...";

type SortBy = "dueDate" | "amount" | "createdAt";
type SortOrder = "asc" | "desc";

type SortOption = {
	sortBy: SortBy;
	sortOrder: SortOrder;
};

type CheckStatus =
		| "PENDING"
		| "DUE"
		| "PAID"
		| "RECEIVED"
		| "BOUNCED"
		| "CANCELLED";

type CheckType = "RECEIVABLE" | "PAYABLE";

type CheckFilters = {
	sayadId: string;
	type: "" | CheckType;
	status: "" | CheckStatus;
	bankId: string;
	series: string;
	serial: string;
	fromDate: string;
	toDate: string;
	minAmount: string;
	maxAmount: string;
};

const initialFilters: CheckFilters = {
	sayadId: "",
	type: "",
	status: "",
	bankId: "",
	series: "",
	serial: "",
	fromDate: "",
	toDate: "",
	minAmount: "",
	maxAmount: "",
};

const statusLabels: Record<CheckStatus, string> = {
	PENDING: "در انتظار",
	DUE: "سررسید شده",
	PAID: "پرداخت شده",
	RECEIVED: "دریافت شده",
	BOUNCED: "برگشت خورده",
	CANCELLED: "لغو شده",
};

const statuses: CheckStatus[] = [
	"PENDING",
	"DUE",
	"PAID",
	"RECEIVED",
	"BOUNCED",
	"CANCELLED",
];

export default function CheckList({
	                                  companyId,
	                                  refreshKey,
	                                  onEdit,
                                  }: CheckListProps) {
	const [checks, setChecks] = useState<Check[]>([]);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(20);
	const [pagination, setPagination] = useState<Pagination>({
		page: 1,
		limit: 20,
		total: 0,
		totalPages: 0,
	});
	const [sort, setSort] = useState<SortOption>({
		sortBy: "dueDate",
		sortOrder: "asc",
	});

	const [banks, setBanks] = useState<
			{ id: string; name: string }[]
	>([]);

	const [filters, setFilters] =
			useState<CheckFilters>(initialFilters);

	const [appliedFilters, setAppliedFilters] =
			useState<CheckFilters>(initialFilters);

	const [isFilterOpen, setIsFilterOpen] =
			useState(false);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [deletingId, setDeletingId] =
			useState<string | null>(null);

	const [updatingStatusId, setUpdatingStatusId] =
			useState<string | null>(null);

	useEffect(() => {
		async function fetchBanks() {
			try {
				const response = await fetch("/api/banks");

				const data = await response.json();

				if (!response.ok) {
					throw new Error(
							data.message || "Failed to fetch banks"
					);
				}

				setBanks(data.banks);
			} catch (error) {
				console.error(error);
			}
		}

		fetchBanks();
	}, []);

	useEffect(() => {
		async function fetchChecks() {
			try {
				setLoading(true);
				setError("");

				const searchParams = new URLSearchParams();

				searchParams.set("page", String(page));
				searchParams.set("limit", String(limit));
				searchParams.set("sortBy", sort.sortBy);
				searchParams.set("sortOrder", sort.sortOrder);

				if (appliedFilters.sayadId) {
					searchParams.set(
							"sayadId",
							appliedFilters.sayadId
					);
				}

				if (appliedFilters.type) {
					searchParams.set(
							"type",
							appliedFilters.type
					);
				}

				if (appliedFilters.status) {
					searchParams.set(
							"status",
							appliedFilters.status
					);
				}

				if (appliedFilters.bankId) {
					searchParams.set(
							"bankId",
							appliedFilters.bankId
					);
				}

				if (appliedFilters.series) {
					searchParams.set(
							"series",
							appliedFilters.series
					);
				}

				if (appliedFilters.serial) {
					searchParams.set(
							"serial",
							appliedFilters.serial
					);
				}

				if (appliedFilters.fromDate) {
					searchParams.set(
							"fromDate",
							appliedFilters.fromDate
					);
				}

				if (appliedFilters.toDate) {
					searchParams.set(
							"toDate",
							appliedFilters.toDate
					);
				}

				if (appliedFilters.minAmount) {
					searchParams.set(
							"minAmount",
							appliedFilters.minAmount
					);
				}

				if (appliedFilters.maxAmount) {
					searchParams.set(
							"maxAmount",
							appliedFilters.maxAmount
					);
				}

				const queryString =
						searchParams.toString();

				const url = queryString
						? `/api/companies/${companyId}/checks?${queryString}`
						: `/api/companies/${companyId}/checks`;

				const response = await fetch(url);

				const data = await response.json();

				if (!response.ok) {
					throw new Error(
							data.message || "Failed to fetch checks"
					);
				}

				setChecks(data.checks);
				setPagination(data.pagination);
			} catch (error) {
				console.error(error);
				setError("خطا در دریافت چک‌ها");
			} finally {
				setLoading(false);
			}
		}

		fetchChecks();
	}, [companyId, refreshKey, appliedFilters, page, sort, limit]);

	function handleFilterChange(
			field: keyof CheckFilters,
			value: string
	) {
		setFilters((current) => ({
			...current,
			[field]: value,
		}));
	}

	function handleApplyFilters() {
		setPage(1);
		setAppliedFilters({...filters});
	}

	function handleClearFilters() {
		setPage(1);
		setFilters(initialFilters);
		setAppliedFilters(initialFilters);
	}

	function removeFilter(
			field: keyof CheckFilters
	) {
		const newFilters = {
			...appliedFilters,
			[field]: "",
		};

		setPage(1);
		setFilters(newFilters);
		setAppliedFilters(newFilters);
	}

	const activeFilterCount =
			Object.values(appliedFilters).filter(
					Boolean
			).length;

	function getBankName(bankId: string) {
		return (
				banks.find((bank) => bank.id === bankId)
						?.name ?? bankId
		);
	}

	async function handleDelete(check: Check) {
		const confirmed = window.confirm(
				`آیا از حذف چک ${check.sayadId} مطمئن هستید؟`
		);

		if (!confirmed) {
			return;
		}

		try {
			setDeletingId(check.id);
			setError("");

			const response = await fetch(
					`/api/companies/${companyId}/checks/${check.id}`,
					{
						method: "DELETE",
					}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
						data.message || "Failed to delete check"
				);
			}

			const newTotal = Math.max(
					pagination.total - 1, 0
			);

			const newTotalPages = Math.max(
					Math.ceil(newTotal / limit),
			);

			const shouldGoToPreviousPage = checks.length === 1 && page > 1;

			if (shouldGoToPreviousPage) {
				setPage((currentPage) => currentPage - 1);
				return;
			}

			setChecks((currentChecks) =>
					currentChecks.filter(
							(currentCheck) =>
									currentCheck.id !== check.id
					)
			);

			setPagination((currentPagination) => ({
				...currentPagination,
				total: newTotal,
				totalPages: newTotalPages,
			}));

		} catch (error) {
			console.error(error);
			setError("خطا در حذف چک");
		} finally {
			setDeletingId(null);
		}
	}

	async function handleStatusChange(
			checkId: string,
			status: CheckStatus
	) {
		try {
			setUpdatingStatusId(checkId);
			setError("");

			const response = await fetch(
					`/api/companies/${companyId}/checks/${checkId}/status`,
					{
						method: "PATCH",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							status,
						}),
					}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
						data.message ||
						"Failed to update check status"
				);
			}

			setChecks((currentChecks) =>
					currentChecks.map((currentCheck) =>
							currentCheck.id === checkId
									? {
										...currentCheck,
										status,
									}
									: currentCheck
					)
			);
		} catch (error) {
			console.error(error);
			setError("خطا در تغییر وضعیت چک");
		} finally {
			setUpdatingStatusId(null);
		}
	}

	function handleLimitChange(value: number) {
		setPage(1);
		setLimit(value);
	}

	function getPageNumbers(): PageItem[] {
		const totalPages = pagination.totalPages;

		if (totalPages <= 7) {
			return Array.from(
					{length: totalPages},
					(_, index) => index + 1
			);
		}

		if (page <= 4) {
			return [1, 2, 3, 4, 5, "...", totalPages];
		}

		if (page >= totalPages - 3) {
			return [
				1,
				"...",
				totalPages - 4,
				totalPages - 3,
				totalPages - 2,
				totalPages - 1,
				totalPages,
			];
		}

		return [
			1,
			"...",
			page - 1,
			page,
			page + 1,
			"...",
			totalPages,
		];
	}

	return (
			<div className="space-y-6" dir="rtl">
				{/* Filter Header */}
				<div className="rounded-lg border">
					<button
							type="button"
							onClick={() =>
									setIsFilterOpen(
											(current) => !current
									)
							}
							className="flex w-full items-center justify-between p-5 text-right hover:bg-muted/30"
					>
						<div>
							<div className="flex items-center gap-2">
								<h2 className="text-xl font-semibold">
									فیلتر چک‌ها
								</h2>

								{activeFilterCount > 0 && (
										<span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  {activeFilterCount.toLocaleString(
		                  "fa-IR"
                  )}
                </span>
								)}
							</div>

							<p className="mt-1 text-sm text-muted-foreground">
								جستجو و فیلتر چک‌های ثبت‌شده
							</p>
						</div>

						<span className="text-xl">
            {isFilterOpen ? "−" : "+"}
          </span>
					</button>

					{isFilterOpen && (
							<div className="border-t p-5">

								{/* Sort */}
								<div className="mb-5 max-w-sm">
									<label
											htmlFor="sort"
											className="mb-1 block text-sm font-medium"
									>
										مرتب‌سازی
									</label>

									<select
											id="sort"
											value={`${sort.sortBy}-${sort.sortOrder}`}
											onChange={(event) => {
												const [sortBy, sortOrder] = event.target.value.split("-") as [
													SortBy,
													SortOrder
												];

												setPage(1);

												setSort({
													sortBy,
													sortOrder,
												});
											}}
											className="w-full rounded-md border bg-background px-3 py-2 text-sm"
									>
										<option value="dueDate-asc">
											نزدیک‌ترین سررسید
										</option>

										<option value="dueDate-desc">
											دورترین سررسید
										</option>

										<option value="amount-desc">
											بیشترین مبلغ
										</option>

										<option value="amount-asc">
											کمترین مبلغ
										</option>

										<option value="createdAt-desc">
											جدیدترین ثبت
										</option>

										<option value="createdAt-asc">
											قدیمی‌ترین ثبت
										</option>
									</select>
								</div>

								{/* Filters */}
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{/* Sayad ID */}
									<div>
										<label
												htmlFor="sayadId"
												className="mb-1 block text-sm font-medium"
										>
											شناسه صیاد
										</label>

										<input
												id="sayadId"
												type="text"
												inputMode="numeric"
												maxLength={16}
												value={filters.sayadId}
												onChange={(event) =>
														handleFilterChange(
																"sayadId",
																event.target.value
														)
												}
												placeholder="۱۶ رقم شناسه صیاد"
												className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
										/>
									</div>

									{/* Type */}
									<div>
										<label
												htmlFor="type"
												className="mb-1 block text-sm font-medium"
										>
											نوع چک
										</label>

										<select
												id="type"
												value={filters.type}
												onChange={(event) =>
														handleFilterChange(
																"type",
																event.target.value
														)
												}
												className="w-full rounded-md border bg-background px-3 py-2 text-sm"
										>
											<option value="">
												همه
											</option>

											<option value="RECEIVABLE">
												دریافتی
											</option>

											<option value="PAYABLE">
												پرداختی
											</option>
										</select>
									</div>

									{/* Status */}
									<div>
										<label
												htmlFor="status"
												className="mb-1 block text-sm font-medium"
										>
											وضعیت
										</label>

										<select
												id="status"
												value={filters.status}
												onChange={(event) =>
														handleFilterChange(
																"status",
																event.target.value
														)
												}
												className="w-full rounded-md border bg-background px-3 py-2 text-sm"
										>
											<option value="">
												همه
											</option>

											{statuses.map((status) => (
													<option
															key={status}
															value={status}
													>
														{statusLabels[status]}
													</option>
											))}
										</select>
									</div>

									{/* Bank */}
									<div>
										<label
												htmlFor="bankId"
												className="mb-1 block text-sm font-medium"
										>
											بانک
										</label>

										<select
												id="bankId"
												value={filters.bankId}
												onChange={(event) =>
														handleFilterChange(
																"bankId",
																event.target.value
														)
												}
												className="w-full rounded-md border bg-background px-3 py-2 text-sm"
										>
											<option value="">
												همه بانک‌ها
											</option>

											{banks.map((bank) => (
													<option
															key={bank.id}
															value={bank.id}
													>
														{bank.name}
													</option>
											))}
										</select>
									</div>

									{/* Series */}
									<div>
										<label
												htmlFor="series"
												className="mb-1 block text-sm font-medium"
										>
											سری
										</label>

										<input
												id="series"
												type="text"
												value={filters.series}
												onChange={(event) =>
														handleFilterChange(
																"series",
																event.target.value
														)
												}
												placeholder="سری چک"
												className="w-full rounded-md border bg-background px-3 py-2 text-sm"
										/>
									</div>

									{/* Serial */}
									<div>
										<label
												htmlFor="serial"
												className="mb-1 block text-sm font-medium"
										>
											سریال
										</label>

										<input
												id="serial"
												type="text"
												value={filters.serial}
												onChange={(event) =>
														handleFilterChange(
																"serial",
																event.target.value
														)
												}
												placeholder="سریال چک"
												className="w-full rounded-md border bg-background px-3 py-2 text-sm"
										/>
									</div>

									{/* From Date */}
									<div>
										<label
												htmlFor="fromDate"
												className="mb-1 block text-sm font-medium"
										>
											از تاریخ سررسید
										</label>

										<input
												id="fromDate"
												type="date"
												value={filters.fromDate}
												onChange={(event) =>
														handleFilterChange(
																"fromDate",
																event.target.value
														)
												}
												className="w-full rounded-md border bg-background px-3 py-2 text-sm"
										/>
									</div>

									{/* To Date */}
									<div>
										<label
												htmlFor="toDate"
												className="mb-1 block text-sm font-medium"
										>
											تا تاریخ سررسید
										</label>

										<input
												id="toDate"
												type="date"
												value={filters.toDate}
												onChange={(event) =>
														handleFilterChange(
																"toDate",
																event.target.value
														)
												}
												className="w-full rounded-md border bg-background px-3 py-2 text-sm"
										/>
									</div>

									{/* Min Amount */}
									<div>
										<label
												htmlFor="minAmount"
												className="mb-1 block text-sm font-medium"
										>
											حداقل مبلغ
										</label>

										<input
												id="minAmount"
												type="number"
												min="0"
												value={filters.minAmount}
												onChange={(event) =>
														handleFilterChange(
																"minAmount",
																event.target.value
														)
												}
												placeholder="حداقل مبلغ"
												className="w-full rounded-md border bg-background px-3 py-2 text-sm"
										/>
									</div>

									{/* Max Amount */}
									<div>
										<label
												htmlFor="maxAmount"
												className="mb-1 block text-sm font-medium"
										>
											حداکثر مبلغ
										</label>

										<input
												id="maxAmount"
												type="number"
												min="0"
												value={filters.maxAmount}
												onChange={(event) =>
														handleFilterChange(
																"maxAmount",
																event.target.value
														)
												}
												placeholder="حداکثر مبلغ"
												className="w-full rounded-md border bg-background px-3 py-2 text-sm"
										/>
									</div>
								</div>

								{/* Actions */}
								<div className="mt-5 flex flex-wrap gap-2">
									<button
											type="button"
											onClick={handleApplyFilters}
											disabled={loading}
											className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
									>
										اعمال فیلتر
									</button>

									<button
											type="button"
											onClick={handleClearFilters}
											disabled={
													loading &&
													checks.length === 0
											}
											className="rounded-md border px-4 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
									>
										پاک کردن همه
									</button>
								</div>
							</div>
					)}
				</div>

				{/* Active Filters */}
				{activeFilterCount > 0 && (
						<div className="flex flex-wrap items-center gap-2">
						<span className="text-sm font-medium">
						فیلترهای فعال:
						</span>

							{appliedFilters.sayadId && (
									<button
											type="button"
											onClick={() =>
													removeFilter("sayadId")
											}
											className="rounded-full border bg-muted px-3 py-1 text-xs hover:bg-muted/70"
									>
										شناسه صیاد:{" "}
										{appliedFilters.sayadId} ×
									</button>
							)}

							{appliedFilters.type && (
									<button
											type="button"
											onClick={() =>
													removeFilter("type")
											}
											className="rounded-full border bg-muted px-3 py-1 text-xs hover:bg-muted/70"
									>
										نوع:{" "}
										{appliedFilters.type ===
										"RECEIVABLE"
												? "دریافتی"
												: "پرداختی"}{" "}
										×
									</button>
							)}

							{appliedFilters.status && (
									<button
											type="button"
											onClick={() =>
													removeFilter("status")
											}
											className="rounded-full border bg-muted px-3 py-1 text-xs hover:bg-muted/70"
									>
										وضعیت:{" "}
										{
											statusLabels[
													appliedFilters.status
													]
										}{" "}
										×
									</button>
							)}

							{appliedFilters.bankId && (
									<button
											type="button"
											onClick={() =>
													removeFilter("bankId")
											}
											className="rounded-full border bg-muted px-3 py-1 text-xs hover:bg-muted/70"
									>
										بانک:{" "}
										{getBankName(
												appliedFilters.bankId
										)}{" "}
										×
									</button>
							)}

							{appliedFilters.series && (
									<button
											type="button"
											onClick={() =>
													removeFilter("series")
											}
											className="rounded-full border bg-muted px-3 py-1 text-xs hover:bg-muted/70"
									>
										سری:{" "}
										{appliedFilters.series} ×
									</button>
							)}

							{appliedFilters.serial && (
									<button
											type="button"
											onClick={() =>
													removeFilter("serial")
											}
											className="rounded-full border bg-muted px-3 py-1 text-xs hover:bg-muted/70"
									>
										سریال:{" "}
										{appliedFilters.serial} ×
									</button>
							)}

							{appliedFilters.fromDate && (
									<button
											type="button"
											onClick={() =>
													removeFilter("fromDate")
											}
											className="rounded-full border bg-muted px-3 py-1 text-xs hover:bg-muted/70"
									>
										از:{" "}
										{appliedFilters.fromDate} ×
									</button>
							)}

							{appliedFilters.toDate && (
									<button
											type="button"
											onClick={() =>
													removeFilter("toDate")
											}
											className="rounded-full border bg-muted px-3 py-1 text-xs hover:bg-muted/70"
									>
										تا:{" "}
										{appliedFilters.toDate} ×
									</button>
							)}

							{appliedFilters.minAmount && (
									<button
											type="button"
											onClick={() =>
													removeFilter("minAmount")
											}
											className="rounded-full border bg-muted px-3 py-1 text-xs hover:bg-muted/70"
									>
										حداقل:{" "}
										{Number(
												appliedFilters.minAmount
										).toLocaleString("fa-IR")}{" "}
										×
									</button>
							)}

							{appliedFilters.maxAmount && (
									<button
											type="button"
											onClick={() =>
													removeFilter("maxAmount")
											}
											className="rounded-full border bg-muted px-3 py-1 text-xs hover:bg-muted/70"
									>
										حداکثر:{" "}
										{Number(
												appliedFilters.maxAmount
										).toLocaleString("fa-IR")}{" "}
										×
									</button>
							)}
						</div>
				)
				}

				{/* Error */
				}
				{
						error && (
								<p className="text-sm text-red-500">
									{error}
								</p>
						)
				}

				{/* Loading */
				}
				{
						loading && checks.length === 0 && (
								<p>در حال دریافت چک‌ها...</p>
						)
				}

				{/* Empty */
				}
				{
						!loading && checks.length === 0 && (
								<div className="rounded-lg border p-6 text-center">
									<p className="text-muted-foreground">
										چکی با این مشخصات پیدا نشد.
									</p>
								</div>
						)
				}

				{/* Check List */
				}
				{
						checks.length > 0 && (
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<h2 className="text-xl font-semibold">
											چک‌های ثبت‌شده
										</h2>

										<span className="text-sm text-muted-foreground">
              تعداد نتایج:{" "}
											{checks.length.toLocaleString("fa-IR")}
            </span>
									</div>

									<div className="overflow-x-auto rounded-lg border">
										<table className="w-full text-sm">
											<thead>
											<tr className="border-b bg-muted/50">
												<th className="p-3 text-right">
													نوع
												</th>

												<th className="p-3 text-right">
													Sayad ID
												</th>

												<th className="p-3 text-right">
													سری / سریال
												</th>

												<th className="p-3 text-right">
													بانک
												</th>

												<th className="p-3 text-right">
													مبلغ
												</th>

												<th className="p-3 text-right">
													سررسید
												</th>

												<th className="p-3 text-right">
													وضعیت
												</th>

												<th className="p-3 text-right">
													عملیات
												</th>
											</tr>
											</thead>

											<tbody>
											{checks.length > 0 ? (
													checks.map((check) => {
														const isDeleting =
																deletingId === check.id;

														const isUpdatingStatus =
																updatingStatusId === check.id;

														return (
																<tr
																		key={check.id}
																		className="border-b last:border-b-0"
																>
																	<td className="p-3">
																		{check.type === "RECEIVABLE"
																				? "دریافتی"
																				: "پرداختی"}
																	</td>

																	<td className="p-3 font-mono">
																		{check.sayadId}
																	</td>

																	<td className="p-3">
																		{check.series} / {check.serial}
																	</td>

																	<td className="p-3">
																		{check.bank.name}
																	</td>

																	<td className="p-3">
																		{Number(check.amount).toLocaleString("fa-IR")}
																	</td>

																	<td className="p-3">
																		{new Date(check.dueDate).toLocaleDateString("fa-IR")}
																	</td>

																	<td className="p-3">
																		<select
																				value={check.status}
																				disabled={isUpdatingStatus || isDeleting}
																				onChange={(event) =>
																						handleStatusChange(
																								check.id,
																								event.target.value as CheckStatus
																						)
																				}
																				className="rounded-md border bg-background px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
																		>
																			{statuses.map((status) => (
																					<option key={status} value={status}>
																						{statusLabels[status]}
																					</option>
																			))}
																		</select>
																	</td>

																	<td className="p-3">
																		<div className="flex gap-2">
																			<button
																					type="button"
																					onClick={() => onEdit(check)}
																					disabled={isDeleting || isUpdatingStatus}
																					className="rounded-md border px-3 py-1 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
																			>
																				ویرایش
																			</button>

																			<button
																					type="button"
																					onClick={() => handleDelete(check)}
																					disabled={isDeleting || isUpdatingStatus}
																					className="rounded-md border border-red-500 px-3 py-1 text-sm text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
																			>
																				{isDeleting ? "در حال حذف..." : "حذف"}
																			</button>
																		</div>
																	</td>
																</tr>
														);
													})
											) : (
													<tr>
														<td
																colSpan={8}
																className="p-10 text-center"
														>
															<div className="space-y-2">
																<p className="font-medium">
																	{Object.values(appliedFilters).some(Boolean)
																			? "هیچ چکی با فیلترهای انتخاب‌شده پیدا نشد."
																			: "هنوز هیچ چکی ثبت نشده است."}
																</p>

																<p className="text-sm text-muted-foreground">
																	{Object.values(appliedFilters).some(Boolean)
																			? "فیلترها را تغییر دهید یا پاک کنید."
																			: "برای شروع، اولین چک خود را ثبت کنید."}
																</p>
															</div>
														</td>
													</tr>
											)}
											</tbody>
										</table>
									</div>
								</div>
						)
				}

				<div
						dir="rtl"
						className="mt-6 flex flex-col gap-4 border-t pt-4 lg:flex-row lg:items-center lg:justify-between"
				>
					{/* Info + Page Size */}
					<div className="flex flex-wrap items-center gap-4">
						<div className="text-sm text-muted-foreground">
							{pagination.total > 0 ? (
									<>
										نمایش{" "}
										{(
												(pagination.page - 1) * pagination.limit +
												1
										).toLocaleString("fa-IR")}{" "}
										تا{" "}
										{Math.min(
												pagination.page * pagination.limit,
												pagination.total
										).toLocaleString("fa-IR")}{" "}
										از{" "}
										{pagination.total.toLocaleString("fa-IR")}{" "}
										چک
									</>
							) : (
									"چکی وجود ندارد"
							)}
						</div>

						<div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">
        تعداد در صفحه:
      </span>

							<select
									value={limit}
									onChange={(event) =>
											handleLimitChange(
													Number(event.target.value)
											)
									}
									className="rounded-md border bg-background px-2 py-1.5 text-sm"
							>
								<option value={10}>۱۰</option>
								<option value={20}>۲۰</option>
								<option value={50}>۵۰</option>
								<option value={100}>۱۰۰</option>
							</select>
						</div>
					</div>

					{/* Pagination */}
					<div className="flex items-center gap-1">
						<button
								type="button"
								disabled={page <= 1}
								onClick={() =>
										setPage((current) => current - 1)
								}
								className="rounded-md border px-3 py-2 text-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
						>
							قبلی
						</button>

						{getPageNumbers().map(
								(pageNumber, index) =>
										pageNumber === "..." ? (
												<span
														key={`ellipsis-${index}`}
														className="px-2 text-sm text-muted-foreground"
												>
            ...
          </span>
										) : (
												<button
														key={pageNumber}
														type="button"
														onClick={() =>
																setPage(pageNumber)
														}
														className={`min-w-9 rounded-md border px-3 py-2 text-sm transition ${
																pageNumber === page
																		? "bg-primary text-primary-foreground"
																		: "hover:bg-muted"
														}`}
												>
													{pageNumber.toLocaleString("fa-IR")}
												</button>
										)
						)}

						<button
								type="button"
								disabled={
										page >= pagination.totalPages
								}
								onClick={() =>
										setPage((current) => current + 1)
								}
								className="rounded-md border px-3 py-2 text-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
						>
							بعدی
						</button>
					</div>
				</div>

			</div>
	);
}