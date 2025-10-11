-- CreateTable
CREATE TABLE "match" (
    "id" SERIAL NOT NULL,
    "home" TEXT NOT NULL,
    "home_score" INTEGER NOT NULL,
    "home_emblem" TEXT NOT NULL,
    "away" TEXT NOT NULL,
    "away_score" INTEGER NOT NULL,
    "away_emblem" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "league" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "match_home_away_date_key" ON "match"("home", "away", "date");
