import type { APIRoute } from 'astro';
import { createDbClient, experiences, insertExperienceSchema } from '@portfolio/db';
import { desc } from 'drizzle-orm';

export const prerender = false;

function getDb() {
  const dbUrl = import.meta.env.DATABASE_URL || process.env.DATABASE_URL || '';
  return createDbClient(dbUrl);
}

export const GET: APIRoute = async () => {
  try {
    const db = getDb();
    const allExp = await db.select().from(experiences).orderBy(desc(experiences.startDate));
    return new Response(JSON.stringify(allExp), {
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

    // Parse dates to satisfy zod schema
    const dataToValidate = {
      ...body,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      isCurrent: body.isCurrent || false,
    };

    const parsedBody = insertExperienceSchema.parse(dataToValidate) as unknown as typeof experiences.$inferInsert;

    const newExp = await db.insert(experiences).values(parsedBody).returning();

    return new Response(JSON.stringify(newExp[0]), { status: 201 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
