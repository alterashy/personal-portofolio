import type { APIRoute } from 'astro';
import { createDbClient, products } from '@portfolio/db';
import { desc } from 'drizzle-orm';

export const prerender = false;

function getDb() {
  const dbUrl = import.meta.env.DATABASE_URL || process.env.DATABASE_URL || '';
  return createDbClient(dbUrl);
}

export const GET: APIRoute = async () => {
  try {
    const db = getDb();
    const allProd = await db.select().from(products).orderBy(desc(products.createdAt));
    return new Response(JSON.stringify(allProd), {
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

    const newProd = await db.insert(products).values({
      title: body.title,
      slug: body.slug,
      description: body.description,
      content: body.content,
      coverImage: body.coverImage,
      demoUrl: body.demoUrl,
      githubUrl: body.githubUrl,
      year: body.year,
      visitors: body.visitors || 0,
      featured: body.featured || false,
      tags: body.tags || [],
      sortOrder: body.sortOrder || 0,
    }).returning();

    return new Response(JSON.stringify(newProd[0]), { status: 201 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
