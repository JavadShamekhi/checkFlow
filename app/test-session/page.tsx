import { auth } from "@/app/lib/auth";

export default async function TestSessionPage() {
	const session = await auth();

	return (
			<main className="p-8">
				<h1 className="text-2xl font-bold">
					Session Test
				</h1>

				<pre className="mt-4">
        {JSON.stringify(session, null, 2)}
      </pre>
			</main>
	);
}