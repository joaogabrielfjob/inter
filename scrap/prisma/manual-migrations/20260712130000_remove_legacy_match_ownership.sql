-- Run only after `bun run backfill:teams` reports no unresolved records.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "match" WHERE "home_team_id" IS NULL OR "away_team_id" IS NULL) THEN
    RAISE EXCEPTION 'Run the Team backfill and resolve its report before removing legacy Match ownership fields.';
  END IF;
END $$;

DROP INDEX "match_home_away_date_key";
ALTER TABLE "match" ALTER COLUMN "home_team_id" SET NOT NULL;
ALTER TABLE "match" ALTER COLUMN "away_team_id" SET NOT NULL;
ALTER TABLE "match" DROP COLUMN "home";
ALTER TABLE "match" DROP COLUMN "away";
ALTER TABLE "match" DROP COLUMN "home_emblem";
ALTER TABLE "match" DROP COLUMN "away_emblem";
CREATE UNIQUE INDEX "match_home_team_id_away_team_id_date_key" ON "match"("home_team_id", "away_team_id", "date");
