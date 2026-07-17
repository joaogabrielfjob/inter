import { useEffect, useMemo, useReducer } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { fetchPerformanceSummary } from './matchStatisticsApi';
import { parseMatchStatisticsSearch, toMatchStatisticsSearchParams, type MatchStatisticsSearch } from './matchStatisticsSearch';
import { fetchMatchResultsFilters } from '@/features/match-results/matchResultsApi';
import { Select } from '@/features/match-results/Select';
import { ComboBox } from '@/features/match-results/ComboBox';
import { Button } from '@/components/ui/button';
import { LoaderCircle, SearchIcon } from 'lucide-react';

export function MatchStatistics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = useMemo(() => parseMatchStatisticsSearch(searchParams), [searchParams]);

  if (!search) return <InvalidSearch onClear={() => setSearchParams({})} />;
  return <MatchStatisticsContent confirmedSearch={search} setSearchParams={setSearchParams} />;
}

type MatchStatisticsContentProps = {
  confirmedSearch: MatchStatisticsSearch;
  setSearchParams: ReturnType<typeof useSearchParams>[1];
};

type DraftAction =
  | { type: 'filter-changed'; key: keyof MatchStatisticsSearch; value: string }
  | { type: 'confirmed-search-changed'; search: MatchStatisticsSearch };

function draftReducer(draft: MatchStatisticsSearch, action: DraftAction): MatchStatisticsSearch {
  if (action.type === 'confirmed-search-changed') return action.search;
  return { ...draft, [action.key]: action.value || undefined };
}

function MatchStatisticsContent({ confirmedSearch, setSearchParams }: MatchStatisticsContentProps) {
  const [draftSearch, dispatchDraft] = useReducer(draftReducer, confirmedSearch);
  const filtersQuery = useQuery({ queryKey: ['match-statistics-filters'], queryFn: fetchMatchResultsFilters });
  const summaryQuery = useQuery({
    queryKey: ['match-statistics', confirmedSearch],
    queryFn: () => fetchPerformanceSummary(confirmedSearch),
  });

  useEffect(() => {
    dispatchDraft({ type: 'confirmed-search-changed', search: confirmedSearch });
  }, [confirmedSearch]);

  const filters = filtersQuery.data ?? { years: [], months: [], teams: [], leagues: [] };
  const isLoading = summaryQuery.isFetching;
  const updateDraft = (key: keyof MatchStatisticsSearch) => (value: string) => dispatchDraft({ type: 'filter-changed', key, value });
  const search = () => setSearchParams(toMatchStatisticsSearchParams(draftSearch));
  const clear = () => setSearchParams({});

  const summary = summaryQuery.data;

  return (
    <div className='container mx-auto py-12'>
      <div className='flex flex-row flex-wrap justify-center gap-7 py-12 lg:justify-end'>
        <div className='w-21'><Select data={filters.years} placeholder='Ano' value={draftSearch.year ?? ''} onChange={updateDraft('year')} /></div>
        <div className='w-28'><Select data={filters.months} placeholder='Mês' value={draftSearch.month ?? ''} onChange={updateDraft('month')} /></div>
        <div className='w-51'><ComboBox data={filters.teams} placeholder='Times' value={draftSearch.team ?? ''} onChange={updateDraft('team')} /></div>
        <div className='w-57'><Select data={filters.leagues} placeholder='Campeonato' value={draftSearch.league ?? ''} onChange={updateDraft('league')} /></div>
        <Button variant='outline' size='lg' onClick={clear} disabled={isLoading}>Limpar filtros</Button>
        <Button aria-label='Buscar estatísticas' aria-busy={isLoading} size='icon' className='h-10 w-10 cursor-pointer bg-red-500 text-white hover:bg-red-600' onClick={search} disabled={isLoading}>
          {isLoading ? <LoaderCircle className='animate-spin' /> : <SearchIcon />}
        </Button>
      </div>
      <p className='mb-6 text-sm text-muted-foreground'>Cobertura dos dados: de 2020 até o presente.</p>
      {filtersQuery.isError || summaryQuery.isError ? (
        <RequestError onRetry={() => void Promise.all([filtersQuery.refetch(), summaryQuery.refetch()])} />
      ) : summary ? <SummaryCards summary={summary} /> : <div aria-label='Carregando estatísticas' />}
    </div>
  );
}

function SummaryCards({ summary }: { summary: Awaited<ReturnType<typeof fetchPerformanceSummary>> }) {
  const cards = [
    ['Partidas jogadas', String(summary.matchesPlayed)],
    ['Vitórias, empates e derrotas', `${summary.wins} / ${summary.draws} / ${summary.losses}`],
    ['Gols marcados', String(summary.goalsScored)],
    ['Gols sofridos', String(summary.goalsConceded)],
    ['Saldo de gols', String(summary.goalDifference)],
    ['Taxa de vitórias', `${summary.winRate.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`],
    ['Jogos sem sofrer gols', String(summary.cleanSheets)],
  ];

  return <section aria-label='Resumo de desempenho'><div className='grid grid-cols-(--auto-fill) gap-5'>{cards.map(([label, value]) => <article key={label} className='rounded-lg border bg-card p-6 shadow-sm'><h2 className='text-sm text-muted-foreground'>{label}</h2><p className='mt-2 text-3xl font-semibold'>{value}</p></article>)}</div></section>;
}

function InvalidSearch({ onClear }: { onClear: () => void }) {
  return <div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24'><p className='text-xl'>Link de busca inválido.</p><Button onClick={onClear}>Limpar filtros</Button></div>;
}

function RequestError({ onRetry }: { onRetry: () => void }) {
  return <div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24'><p className='text-xl'>Não foi possível carregar as estatísticas.</p><Button onClick={onRetry}>Tentar novamente</Button></div>;
}
