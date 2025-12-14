import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  display_name: text('display_name'),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Enums for content_items table
export const contentTypeEnum = pgEnum('content_type', ['text', 'audio', 'pdf', 'video']);
export const contentStatusEnum = pgEnum('content_status', [
  'uploading',
  'processing',
  'text_extracted',
  'parsing',
  'indexing',
  'ready',
  'failed',
]);

export const contentItems = pgTable('content_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content_type: contentTypeEnum('content_type').notNull(),
  status: contentStatusEnum('status').notNull().default('uploading'),
  original_filename: text('original_filename').notNull(),
  file_path: text('file_path').notNull(),
  file_size: integer('file_size').notNull(),
  mime_type: text('mime_type').notNull(),
  title: text('title'),
  raw_text: text('raw_text'),
  topics: text('topics'),
  vocabulary: text('vocabulary'),
  grammar_points: text('grammar_points'),
  language: text('language'),
  chunk_count: integer('chunk_count'),
  error_message: text('error_message'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
