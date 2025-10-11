import { Combo } from '@/types';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, Command } from '@/components/ui/command';

export type ComboBoxProps = {
  data: Combo[];
  placeholder: string;
  value?: string;
  onChange: (value: string) => void;
}

export function ComboBox({ data, placeholder, value, onChange }: ComboBoxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className='w-full h-10'
        clearable={!!value}
        onClear={() => onChange('')}
      >
        <span 
          className={cn(
            "pt-0.5",
            !value ? "pointer-events-none text-muted-foreground" : ""
          )}
        >
          {data.find((d) => d.value === value)?.label ?? placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-47">
        <Command>
          <CommandInput placeholder="Pesquise um time..." />
          <CommandList>
            <CommandEmpty>Nenhum time encontrado.</CommandEmpty>
            <CommandGroup>
              {data.map((d) => (
                <CommandItem
                  key={d.value}
                  value={d.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue)
                    setOpen(false)
                  }}
                >
                  {d.label}
                  <Check
                    className={cn(
                      "ml-auto size-4 text-red-500",
                      value === d.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}