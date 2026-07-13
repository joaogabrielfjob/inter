# Separate Goal Summary ingestion from results

Completed Match results are ingested before their Goal Summaries, which are retrieved in a separate following step from each Match's ESPN page. A Goal-page failure therefore records an Unavailable Goal Summary without preventing the final score from being stored, and later retries can resolve only unavailable entries.
