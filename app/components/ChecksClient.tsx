"use client";

import {useState} from "react";
import CreateCheckForm from "./CreateCheckForm";
import CheckList from "./CheckList";
import type {Check} from "@/app/types/check-types";

type ChecksClientProps = {
	companyId: string;
};

export default function ChecksClient({
	                                     companyId,
                                     }: ChecksClientProps) {
	const [refreshKey, setRefreshKey] = useState(0);
	const [editingCheck, setEditingCheck] =
			useState<Check | null>(null);

	function handleCheckCreated() {
		setRefreshKey((current) => current + 1);
	}

	function handleEdit(check: Check) {
		setEditingCheck(check);
	}

	function handleEditFinished() {
		setEditingCheck(null);
	}

	return (
			<div
					dir="rtl"
					className="mx-auto w-full max-w-[1600px] space-y-10 px-4 py-6 sm:px-6 lg:px-8"
			>
				{/* Create / Edit Check */}
				<div className="mx-auto w-full max-w-4xl">
					<CreateCheckForm
							key={editingCheck?.id ?? "create"}
							companyId={companyId}
							onCheckCreated={handleCheckCreated}
							editingCheck={editingCheck}
							onEditFinished={handleEditFinished}
					/>
				</div>

				{/* Check List */}
				<div className="w-full">
					<CheckList
							companyId={companyId}
							refreshKey={refreshKey}
							onEdit={handleEdit}
					/>
				</div>
			</div>
	);
}