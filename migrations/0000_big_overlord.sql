CREATE TABLE "user_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"snapshot" json,
	CONSTRAINT "user_likes_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "comparison_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"search_id" uuid NOT NULL,
	"snapshot" json NOT NULL,
	"screen_shot" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "comparison_table_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "recommendation_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comparison_id" uuid,
	"ai_recommendation" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "recommendation_table_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "search_tb" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"query" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "search_tb_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "comparison_table" ADD CONSTRAINT "comparison_table_search_id_search_tb_id_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search_tb"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendation_table" ADD CONSTRAINT "recommendation_table_comparison_id_comparison_table_id_fk" FOREIGN KEY ("comparison_id") REFERENCES "public"."comparison_table"("id") ON DELETE cascade ON UPDATE no action;