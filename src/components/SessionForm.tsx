// /src/components/SessionForm.tsx

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Session, SessionType, Category, LiquorServingSize } from "@/types/session";
import { Plus, Minus, Star } from "lucide-react";
import { useSessions } from "@/hooks/useSessions";
import { useToast } from "@/components/ui/use-toast"; // Corrected import path for shadcn/ui

// --- Props Interface ---
interface SessionFormProps {
  category: Category;
  initialSession?: Session;
  onFormClose: () => void;
  onSessionAdded?: () => void;
  onSessionUpdated?: () => void;
}

// --- Helper Functions (Static, outside the component) ---
const getLiquorServingSizes = (): Array<{ value: LiquorServingSize; label: string; ml: number }> => [
  { value: '30ml (Shot)', label: '🥃 30ml (Shot)', ml: 30 },
  { value: '60ml (Double Shot)', label: '🥃 60ml (Double Shot)', ml: 60 },
  { value: '150ml (Wine Glass)', label: '🍷 150ml (Wine Glass)', ml: 150 },
  { value: '330ml (Beer Bottle)', label: '🍺 330ml (Beer Bottle)', ml: 330 },
  { value: '500ml (Pint)', label: '🍺 500ml (Pint)', ml: 500 },
  { value: '750ml (Wine Bottle)', label: '🍷 750ml (Wine Bottle)', ml: 750 },
  { value: 'Custom', label: '🔧 Custom Size (ml)', ml: 0 }
];

const getSessionTypesForCategory = (category: Category) => {
  switch (category) {
    case 'weed': return [{ value: 'Joint', label: '🌿 Joint'}, { value: 'Bong', label: '💨 Bong'}, { value: 'Vape', label: '💨 Vape'}, { value: 'Edible', label: '🍪 Edible'}, { value: 'Other', label: '🔄 Other'}];
    case 'cigs': return [{ value: 'Regular', label: '🚬 Regular'}, { value: 'Light', label: '🚬 Light'}, { value: 'Menthol', label: '🌿 Menthol'}, { value: 'Other', label: '🔄 Other'}];
    case 'vapes': return [{ value: 'Disposable', label: '💨 Disposable'}, { value: 'Pod', label: '🔋 Pod'}, { value: 'Mod', label: '🔧 Mod'}, { value: 'Other', label: '🔄 Other'}];
    case 'liquor': return [{ value: 'Beer', label: '🍺 Beer'}, { value: 'Wine', label: '🍷 Wine'}, { value: 'Spirits', label: '🥃 Spirits'}, { value: 'Cocktail', label: '🍸 Cocktail'}, { value: 'Other', label: '🔄 Other'}];
    default: return [{ value: 'Other', label: '🔄 Other'}];
  }
};

const getQuantityLabel = (category: Category) => {
  if (category === 'liquor') return 'Number of Servings';
  if (category === 'cigs') return 'Number of Cigarettes';
  return 'Total Quantity';
};

const getCategoryVisuals = (category: Category) => {
  switch (category) {
    case 'weed': return { emoji: '🌿', gradient: 'from-green-500 to-emerald-600' };
    case 'cigs': return { emoji: '🚬', gradient: 'from-gray-500 to-slate-600' };
    case 'vapes': return { emoji: '💨', gradient: 'from-cyan-500 to-blue-600' };
    case 'liquor': return { emoji: '🥃', gradient: 'from-amber-500 to-orange-600' };
    default: return { emoji: '📝', gradient: 'from-blue-500 to-purple-600' };
  }
};

