import type { APIRoute } from 'astro';
import { createDbClient, posts } from '@portfolio/db';
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

    const updatedPost = await db.update(posts).set({
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.coverImage,
      published: body.published,
      publishedAt: body.published ? new Date() : null,
      tags: body.tags,
      updatedAt: new Date(),
    }).where(eq(posts.id, id)).returning();

    return new Response(JSON.stringify(updatedPost[0]), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = params.id;
    if (!id) return new Response('Missing id', { status: 400 });

    const db = getDb();
    await db.delete(posts).where(eq(posts.id, id));

    return new Response(null, { status: 204 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
