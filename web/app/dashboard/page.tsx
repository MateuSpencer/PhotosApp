import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "./sign-out-button";
import type { Database } from "@/lib/supabase/database.types";

type Narrative = Database["public"]["Tables"]["narratives"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's narratives
  const { data: narratives } = await supabase
    .from("narratives")
    .select("*")
    .order("date_created", { ascending: false })
    .returns<Narrative[]>();

  // Fetch user's projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("date_modified", { ascending: false })
    .returns<Project[]>();

  // Fetch media count
  const { count: mediaCount } = await supabase
    .from("media_items")
    .select("*", { count: "exact", head: true });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold">
            PhotosApp
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <p className="text-3xl font-bold">{narratives?.length ?? 0}</p>
            <p className="text-gray-400 text-sm mt-1">Narratives</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <p className="text-3xl font-bold">{projects?.length ?? 0}</p>
            <p className="text-gray-400 text-sm mt-1">Projects</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <p className="text-3xl font-bold">{mediaCount ?? 0}</p>
            <p className="text-gray-400 text-sm mt-1">Media Items</p>
          </div>
        </div>

        {/* Narratives */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Narratives</h2>
          {narratives && narratives.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {narratives.map((narrative) => (
                <div
                  key={narrative.id}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2">
                    {narrative.title}
                  </h3>
                  {narrative.description && (
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {narrative.description}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-3">
                    {new Date(narrative.date_created).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No narratives yet. Start by creating your first narrative!
            </p>
          )}
        </section>

        {/* Projects */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Projects</h2>
          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <span className="inline-block mt-3 text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                    {project.public_status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No projects yet. Create a project to group your narratives!
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
