import { redirect } from "next/navigation";
import { isTrusted } from "@/lib/auth/session";
import { Header } from "@/components/header";
import { WhosThatView } from "@/components/whos-that-view";

export const dynamic = "force-dynamic";

export default async function WhosThatPage() {
  const trusted = await isTrusted();

  if (!trusted) {
    redirect("/");
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <WhosThatView />
      </main>
    </>
  );
}
