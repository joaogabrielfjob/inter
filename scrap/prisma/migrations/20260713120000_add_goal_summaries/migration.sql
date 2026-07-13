ALTER TABLE "match"
  ADD COLUMN "espn_match_id" INTEGER,
  ADD COLUMN "goal_summary_status" TEXT NOT NULL DEFAULT 'UNAVAILABLE';

CREATE UNIQUE INDEX "match_espn_match_id_key" ON "match"("espn_match_id");

CREATE TABLE "goal" (
  "id" SERIAL NOT NULL,
  "match_id" INTEGER NOT NULL,
  "scorer" TEXT NOT NULL,
  "minute" TEXT NOT NULL,
  "team_side" TEXT NOT NULL,
  "marker" TEXT,
  CONSTRAINT "goal_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "goal_match_id_idx" ON "goal"("match_id");

ALTER TABLE "goal"
  ADD CONSTRAINT "goal_match_id_fkey"
  FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