// --- Main Form Component ---
const SessionFormComponent = ({ 
  category, 
  initialSession, 
  onFormClose,
  onSessionAdded,
  onSessionUpdated 
}: SessionFormProps) => {
  const { addSession, updateSession, isSubmitting } = useSessions(category);
  const { toast } = useToast();

  const sessionTypes = useMemo(() => getSessionTypesForCategory(category), [category]);
  const servingSizes = useMemo(() => getLiquorServingSizes(), []);
  const categoryVisuals = useMemo(() => getCategoryVisuals(category), [category]);

  const getDefaultState = useCallback(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const initialDate = initialSession ? new Date(initialSession.session_date) : now;
    initialDate.setMinutes(initialDate.getMinutes() - initialDate.getTimezoneOffset());
    
    return {
      sessionType: initialSession?.session_type || sessionTypes[0]?.value as SessionType,
      quantity: initialSession?.quantity || 1,
      participantCount: initialSession?.participant_count || 1,
      liquorServingSize: initialSession?.liquor_serving_size || '330ml (Beer Bottle)' as LiquorServingSize,
      customServingSize: 0, // Simplified: always start at 0
      notes: initialSession?.notes || '',
      rating: initialSession?.rating || 3,
      sessionDate: initialDate.toISOString().slice(0, 16),
    };
  }, [initialSession, sessionTypes]);

  const [formState, setFormState] = useState(getDefaultState());

  useEffect(() => {
    setFormState(getDefaultState());
  }, [initialSession, getDefaultState]);

  // Unified state handler for all inputs
  const handleStateChange = (field: keyof typeof formState, value: any) => {
    setFormState(prevState => ({ ...prevState, [field]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sessionData: Partial<Session> = {
      session_type: formState.sessionType,
      quantity: formState.quantity,
      notes: formState.notes.trim() || null,
      rating: formState.rating,
      session_date: new Date(formState.sessionDate).toISOString(),
      participant_count: formState.participantCount,
    };

    if (category === 'liquor') {
      sessionData.liquor_serving_size = formState.liquorServingSize;
      if (formState.liquorServingSize === 'Custom') {
        const customNote = `Custom serving size: ${formState.customServingSize}ml`;
        sessionData.notes = formState.notes ? `${formState.notes}\n${customNote}` : customNote;
      }
    }

    try {
      if (initialSession) {
        await updateSession(initialSession.id, sessionData);
        toast({
          title: "✅ Session Updated!",
          description: "Your changes have been saved successfully.",
        });
        onSessionUpdated?.();
      } else {
        await addSession(sessionData as Omit<Session, 'id' | 'created_at' | 'updated_at' | 'user_id'>);
        toast({
          title: "🎉 Session Logged!",
          description: "Your new session has been recorded.",
        });
        onSessionAdded?.();
      }
      onFormClose(); // Close the form on success
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "❌ Error",
        description: "Could not save the session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const consumptionDisplay = useMemo(() => {
    if (category === 'liquor') {
      const selectedSize = servingSizes.find(size => size.value === formState.liquorServingSize);
      const mlPerServing = formState.liquorServingSize === 'Custom' ? formState.customServingSize : (selectedSize?.ml || 0);
      const totalMl = formState.quantity * mlPerServing;
      return `${totalMl.toFixed(0)} ml`;
    }
    const perPerson = formState.quantity / formState.participantCount;
    return `${perPerson.toFixed(2)} per person`;
  }, [category, formState.quantity, formState.participantCount, formState.liquorServingSize, formState.customServingSize, servingSizes]);

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 bg-gradient-to-r ${categoryVisuals.gradient} rounded-full flex items-center justify-center`}>
          <span className="text-white text-2xl">{categoryVisuals.emoji}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {initialSession ? 'Edit Session' : 'Log New Session'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Fill in the details to record your session.
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Session Type & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <Label htmlFor="type" className="font-medium text-gray-700 dark:text-gray-300">Type</Label>
            <Select value={formState.sessionType} onValueChange={(value: SessionType) => handleStateChange('sessionType', value)}>
              <SelectTrigger className="w-full h-12 rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"><SelectValue /></SelectTrigger>
              <SelectContent>{sessionTypes.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sessionDate" className="font-medium text-gray-700 dark:text-gray-300">Date & Time</Label>
            <Input id="sessionDate" type="datetime-local" value={formState.sessionDate} onChange={(e) => handleStateChange('sessionDate', e.target.value)} className="h-12 rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"/>
          </div>
        </div>

        {/* Row 2: Quantity & Participants/Serving Size */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <QuantityControl label={getQuantityLabel(category)} value={formState.quantity} onChange={(v) => handleStateChange('quantity', v)} />
          {category === 'liquor' ? (
            <div className="space-y-2">
              <Label htmlFor="servingSize" className="font-medium text-gray-700 dark:text-gray-300">Serving Size</Label>
              <Select value={formState.liquorServingSize} onValueChange={(v: LiquorServingSize) => handleStateChange('liquorServingSize', v)}>
                <SelectTrigger className="w-full h-12 rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"><SelectValue /></SelectTrigger>
                <SelectContent>{servingSizes.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
              {formState.liquorServingSize === 'Custom' && (
                <Input type="number" placeholder="Enter size in ml" value={formState.customServingSize} onChange={e => handleStateChange('customServingSize', Number(e.target.value))} className="mt-2 h-12 rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600" />
              )}
            </div>
          ) : (
            <QuantityControl label="Participants" value={formState.participantCount} onChange={(v) => handleStateChange('participantCount', v)} />
          )}
        </div>

        {/* Row 3: Consumption Highlight */}
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {category === 'liquor' ? 'Total Volume' : 'Consumption per Person'}
            </Label>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{consumptionDisplay}</p>
        </div>

        {/* Row 4: Rating */}
        <div className="space-y-3">
            <Label className="font-medium text-gray-700 dark:text-gray-300">Session Rating</Label>
            <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => handleStateChange('rating', star)}
                        className={`w-10 h-10 flex-1 md:flex-none rounded-lg transition-all duration-200 text-2xl flex items-center justify-center ${star <= formState.rating ? 'bg-amber-400 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                        <Star className={`w-6 h-6 ${star <= formState.rating ? 'fill-current' : ''}`} />
                    </button>
                ))}
            </div>
        </div>

        {/* Row 5: Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="font-medium text-gray-700 dark:text-gray-300">Notes (optional)</Label>
          <Textarea id="notes" placeholder="Any details, effects, or thoughts..." value={formState.notes} onChange={(e) => handleStateChange('notes', e.target.value)} className="min-h-[100px] rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 resize-y"/>
        </div>

        {/* Row 6: Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="submit" disabled={isSubmitting} className={`w-full md:flex-1 h-12 text-base font-semibold bg-gradient-to-r ${categoryVisuals.gradient} text-white rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50`}>
            {isSubmitting ? 'Saving...' : (initialSession ? 'Update Session' : 'Log Session')}
          </Button>
          <Button type="button" onClick={onFormClose} variant="outline" className="w-full md:w-auto h-12 text-base rounded-lg border-gray-300 dark:border-gray-600">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

// --- Quantity Control Sub-component ---
const QuantityControl = ({ label, value, onChange, min = 1, max = 99, step = 1 }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) => (
  <div className="space-y-2">
    <Label className="font-medium text-gray-700 dark:text-gray-300">{label}</Label>
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" size="icon" onClick={() => onChange(Math.max(min, value - step))} disabled={value <= min} className="h-12 w-12 rounded-lg">
        <Minus className="w-5 h-5" />
      </Button>
      <Input type="number" value={value} onChange={e => {
          const num = Number(e.target.value);
          if (!isNaN(num) && num >= min) onChange(num);
      }} className="h-12 text-center text-lg font-bold rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
      <Button type="button" variant="outline" size="icon" onClick={() => onChange(Math.min(max, value + step))} disabled={value >= max} className="h-12 w-12 rounded-lg">
        <Plus className="w-5 h-5" />
      </Button>
    </div>
  </div>
);

// Memoize the component to prevent unnecessary re-renders
export const SessionForm = memo(SessionFormComponent);