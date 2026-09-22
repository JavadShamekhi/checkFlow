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
	const [editingCheck, setEditingCheck] = useState<Check | null>(null);

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
			<div className="space-y-8">
				<CreateCheckForm
						key={editingCheck?.id ?? "create"}
						companyId={companyId}
						onCheckCreated={handleCheckCreated}
						editingCheck={editingCheck}
						onEditFinished={handleEditFinished}
				/>

				<CheckList
						companyId={companyId}
						refreshKey={refreshKey}
						onEdit={handleEdit}
				/>
			</div>
	);
}