import { pgTable, text, timestamp, uuid, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

// Projects table
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  content: text('content'), // Detailed markdown content
  coverImage: text('cover_image'),
  demoUrl: text('demo_url'),
  githubUrl: text('github_url'),
  year: text('year'),
  featured: boolean('featured').default(false).notNull(),
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Blog Posts table
export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(), // Raw Markdown/HTML
  coverImage: text('cover_image'),
  published: boolean('published').default(false).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Tech Stack table
export const techStack = pgTable('tech_stack', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // e.g. "Frontend", "Backend", "Database", "DevOps"
  icon: text('icon'), // Icon identifier or SVG URL
  proficiency: integer('proficiency'), // 1-100 optional
  featured: boolean('featured').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Experience table
export const experiences = pgTable('experiences', {
  id: uuid('id').defaultRandom().primaryKey(),
  company: text('company').notNull(),
  role: text('role').notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  isCurrent: boolean('is_current').default(false).notNull(),
  description: text('description'), // TipTap HTML content
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const insertExperienceSchema = createInsertSchema(experiences);

// Products table (similar to projects + visitors)
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  content: text('content'), // Detailed markdown/HTML content
  coverImage: text('cover_image'),
  demoUrl: text('demo_url'),
  githubUrl: text('github_url'),
  year: text('year'),
  visitors: integer('visitors').default(0).notNull(),
  featured: boolean('featured').default(false).notNull(),
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
