"use client";

import { useState } from "react";
import CreateCheckForm from "./CreateCheckForm";
import CheckList from "./CheckList";

type ChecksClientProps = {
	companyId: string;
};

export default function ChecksClient({
	                                     companyId,
                                     }: ChecksClientProps) {
	const [refreshKey, setRefreshKey] = useState(0);

	function handleCheckCreated() {
		setRefreshKey((current) => current + 1);
	}

	return (
			<div className="space-y-8">
				<CreateCheckForm
						companyId={companyId}
						onCheckCreated={handleCheckCreated}
				/>

				<CheckList
						companyId={companyId}
						refreshKey={refreshKey}
				/>
			</div>
	);
}