import { Button } from '@/components/ui/button';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { SearchIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams, type SetURLSearchParams } from 'react-router-dom';
import { ComboBox } from './ComboBox';
import { ResultCard } from './ResultCard';
import { Select } from './Select';
import { fetchMatchResults, fetchMatchResultsFilters } from './matchResultsApi';
import { isMatchResultsSearch, parseMatchResultsSearch, toMatchResultsSearchParams, type MatchResultsSearch } from './matchResultsSearch';

const unfilteredSearch: MatchResultsSearch = {};

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
  const [previousConfirmedSearch, setPreviousConfirmedSearch] = useState(confirmedSearch);
  const [draftSearch, setDraftSearch] = useState<MatchResultsSearch>(confirmedSearch);

  if (confirmedSearch !== previousConfirmedSearch) {
    setPreviousConfirmedSearch(confirmedSearch);
    setDraftSearch(confirmedSearch);
  }

  const filtersQuery = useQuery({
    queryKey: ['match-results-filters'],
    queryFn: fetchMatchResultsFilters,
  });
  const resultsQuery = useQuery({
    queryKey: ['match-results', confirmedSearch],
    queryFn: () => fetchMatchResults(confirmedSearch),
    placeholderData: keepPreviousData,
  });

  if (filtersQuery.isError || resultsQuery.isError) {
    return <RequestError onRetry={() => void Promise.all([filtersQuery.refetch(), resultsQuery.refetch()])} />;
  }

  if (filtersQuery.isPending || resultsQuery.isPending) {
    return <Loading />;
  }

  const matches = resultsQuery.data ?? [];
  const filters = filtersQuery.data;

  const updateDraft = (key: keyof MatchResultsSearch) => (value: string) => {
    setDraftSearch((current) => ({ ...current, [key]: value || undefined }));
  };
  const search = () => setSearchParams(toMatchResultsSearchParams(draftSearch));
  const clear = () => {
    setDraftSearch(unfilteredSearch);
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
        <Button variant='outline' size='lg' className='cursor-pointer' onClick={clear}>Limpar filtros</Button>
        <Button aria-label='Buscar resultados' size='icon' className='h-10 w-10 cursor-pointer bg-red-500 text-white hover:bg-red-600' onClick={search}>
          <SearchIcon />
        </Button>
      </div>

      {resultsQuery.isFetching && <p className='text-center text-sm text-muted-foreground'>Buscando resultados…</p>}

      <div className={matches.length ? 'container mx-auto grid grid-cols-(--auto-fill) gap-5 py-12' : 'flex min-h-[60vh] w-full flex-1 items-center justify-center py-24'}>
        {matches.length ? matches.map((match) => <ResultCard key={match.id} {...match} />) : (
          <div className='flex flex-col items-center justify-center gap-4'>
            <span className='text-xl'>Nenhum jogo encontrado.</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Loading() {
  return <div className='flex min-h-[60vh] items-center justify-center'><p className='text-xl'>Buscando resultados…</p></div>;
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
