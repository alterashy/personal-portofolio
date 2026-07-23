import type { APIRoute } from 'astro';
import { createDbClient, techStack } from '@portfolio/db';
import { desc } from 'drizzle-orm';

export const prerender = false;

function getDb() {
  const dbUrl = import.meta.env.DATABASE_URL || process.env.DATABASE_URL || '';
  return createDbClient(dbUrl);
}

export const GET: APIRoute = async () => {
  try {
    const db = getDb();
    const allTech = await db.select().from(techStack).orderBy(desc(techStack.createdAt));
    return new Response(JSON.stringify(allTech), {
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

    const newTech = await db.insert(techStack).values({
      name: body.name,
      category: body.category,
      icon: body.iconUrl || body.icon || null,
      proficiency: body.proficiency || 0,
    }).returning();

    return new Response(JSON.stringify(newTech[0]), { status: 201 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
