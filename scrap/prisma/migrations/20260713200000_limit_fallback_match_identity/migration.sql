DROP INDEX "match_home_team_id_away_team_id_date_key";

CREATE UNIQUE INDEX "match_home_team_id_away_team_id_date_without_espn_match_id_key"
ON "match"("home_team_id", "away_team_id", "date")
WHERE "espn_match_id" IS NULL;
