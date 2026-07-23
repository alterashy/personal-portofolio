import type { APIRoute } from 'astro';
import { createDbClient, products } from '@portfolio/db';
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

    const updated = await db.update(products)
      .set({
        title: body.title,
        slug: body.slug,
        description: body.description,
        content: body.content,
        coverImage: body.coverImage,
        demoUrl: body.demoUrl,
        githubUrl: body.githubUrl,
        year: body.year,
        visitors: body.visitors,
        featured: body.featured,
        tags: body.tags,
        sortOrder: body.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
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
    await db.delete(products).where(eq(products.id, id));

    return new Response(null, { status: 204 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
