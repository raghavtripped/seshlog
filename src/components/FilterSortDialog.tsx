// /src/components/FilterSortDialog.tsx

import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { FilterControls } from './FilterControls';
import { Filter } from 'lucide-react';
import { Category } from '@/types/session';
import { DateRange } from 'react-day-picker';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, Dispatch, SetStateAction } from 'react';

// --- Generic Props Interface ---
// We use a generic type 'T' which will represent the specific union of session types
// (e.g., CigSessionType | 'All').
interface FilterSortDialogProps<T> {
  selectedType: T;
  // FIX: Use the generic type 'T' instead of 'any' for full type safety.
  setSelectedType: Dispatch<SetStateAction<T>>;
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  category: Category;
  buttonWidth?: string;
}

// The component is now generic, accepting a type 'T' that must be a string.
export function FilterSortDialog<T extends string>({
  selectedType,
  setSelectedType,
  dateRange,
  setDateRange,
  sortBy,
  setSortBy,
  category,
  buttonWidth = 'w-full',
}: FilterSortDialogProps<T>) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  // The handlers now work with the generic type T.
  // We cast `value` to `T` because FilterControls will pass a string,
  // and we trust it's a valid value of type T.
  const handleTypeChange = (value: string) => {
    setSelectedType(value as T);
    setOpen(false);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setOpen(false);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={`flex items-center justify-center gap-2 text-lg font-semibold py-5 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 transition-all duration-200 ${buttonWidth}`}
          size={isMobile ? 'lg' : 'lg'}
        >
          <Filter className="w-6 h-6" />
          Filter & Sort
        </Button>
      </DialogTrigger>
      <DialogContent size={isMobile ? 'lg' : 'md'} mobile={isMobile} className="p-0 bg-transparent border-none shadow-none">
        <div className="bg-background rounded-lg p-4 sm:p-8 max-h-[80vh] overflow-y-auto">
          <FilterControls
            selectedType={selectedType}
            setSelectedType={handleTypeChange}
            dateRange={dateRange}
            setDateRange={handleDateRangeChange}
            sortBy={sortBy}
            setSortBy={handleSortChange}
            category={category}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}