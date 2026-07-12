import { Match } from '@/types';
import { formatMatchDay } from '@/utils/formatMatchDay';

export type ResultCardProps = Match

export function ResultCard({ matchDay, home, homeScore, homeEmblem, away, awayScore, awayEmblem, league }: ResultCardProps) {
  const isHome = home === 'Internacional';
  const colors = isHome ? 'bg-red-500 text-white' : 'bg-white';
  const stadium = isHome ? 'Estádio Beira-Rio' : 'Fora de casa';

  return (
    <div className={`flex flex-col h-full shadow-lg shadow-red-500/50 rounded-lg gap-7 ${colors}`}>
      <header className='flex items-center p-4 gap-1'>
        <span className='pb-1'>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='currentColor' className='size-4'>
            <path fillRule='evenodd' d='M12 1.69a.494.494 0 0 0-.438-.494 32.352 32.352 0 0 0-7.124 0A.494.494 0 0 0 4 1.689v.567c-.811.104-1.612.24-2.403.406a.75.75 0 0 0-.595.714 4.5 4.5 0 0 0 4.35 4.622A3.99 3.99 0 0 0 7 8.874V10H6a1 1 0 0 0-1 1v2h-.667C3.597 13 3 13.597 3 14.333c0 .368.298.667.667.667h8.666a.667.667 0 0 0 .667-.667c0-.736-.597-1.333-1.333-1.333H11v-2a1 1 0 0 0-1-1H9V8.874a3.99 3.99 0 0 0 1.649-.876 4.5 4.5 0 0 0 4.35-4.622.75.75 0 0 0-.596-.714A30.897 30.897 0 0 0 12 2.256v-.567ZM4 3.768c-.49.066-.976.145-1.458.235a3.004 3.004 0 0 0 1.64 2.192A3.999 3.999 0 0 1 4 5V3.769Zm8 0c.49.066.976.145 1.458.235a3.004 3.004 0 0 1-1.64 2.192C11.936 5.818 12 5.416 12 5V3.769Z' clipRule='evenodd' />
          </svg>
        </span>

        <p className='capitalize'>{league.toLowerCase()}</p>
      </header>

      <main className='flex'>
        <div className='flex m-auto flex-col w-20 h-17 items-center'>
          <img src={homeEmblem} className='h-12' />
          <p className='text-center text-base/3 pt-2'>{home}</p>
        </div>

        <div className='flex m-auto flex-col items-center pt-2 font-light'>
          <div className='flex justify-between'>
            <p className='w-1/3 text-left text-2xl font-bold'>{homeScore}</p>
            <p className='flex-1 whitespace-nowrap px-3 pt-1.5 text-center text-sm uppercase'>X</p>
            <p className='w-1/3 text-right text-2xl font-bold'>{awayScore}</p>
          </div>
          <p className='h-4'>{formatMatchDay(matchDay)}</p>
        </div>

        <div className='flex m-auto flex-col w-20 h-17 items-center'>
          <img src={awayEmblem} className='h-12' />
          <p className='text-center text-base/4 pt-2'>{away}</p>
        </div>
      </main>

      <footer className='flex items-center p-4 gap-1 mt-auto'>
        <span className='pb-1'>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='currentColor' className='size-4'>
            <path fillRule='evenodd' d='m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 7c0 2.255 1.19 4.235 2.292 5.597a15.591 15.591 0 0 0 2.046 2.082 8.916 8.916 0 0 0 .189.153l.012.01ZM8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z' clipRule='evenodd' />
          </svg>
        </span>

        <p>{stadium}</p>
      </footer>
    </div>
  );
}
