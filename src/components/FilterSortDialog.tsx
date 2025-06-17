import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { FilterControls } from './FilterControls';
import { Filter } from 'lucide-react';
import { Category } from '@/types/session';
import { DateRange } from 'react-day-picker';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';

interface FilterSortDialogProps {
  selectedType: string;
  setSelectedType: (value: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  category: Category;
  buttonWidth?: string;
}

export function FilterSortDialog({
  selectedType,
  setSelectedType,
  dateRange,
  setDateRange,
  sortBy,
  setSortBy,
  category,
  buttonWidth = 'w-full',
}: FilterSortDialogProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
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