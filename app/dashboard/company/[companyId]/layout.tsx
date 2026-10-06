import Sidebar from "@/app/components/Sidebar";

type CompanyLayoutProps = {
	children: React.ReactNode;
	params: Promise<{
		companyId: string;
	}>;
};

export default async function CompanyLayout({
	                                            children,
	                                            params,
                                            }: CompanyLayoutProps) {
	const {companyId} = await params;

	return (
			<div className="flex min-h-[calc(100vh-4rem)]">
				<Sidebar companyId={companyId}/>

				<main className="min-w-0 flex-1 bg-[#F5F3FF]">
					{children}
				</main>
			</div>
	);
}