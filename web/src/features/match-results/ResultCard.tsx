import { useState } from 'react';
import { Match } from '@/types';
import { formatMatchDay } from '@/utils/formatMatchDay';
import { TeamEmblem } from '@/components/TeamEmblem';

export type ResultCardProps = Match

export function ResultCard(props: ResultCardProps) {
  const [showGoals, setShowGoals] = useState(false);
  const isHome = props.home === 'Internacional';
  const colors = isHome ? 'bg-red-500 text-white' : 'bg-white';
  const match = { ...props, goalSummary: props.goalSummary ?? { status: 'UNAVAILABLE' as const, goals: [] } };

  return (
    <div className='h-66 [perspective:1000px]'>
      {showGoals
        ? <GoalSummaryFace {...match} colors={colors} onShowResult={() => setShowGoals(false)} />
        : <ResultFace {...match} colors={colors} onShowGoals={() => setShowGoals(true)} />}
    </div>
  );
}

function ResultFace({ matchDay, home, homeScore, homeEmblem, away, awayScore, awayEmblem, league, colors, onShowGoals }: ResultCardProps & { colors: string; onShowGoals: () => void }) {
  const stadium = home === 'Internacional' ? 'Estádio Beira-Rio' : 'Fora de casa';

  return (
    <div className={`flex h-full animate-[goal-card-flip_300ms_ease-in-out] flex-col gap-7 rounded-lg p-0 shadow-lg shadow-red-500/50 motion-reduce:animate-none ${colors}`}>
      <header className='flex items-center justify-between p-4'>
        <p className='capitalize'>{league.toLowerCase()}</p>
        <button type='button' className='cursor-pointer text-sm underline underline-offset-4' onClick={onShowGoals}>Ver gols</button>
      </header>
      <main className='flex'>
        <Team name={home} emblem={homeEmblem} />
        <div className='m-auto flex flex-col items-center pt-2 font-light'>
          <div className='flex justify-between'>
            <p className='w-1/3 text-left text-2xl font-bold'>{homeScore}</p>
            <p className='flex-1 whitespace-nowrap px-3 pt-1.5 text-center text-sm uppercase'>X</p>
            <p className='w-1/3 text-right text-2xl font-bold'>{awayScore}</p>
          </div>
          <p className='h-4'>{formatMatchDay(matchDay)}</p>
        </div>
        <Team name={away} emblem={awayEmblem} />
      </main>
      <footer className='mt-auto p-4'>{stadium}</footer>
    </div>
  );
}

function GoalSummaryFace({ home, homeScore, homeEmblem, away, awayScore, awayEmblem, goalSummary, colors, onShowResult }: ResultCardProps & { colors: string; onShowResult: () => void }) {
  const homeGoals = goalSummary.goals.filter((goal) => goal.team === 'HOME');
  const awayGoals = goalSummary.goals.filter((goal) => goal.team === 'AWAY');
  const isScoreless = goalSummary.status === 'VERIFIED' && homeScore === 0 && awayScore === 0;

  return (
    <div className={`flex h-full animate-[goal-card-flip_300ms_ease-in-out] flex-col rounded-lg p-4 shadow-lg shadow-red-500/50 motion-reduce:animate-none ${colors}`}>
      <header className='flex justify-end'>
        <button type='button' className='cursor-pointer text-sm underline underline-offset-4' onClick={onShowResult}>Voltar ao resultado</button>
      </header>
      <main className='flex flex-1 flex-col pt-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='flex flex-col items-start'><SmallTeam name={home} emblem={homeEmblem} /><GoalList goals={homeGoals} /></div>
          <div className='flex flex-col items-end text-right'><SmallTeam name={away} emblem={awayEmblem} /><GoalList goals={awayGoals} away /></div>
        </div>
        {isScoreless && <p className='m-auto text-center'>Sem gols na partida</p>}
        {goalSummary.status === 'UNAVAILABLE' && <p className='m-auto text-center'>Não foi possível encontrar os gols desta partida</p>}
      </main>
    </div>
  );
}

function Team({ name, emblem }: { name: string; emblem?: string }) {
  return <div className='m-auto flex h-24 w-20 flex-col items-center'><TeamEmblem src={emblem} name={name} /><p className='pt-2 text-center text-base/5'>{name}</p></div>;
}

function SmallTeam({ name, emblem }: { name: string; emblem?: string }) {
  return <TeamEmblem src={emblem} name={name} className='h-10' />;
}

function GoalList({ goals, away = false }: { goals: ResultCardProps['goalSummary']['goals']; away?: boolean }) {
  return <ul className='mt-4 space-y-1 text-sm'>{goals.map((goal, index) => <li key={`${goal.scorer}-${goal.minute}-${index}`} className='whitespace-nowrap'>{away ? `${goal.minute} — ${goal.scorer}${goal.marker ? ` (${goal.marker})` : ''}` : `${goal.scorer}${goal.marker ? ` (${goal.marker})` : ''} — ${goal.minute}`}</li>)}</ul>;
}
