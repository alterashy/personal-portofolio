import type { APIRoute } from 'astro';
import { createDbClient, posts } from '@portfolio/db';
import { desc } from 'drizzle-orm';

export const prerender = false;

function getDb() {
  const dbUrl = import.meta.env.DATABASE_URL || process.env.DATABASE_URL || '';
  return createDbClient(dbUrl);
}

export const GET: APIRoute = async () => {
  try {
    const db = getDb();
    const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));
    return new Response(JSON.stringify(allPosts), {
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

    const newPost = await db.insert(posts).values({
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      excerpt: body.excerpt || '',
      content: body.content,
      coverImage: body.coverImage || null,
      published: body.published ?? false,
      publishedAt: body.published ? new Date() : null,
      tags: body.tags || [],
    }).returning();

    return new Response(JSON.stringify(newPost[0]), { status: 201 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
