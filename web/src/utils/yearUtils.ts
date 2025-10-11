import { YEARS } from '@/constants/yearRange';
import { Combo } from '@/types';

export const generateYears = (): Combo[] => {
  return YEARS.map((year) => ({
    value: year,
    label: year,
  }));
};