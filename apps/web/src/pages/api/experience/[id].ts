import type { APIRoute } from 'astro';
import { createDbClient, experiences } from '@portfolio/db';
import { eq } from 'drizzle-orm';

export const prerender = false;

function getDb() {
  const dbUrl = import.meta.env.DATABASE_URL || process.env.DATABASE_URL || '';
  return createDbClient(dbUrl);
}

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    const id = params.id;
    if (!id) return new Response('Missing ID', { status: 400 });

    const db = getDb();
    const body = await request.json();

    const updated = await db.update(experiences)
      .set({
        company: body.company,
        role: body.role,
        startDate: body.startDate,
        endDate: body.endDate,
        description: body.description,
        sortOrder: body.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(experiences.id, id))
      .returning();

    return new Response(JSON.stringify(updated[0]), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = params.id;
    if (!id) return new Response('Missing ID', { status: 400 });

    const db = getDb();
    await db.delete(experiences).where(eq(experiences.id, id));

    return new Response(null, { status: 204 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
