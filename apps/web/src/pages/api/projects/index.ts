import type { APIRoute } from 'astro';
import { createDbClient, projects } from '@portfolio/db';
import { desc } from 'drizzle-orm';

export const prerender = false;

function getDb() {
  const dbUrl = import.meta.env.DATABASE_URL || process.env.DATABASE_URL || '';
  return createDbClient(dbUrl);
}

export const GET: APIRoute = async () => {
  try {
    const db = getDb();
    const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));
    return new Response(JSON.stringify(allProjects), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const db = getDb();
    const body = await request.json();

    const newProject = await db.insert(projects).values({
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: body.description,
      content: body.content || '',
      coverImage: body.coverImage || null,
      demoUrl: body.demoUrl,
      githubUrl: body.githubUrl,
      year: body.year,
      featured: body.featured || false,
      tags: body.tags || [],
      sortOrder: body.sortOrder || 0,
    }).returning();

    return new Response(JSON.stringify(newProject[0]), { status: 201 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
