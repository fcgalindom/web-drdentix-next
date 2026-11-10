import { useState, useEffect } from 'react';
import { cityService } from '@/services';

interface City { id: number; name: string; department: string; }
export interface CityOption { value: string; label: string; }

export function useCities() {
  const [options, setOptions] = useState<CityOption[]>([]);

  useEffect(() => {
    cityService.list().then(({ data }) => {
      setOptions(
        (data as City[]).map((c) => ({
          value: c.name,
          label: `${c.name} (${c.department})`,
        }))
      );
    });
  }, []);

  return options;
}
