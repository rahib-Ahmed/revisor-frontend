CREATE TYPE "public"."content_status" AS ENUM('uploading', 'processing', 'text_extracted', 'parsing', 'indexing', 'ready', 'failed');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('text', 'audio', 'pdf');--> statement-breakpoint
CREATE TABLE "content_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content_type" "content_type" NOT NULL,
	"status" "content_status" DEFAULT 'uploading' NOT NULL,
	"original_filename" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"title" text,
	"raw_text" text,
	"topics" text,
	"vocabulary" text,
	"grammar_points" text,
	"language" text,
	"chunk_count" integer,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;