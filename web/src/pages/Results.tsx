import { ResultCard } from '../components/ResultCard';
import { Select } from '@/components/Select';
import { useState } from 'react';
import { generateMonths } from '@/utils/monthUtils';
import { Button } from '@/components/ui/button';
import { SearchIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { generateYears } from '@/utils/yearUtils';
import { useLoading } from '@/hooks/use-loading';
import { FetchMatchesParams } from '@/services/types';
import { useSearchParams } from 'react-router-dom';
import { ComboBox } from '@/components/ComboBox';

import { MatchStatus } from '@/enums/match_status';
import { fetchFilters, fetchMatches } from '@/services/match_service';

export function Results() {
  const years = generateYears();
  const months = generateMonths();

  const [searchParams, setSearchParams] = useSearchParams();
  const [{ status, order, year, month, league, team }, setFilter] = useState<FetchMatchesParams>({
    status: MatchStatus.FINISHED,
    order: 'DESC',
    year: searchParams.get('ano') || undefined,
    month: searchParams.get('mes') || undefined,
    league: searchParams.get('campeonato') || undefined,
    team: searchParams.get('time') || undefined
  });

  const { data: filters, fetchStatus: filterState } = useQuery({
    queryKey: ['filters'],
    queryFn: fetchFilters,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24
  })

  const { data: matches, fetchStatus: matchesState, refetch } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => await fetchMatches({ status, order, year, month, league, team })
  })

  useLoading([filterState, matchesState])

  const handleChange = (key: keyof FetchMatchesParams) => {
    return (value: string) => setFilter(prev => ({ ...prev, [key]: value }));
  }

  const handleSearch = () => {
    const params = {
      ...(year ? { ano: year } : {}),
      ...(month ? { mes: month } : {}),
      ...(league ? { campeonato: league } : {}),
      ...(team ? { time: team } : {})
    };

    refetch();
    setSearchParams(params);
  }

  return (
    <div className='container mx-auto py-12'>
      <div className='container mx-auto flex flex-row flex-wrap justify-center lg:justify-end gap-7 py-12'>
        <div className='w-21'>
          <Select
            data={years}
            placeholder='Ano'
            onChange={handleChange('year')}
            value={year || ''} />
        </div>

        <div className='w-21'>
          <Select
            data={months}
            placeholder='Mês'
            onChange={handleChange('month')}
            value={month || ''} />
        </div>

        <div className='w-47'>
          <ComboBox
            data={filters?.teams ?? []}
            placeholder='Times'
            onChange={handleChange('team')}
            value={team || ''}
          />
        </div>

        <div className='w-47'>
          <Select
            data={filters?.leagues ?? []}
            placeholder='Campeonato'
            onChange={handleChange('league')}
            value={league || ''} />
        </div>

        <Button
          size='icon'
          className='w-10 h-10 bg-red-500 text-white hover:bg-red-600 cursor-pointer'
          onClick={handleSearch}
        >
          <SearchIcon />
        </Button>
      </div>

      <div className={matches?.length ? 'container mx-auto grid grid-cols-(--auto-fill) gap-5 py-12' : 'flex flex-1 min-h-[60vh] items-center justify-center w-full py-24'}>
        {matches?.length ? 
          (
            matches.map(match => <ResultCard key={ match.id } { ...match } />)
          ) : 
          (
            <div className='flex flex-col items-center justify-center w-full'>  
              <span className='text-xl'>Nenhum jogo encontrado.</span>
            </div>
          )
        }
      </div>
    </div>
  );
}
