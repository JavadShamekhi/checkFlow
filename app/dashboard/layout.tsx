import Navbar from "@/app/components/Navbar";

type DashboardLayoutProps = {
	children: React.ReactNode;
};

export default function DashboardLayout({
	                                        children,
                                        }: DashboardLayoutProps) {
	return (
			<div
					dir="rtl"
					className="min-h-screen bg-[#F5F3FF]"
			>
				<Navbar/>

				<main className="min-h-[calc(100vh-4rem)]">
					{children}
				</main>
			</div>
	);
}