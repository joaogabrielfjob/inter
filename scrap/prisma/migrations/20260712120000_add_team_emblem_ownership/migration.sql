CREATE TABLE "team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "espn_team_id" INTEGER,
    "aliases" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "team_emblem" (
    "id" SERIAL NOT NULL,
    "team_id" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "content_hash" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "replaced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "team_emblem_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "match" ADD COLUMN "home_team_id" INTEGER;
ALTER TABLE "match" ADD COLUMN "away_team_id" INTEGER;

CREATE UNIQUE INDEX "team_name_key" ON "team"("name");
CREATE UNIQUE INDEX "team_espn_team_id_key" ON "team"("espn_team_id");
CREATE UNIQUE INDEX "team_emblem_path_key" ON "team_emblem"("path");
CREATE INDEX "team_emblem_team_id_is_current_idx" ON "team_emblem"("team_id", "is_current");
CREATE INDEX "team_emblem_is_current_replaced_at_idx" ON "team_emblem"("is_current", "replaced_at");

ALTER TABLE "team_emblem" ADD CONSTRAINT "team_emblem_team_id_fkey"
  FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "match" ADD CONSTRAINT "match_home_team_id_fkey"
  FOREIGN KEY ("home_team_id") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "match" ADD CONSTRAINT "match_away_team_id_fkey"
  FOREIGN KEY ("away_team_id") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
