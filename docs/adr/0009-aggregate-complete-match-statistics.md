# Aggregate complete Match Statistics

Match Statistics will be calculated on the server from every completed Match selected by a Match Statistics Search, without cursor pagination. This keeps a Performance Summary complete and correct even though Match Results are cursor-paginated for browsing; fetching or aggregating only the browser's loaded Results batches was rejected because it would silently produce partial statistics.
