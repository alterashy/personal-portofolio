import type { APIRoute } from 'astro';
import { createDbClient, techStack } from '@portfolio/db';
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

    const updatedTech = await db.update(techStack).set({
      name: body.name,
      category: body.category,
      icon: body.iconUrl || body.icon,
      proficiency: body.proficiency,
    }).where(eq(techStack.id, id)).returning();

    return new Response(JSON.stringify(updatedTech[0]), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = params.id;
    if (!id) return new Response('Missing id', { status: 400 });

    const db = getDb();
    await db.delete(techStack).where(eq(techStack.id, id));

    return new Response(null, { status: 204 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
