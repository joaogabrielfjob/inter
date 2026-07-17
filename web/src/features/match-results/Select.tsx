import { Select as UISelect, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combo } from '@/types';
import { useState } from 'react';

export type SelectProps = {
  data: Combo[];
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export function Select({ data, placeholder, value, onChange }: SelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <UISelect onValueChange={onChange} value={value} onOpenChange={setOpen} open={open}>
      <SelectTrigger
        className='w-full'
        aria-label={placeholder}
        clearable={!!value}
        onClear={() => onChange('')}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {data.map(d => (
            <SelectItem key={d.value} value={d.value}>
              {d.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </UISelect>
  );
}
