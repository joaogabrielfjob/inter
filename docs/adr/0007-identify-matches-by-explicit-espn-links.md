# Identify Matches by explicit ESPN links

The ESPN ingestion boundary will retain the numeric ESPN Match ID from each result's explicit Match link. Goal Summary ingestion runs separately after result ingestion and uses that ID to retrieve the exact Match page and retry unavailable Goal Summaries without rediscovering the Match from mutable names or dates.
