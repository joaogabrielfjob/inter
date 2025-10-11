import { useEffect } from 'react';
import nProgress from 'nprogress';
import { FetchStatus } from '@tanstack/react-query';

import 'nprogress/nprogress.css';

nProgress.configure({ showSpinner: false, speed: 500 });

export function useLoading(states: FetchStatus[]) {
  useEffect(() => {
    if (states.every(state => state === 'idle')) {
      nProgress.done();
      return;
    }
    
    nProgress.start();
  }, [states]);
};
