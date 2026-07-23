import type { APIRoute } from 'astro';
import { createDbClient, projects } from '@portfolio/db';
import { eq } from 'drizzle-orm';

export const prerender = false;

function getDb() {
  const dbUrl = import.meta.env.DATABASE_URL || process.env.DATABASE_URL || '';
  return createDbClient(dbUrl);
}

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const id = params.id;
    if (!id) return new Response('Missing id', { status: 400 });

    const db = getDb();
    const body = await request.json();

    const updatedProject = await db.update(projects).set({
      title: body.title,
      slug: body.slug,
      description: body.description,
      content: body.content,
      coverImage: body.coverImage,
      demoUrl: body.demoUrl,
      githubUrl: body.githubUrl,
      year: body.year,
      featured: body.featured,
      tags: body.tags,
      sortOrder: body.sortOrder,
      updatedAt: new Date(),
    }).where(eq(projects.id, id)).returning();

    return new Response(JSON.stringify(updatedProject[0]), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = params.id;
    if (!id) return new Response('Missing id', { status: 400 });

    const db = getDb();
    await db.delete(projects).where(eq(projects.id, id));

    return new Response(null, { status: 204 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
