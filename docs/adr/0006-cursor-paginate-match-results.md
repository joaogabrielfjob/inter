# Cursor paginate Match Results

The Match Results API will continue a confirmed search with an opaque cursor for the final Match already returned, ordered by descending Match Day and then descending Match ID. Cursor pagination avoids duplicate or skipped Match Results when newly ingested Matches change the collection while a supporter is browsing; numeric offsets were rejected because their position shifts with those changes.
