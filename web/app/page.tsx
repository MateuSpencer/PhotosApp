import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <main className="flex flex-col items-center gap-8 px-4 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
          PhotosApp
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 max-w-xl">
          Organize your photos into narratives, map your journeys, and tell your
          story through images.
        </p>
        <div className="flex gap-4 mt-4">
          <Link
            href="/login"
            className="rounded-lg bg-white text-gray-900 px-6 py-3 font-semibold hover:bg-gray-200 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-white/30 px-6 py-3 font-semibold hover:bg-white/10 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </main>
    </div>
  );
}
