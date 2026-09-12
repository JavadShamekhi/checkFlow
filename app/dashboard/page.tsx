import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import CreateCompanyForm from "@/app/components/CreateCompanyForm";

export default async function DashboardPage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/login");
	}

	return (
			<main className="p-8">
				<h1 className="text-3xl font-bold">
					Dashboard
				</h1>

				<p className="mt-4">
					Welcome, {session.user.name ?? session.user.email}
				</p>

				<CreateCompanyForm />
			</main>
	);
}