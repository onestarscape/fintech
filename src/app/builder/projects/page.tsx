import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createProject } from "@/lib/actions/builders";

export default async function BuilderProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("builder_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Your projects</h1>
        <div className="mt-4 space-y-2">
          {projects?.map((p) => (
            <Link key={p.id} href={`/builder/projects/${p.id}`}>
              <Card className="flex items-center justify-between p-5 hover:shadow-[0_8px_30px_rgba(18,19,26,0.06)]">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted">
                    {p.location} {p.total_units ? `· ${p.total_units} units` : ""}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
          {!projects?.length && (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted">No projects registered yet.</p>
            </Card>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold tracking-tight">Register a new project</h2>
        <Card className="mt-4 p-6">
          <form action={createProject} className="space-y-4">
            <div>
              <Label htmlFor="name">Project name</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" />
            </div>
            <div>
              <Label htmlFor="total_units">Total units (optional)</Label>
              <Input id="total_units" name="total_units" type="number" />
            </div>
            <Button type="submit" variant="accent" size="md">
              Register project
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
