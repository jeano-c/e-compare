CREATE TABLE "user_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"snapshot" json,
	CONSTRAINT "user_likes_id_unique" UNIQUE("id")
);
