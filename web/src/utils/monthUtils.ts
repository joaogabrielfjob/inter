import { MONTHS } from '@/constants/monthRange';
import { Combo } from '@/types';

export const generateMonths = (): Combo[] => {
  return MONTHS.map((month, index) => ({
    value: (index + 1).toString(),
    label: month,
  }));
};