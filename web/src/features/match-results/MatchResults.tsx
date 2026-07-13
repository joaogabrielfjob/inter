import { Button } from '@/components/ui/button';
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { LoaderCircle, SearchIcon } from 'lucide-react';
import { useEffect, useMemo, useReducer, useRef } from 'react';
import { useSearchParams, type SetURLSearchParams } from 'react-router-dom';
import { ComboBox } from './ComboBox';
import { ResultCard } from './ResultCard';
import { Select } from './Select';
import { fetchMatchResults, fetchMatchResultsFilters } from './matchResultsApi';
import { isMatchResultsSearch, parseMatchResultsSearch, toMatchResultsSearchParams, type MatchResultsSearch } from './matchResultsSearch';

const unfilteredSearch: MatchResultsSearch = {};

type DraftSearchAction =
  | { type: 'filter-changed'; key: keyof MatchResultsSearch; value: string }
  | { type: 'filters-cleared' }
  | { type: 'confirmed-search-changed'; search: MatchResultsSearch };

function draftSearchReducer(
  draftSearch: MatchResultsSearch,
  action: DraftSearchAction,
): MatchResultsSearch {
  switch (action.type) {
    case 'filter-changed':
      return { ...draftSearch, [action.key]: action.value || undefined };
    case 'filters-cleared':
      return unfilteredSearch;
    case 'confirmed-search-changed':
      return action.search;
  }
}

export function MatchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const confirmedSearch = useMemo(() => parseMatchResultsSearch(searchParams), [searchParams]);

  if (!isMatchResultsSearch(confirmedSearch)) {
    return <InvalidSearch onClear={() => setSearchParams({})} />;
  }

  return (
    <MatchResultsContent
      confirmedSearch={confirmedSearch}
      setSearchParams={setSearchParams}
    />
  );
}

type MatchResultsContentProps = {
  confirmedSearch: MatchResultsSearch;
  setSearchParams: SetURLSearchParams;
};

function MatchResultsContent({ confirmedSearch, setSearchParams }: MatchResultsContentProps) {
  const [draftSearch, dispatchDraftSearch] = useReducer(draftSearchReducer, confirmedSearch);
  const previousSearchRef = useRef(confirmedSearch);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatchDraftSearch({ type: 'confirmed-search-changed', search: confirmedSearch });
  }, [confirmedSearch]);

  const filtersQuery = useQuery({
    queryKey: ['match-results-filters'],
    queryFn: fetchMatchResultsFilters,
  });
  const resultsQuery = useInfiniteQuery({
    queryKey: ['match-results', confirmedSearch],
    queryFn: ({ pageParam }) => fetchMatchResults(confirmedSearch, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: keepPreviousData,
  });
  const { fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } = resultsQuery;
  const isSearchLoading = resultsQuery.isFetching && !isFetchingNextPage;

  useEffect(() => {
    if (previousSearchRef.current !== confirmedSearch) window.scrollTo({ top: 0 });
    previousSearchRef.current = confirmedSearch;
  }, [confirmedSearch]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage || isFetchingNextPage || isFetchNextPageError) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void fetchNextPage();
    }, { rootMargin: '0px 0px 100%' });
    observer.observe(target);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError]);

  if (filtersQuery.isError) {
    return <RequestError onRetry={() => void Promise.all([filtersQuery.refetch(), resultsQuery.refetch()])} />;
  }

  const matches = resultsQuery.data?.pages.flatMap((page) => page.matches) ?? [];
  const filters = filtersQuery.data ?? { years: [], months: [], teams: [], leagues: [] };
  const isSearchError = resultsQuery.isError && !isFetchNextPageError;

  const updateDraft = (key: keyof MatchResultsSearch) => (value: string) => {
    dispatchDraftSearch({ type: 'filter-changed', key, value });
  };
  const search = () => setSearchParams(toMatchResultsSearchParams(draftSearch));
  const clear = () => {
    dispatchDraftSearch({ type: 'filters-cleared' });
    setSearchParams({});
  };

  return (
    <div className='container mx-auto py-12'>
      <div className='container mx-auto flex flex-row flex-wrap justify-center gap-7 py-12 lg:justify-end'>
        <div className='w-21'>
          <Select data={filters.years} placeholder='Ano' value={draftSearch.year ?? ''} onChange={updateDraft('year')} />
        </div>
        <div className='w-28'>
          <Select data={filters.months} placeholder='Mês' value={draftSearch.month ?? ''} onChange={updateDraft('month')} />
        </div>
        <div className='w-51'>
          <ComboBox data={filters.teams} placeholder='Times' value={draftSearch.team ?? ''} onChange={updateDraft('team')} />
        </div>
        <div className='w-57'>
          <Select data={filters.leagues} placeholder='Campeonato' value={draftSearch.league ?? ''} onChange={updateDraft('league')} />
        </div>
        <Button variant='outline' size='lg' className='cursor-pointer' onClick={clear} disabled={isSearchLoading}>Limpar filtros</Button>
        <Button aria-label='Buscar resultados' aria-busy={isSearchLoading} size='icon' className='h-10 w-10 cursor-pointer bg-red-500 text-white hover:bg-red-600' onClick={search} disabled={isSearchLoading}>
          {isSearchLoading ? <LoaderCircle className='animate-spin' /> : <SearchIcon />}
        </Button>
      </div>

      {isSearchError ? <RequestError onRetry={() => void resultsQuery.refetch()} /> : (
        <>
          <div className={matches.length ? 'container mx-auto grid grid-cols-(--auto-fill) gap-5 py-12' : 'flex min-h-[60vh] w-full flex-1 items-center justify-center py-24'}>
            {matches.length ? matches.map((match) => <ResultCard key={match.id} {...match} />) : (
              !resultsQuery.isPending && <div className='flex flex-col items-center justify-center gap-4'>
                  <span className='text-xl'>Nenhum jogo encontrado.</span>
                </div>
            )}
          </div>
          {matches.length > 0 && !resultsQuery.hasNextPage && <p className='pb-12 text-center text-sm text-muted-foreground'>Todos os resultados foram carregados.</p>}
          {resultsQuery.isFetchNextPageError && (
            <div className='flex flex-col items-center gap-3 pb-12'>
              <p className='text-sm text-muted-foreground'>Não foi possível carregar mais resultados.</p>
              <Button variant='outline' onClick={() => void resultsQuery.fetchNextPage()}>Tentar novamente</Button>
            </div>
          )}
          {resultsQuery.hasNextPage && <div ref={loadMoreRef} aria-hidden='true' />}
        </>
      )}
    </div>
  );
}

function InvalidSearch({ onClear }: { onClear: () => void }) {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24'>
      <p className='text-xl'>Link de busca inválido.</p>
      <Button onClick={onClear}>Limpar filtros</Button>
    </div>
  );
}

function RequestError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24'>
      <p className='text-xl'>Não foi possível carregar os resultados.</p>
      <Button onClick={onRetry}>Tentar novamente</Button>
    </div>
  );
}
