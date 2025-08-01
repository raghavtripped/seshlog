// /Users/raghavtripathi/Projects 2.0/session-scribe-log/src/components/SessionForm.tsx

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Session, SessionType, Category, LiquorServingSize } from "@/types/session";
import { Plus, Minus, Star, Loader2 } from "lucide-react"; // Import Loader2 for spinner
import { useSessions } from "@/hooks/useSessions";
import { useToast } from "@/components/ui/use-toast";

// --- Props Interface ---
interface SessionFormProps {
  category: Category;
  initialSession?: Session;
  onFormClose: () => void;
  onSessionAdded?: () => void;
  onSessionUpdated?: () => void;
}

// --- Form State Interface ---
interface FormState {
  sessionType: SessionType;
  quantity: string; // Changed from number to string for better input handling
  participantCount: string; // Changed from number to string for better input handling
  liquorServingSize: LiquorServingSize;
  customServingSize: string; // Changed from number to string
  notes: string;
  rating: number;
  sessionDate: string;
}

// --- Weed Type Configuration ---
interface WeedTypeConfig {
  defaultQuantity: number;
  step: number;
  unit: string;
  typicalRange: string;
  description: string;
}

const getWeedTypeConfig = (sessionType: string): WeedTypeConfig => {
  const configs: { [key: string]: WeedTypeConfig } = {
    'Joint': {
      defaultQuantity: 0.7,
      step: 0.1,
      unit: 'g',
      typicalRange: '0.3-1.5g',
      description: 'Standard joint (~0.5-1g flower)'
    },
    'Bong': {
      defaultQuantity: 0.2,
      step: 0.05,
      unit: 'g',
      typicalRange: '0.1-0.5g',
      description: 'Per bowl/hit (~0.1-0.3g)'
    },
    'Vape': {
      defaultQuantity: 0.15,
      step: 0.05,
      unit: 'g',
      typicalRange: '0.05-0.3g',
      description: 'Per session (~0.1-0.2g)'
    },
    'Edible': {
      defaultQuantity: 10,
      step: 2.5,
      unit: 'mg',
      typicalRange: '5-100mg',
      description: 'THC content in mg'
    },
    'Other': {
      defaultQuantity: 1,
      step: 0.1,
      unit: 'unit',
      typicalRange: 'varies',
      description: 'Specify in notes'
    }
  };
  
  return configs[sessionType] || configs['Other'];
};

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
    case 'liquor': return [{ value: 'Beer', label: '🍺 Beer'}, { value: 'Wine', label: '🍷 Wine'}, { value: 'Spirits', label: '�� Spirits'}, { value: 'Cocktail', label: '🍸 Cocktail'}, { value: 'Other', label: '🔄 Other'}];
    default: return [{ value: 'Other', label: '🔄 Other'}];
  }
};

const getQuantityLabel = (category: Category, sessionType?: SessionType) => {
  if (category === 'liquor') return 'Number of Servings';
  if (category === 'cigs') return 'Number of Cigarettes';
  if (category === 'weed' && sessionType) {
    const config = getWeedTypeConfig(sessionType);
    return `Quantity (${config.unit})`;
  }
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

/**
 * Converts a date to a string suitable for datetime-local input,
 * correctly handling the user's local timezone.
 * @param date - The Date object to format.
 * @returns A string in 'YYYY-MM-DDTHH:mm' format.
 */
const toDateTimeLocalString = (date: Date): string => {
  const ten = (i: number) => (i < 10 ? '0' : '') + i;
  const YYYY = date.getFullYear();
  const MM = ten(date.getMonth() + 1);
  const DD = ten(date.getDate());
  const HH = ten(date.getHours());
  const mm = ten(date.getMinutes());
  return `${YYYY}-${MM}-${DD}T${HH}:${mm}`;
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

  const getDefaultState = useCallback((): FormState => {
    // FIX: Correctly handle timezone for both new and existing sessions.
    const initialDate = initialSession ? new Date(initialSession.session_date) : new Date();
    const defaultSessionType = initialSession?.session_type || sessionTypes[0]?.value as SessionType;
    
    // Get smart default quantity for weed based on session type
    let defaultQuantity = initialSession?.quantity || 1;
    if (!initialSession && category === 'weed') {
      const config = getWeedTypeConfig(defaultSessionType);
      defaultQuantity = config.defaultQuantity;
    }
    
    return {
      sessionType: defaultSessionType,
      quantity: defaultQuantity.toString(),
      participantCount: (initialSession?.participant_count || 1).toString(),
      liquorServingSize: initialSession?.liquor_serving_size || '330ml (Beer Bottle)' as LiquorServingSize,
      customServingSize: '', // Initialize as empty string
      notes: initialSession?.notes || '',
      rating: initialSession?.rating || 3,
      sessionDate: toDateTimeLocalString(initialDate), // Use our timezone-aware formatter
    };
  }, [initialSession, sessionTypes, category]);

  const [formState, setFormState] = useState<FormState>(getDefaultState());

  useEffect(() => {
    setFormState(getDefaultState());
  }, [initialSession, getDefaultState]);

  // FIX 1: Replace 'any' with proper generic type for type safety
  const handleStateChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormState(prevState => ({ ...prevState, [field]: value }));
  };

  // Handle session type change with smart quantity update
  const handleSessionTypeChange = (newSessionType: SessionType) => {
    handleStateChange('sessionType', newSessionType);
    
    // Update quantity to smart default if this is a new session and weed category
    if (!initialSession && category === 'weed') {
      const config = getWeedTypeConfig(newSessionType);
      handleStateChange('quantity', config.defaultQuantity.toString());
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // FIX 2: Convert to ISO string to match Session type definition (session_date: string)
    const submissionDate = new Date(formState.sessionDate).toISOString();

    // FIX 3: Create properly typed object for addSession matching SessionInsert type
    const sessionData = {
      category: category, // Required by SessionInsert
      user_id: '', // Required by SessionInsert (will be overridden by useSessions hook)
      session_type: formState.sessionType,
      quantity: parseFloat(formState.quantity) || 0,
      notes: formState.notes.trim() || null,
      rating: formState.rating,
      session_date: submissionDate, // Now properly typed as string
      participant_count: parseInt(formState.participantCount) || 1,
      ...(category === 'liquor' && { liquor_serving_size: formState.liquorServingSize }),
    };

    // Handle custom serving size for liquor
    if (category === 'liquor' && formState.liquorServingSize === 'Custom') {
      const customNote = `Custom serving size: ${formState.customServingSize}ml`;
      sessionData.notes = formState.notes ? `${formState.notes}\n${customNote}` : customNote;
    }

    try {
      if (initialSession) {
        await updateSession(initialSession.id, sessionData);
        toast({ title: "✅ Session Updated!", description: "Your changes have been saved." });
        if(onSessionUpdated) onSessionUpdated();
      } else {
        await addSession(sessionData);
        toast({ title: "🎉 Session Logged!", description: "Your new session is recorded." });
        if(onSessionAdded) onSessionAdded();
      }
      onFormClose();
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "❌ Error",
        description: "Could not save the session. Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  const consumptionDisplay = useMemo(() => {
    if (category === 'liquor') {
      const selectedSize = servingSizes.find(size => size.value === formState.liquorServingSize);
      const mlPerServing = formState.liquorServingSize === 'Custom' ? Number(formState.customServingSize) || 0 : (selectedSize?.ml || 0);
      const totalMl = (parseFloat(formState.quantity) || 0) * mlPerServing;
      return `${totalMl.toFixed(0)} ml`;
    }
    
    if (category === 'weed') {
      const config = getWeedTypeConfig(formState.sessionType);
      const perPerson = (parseFloat(formState.quantity) || 0) / (parseInt(formState.participantCount) || 1);
      return `${perPerson.toFixed(config.step >= 1 ? 0 : 2)} ${config.unit} per person`;
    }
    
    const perPerson = (parseFloat(formState.quantity) || 0) / (parseInt(formState.participantCount) || 1);
    return `${perPerson.toFixed(2)} per person`;
  }, [category, formState.quantity, formState.participantCount, formState.liquorServingSize, formState.customServingSize, formState.sessionType, servingSizes]);

  // Get current weed type config for smart controls
  const currentWeedConfig = category === 'weed' ? getWeedTypeConfig(formState.sessionType) : null;

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
        {/* All form inputs now correctly use handleStateChange */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <Label htmlFor="type" className="font-medium text-gray-700 dark:text-gray-300">Type</Label>
            <Select value={formState.sessionType} onValueChange={handleSessionTypeChange}>
              <SelectTrigger className="w-full h-12 rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"><SelectValue /></SelectTrigger>
              <SelectContent>{sessionTypes.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent>
            </Select>
            {/* Add type description for weed */}
            {category === 'weed' && currentWeedConfig && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentWeedConfig.description} • Typical: {currentWeedConfig.typicalRange}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="sessionDate" className="font-medium text-gray-700 dark:text-gray-300">Date & Time</Label>
            <Input id="sessionDate" type="datetime-local" value={formState.sessionDate} onChange={(e) => handleStateChange('sessionDate', e.target.value)} className="h-12 rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"/>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <SmartQuantityControl 
            category={category}
            sessionType={formState.sessionType}
            value={formState.quantity}
            onChange={(v) => handleStateChange('quantity', v)}
          />
          {category === 'liquor' ? (
            <div className="space-y-2">
              <Label htmlFor="servingSize" className="font-medium text-gray-700 dark:text-gray-300">Serving Size</Label>
              <Select value={formState.liquorServingSize} onValueChange={(v: LiquorServingSize) => handleStateChange('liquorServingSize', v)}>
                <SelectTrigger className="w-full h-12 rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"><SelectValue /></SelectTrigger>
                <SelectContent>{servingSizes.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
              {formState.liquorServingSize === 'Custom' && (
                <Input type="number" placeholder="Enter size in ml" value={formState.customServingSize} onChange={e => handleStateChange('customServingSize', e.target.value)} className="mt-2 h-12 rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600" />
              )}
            </div>
          ) : (
            <QuantityControl label="Participants" value={formState.participantCount} onChange={(v) => handleStateChange('participantCount', v)} />
          )}
        </div>

        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {category === 'liquor' ? 'Total Volume' : 'Consumption per Person'}
            </Label>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{consumptionDisplay}</p>
        </div>

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
        
        <div className="space-y-2">
          <Label htmlFor="notes" className="font-medium text-gray-700 dark:text-gray-300">Notes (optional)</Label>
          <Textarea id="notes" placeholder="Any details, effects, or thoughts..." value={formState.notes} onChange={(e) => handleStateChange('notes', e.target.value)} className="min-h-[100px] rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 resize-y"/>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="submit" disabled={isSubmitting} className={`w-full md:flex-1 h-12 text-base font-semibold bg-gradient-to-r ${categoryVisuals.gradient} text-white rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center`}>
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isSubmitting ? 'Saving...' : (initialSession ? 'Update Session' : 'Log Session')}
          </Button>
          <Button type="button" onClick={onFormClose} disabled={isSubmitting} variant="outline" className="w-full md:w-auto h-12 text-base rounded-lg border-gray-300 dark:border-gray-600">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

// Smart quantity control that adapts to weed session types
const SmartQuantityControl = ({ 
  category, 
  sessionType, 
  value, 
  onChange 
}: {
  category: Category;
  sessionType: SessionType;
  value: string;
  onChange: (value: string) => void;
}) => {
  const label = getQuantityLabel(category, sessionType);
  
  if (category === 'weed') {
    const config = getWeedTypeConfig(sessionType);
    const decimals = config.step < 1 ? 2 : 0;
    
    return (
      <div className="space-y-2">
        <Label className="font-medium text-gray-700 dark:text-gray-300">{label}</Label>
        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            onClick={() => {
              const currentValue = parseFloat(value) || 0;
              const newValue = Math.max(config.step, +(currentValue - config.step).toFixed(decimals));
              onChange(newValue.toString());
            }}
            disabled={(parseFloat(value) || 0) <= config.step} 
            className="h-12 w-12 rounded-lg"
          >
            <Minus className="w-5 h-5" />
          </Button>
          <Input 
            type="number" 
            value={value} 
            step={config.step}
            onChange={e => {
              const inputValue = e.target.value;
              onChange(inputValue);
            }} 
            className="h-12 text-center text-lg font-bold rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
          />
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            onClick={() => {
              const currentValue = parseFloat(value) || 0;
              const newValue = +(currentValue + config.step).toFixed(decimals);
              onChange(newValue.toString());
            }}
            className="h-12 w-12 rounded-lg"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Step: {config.step}{config.unit} • Range: {config.typicalRange}
        </p>
      </div>
    );
  }
  
  // Fallback to regular quantity control for other categories
  return <QuantityControl label={label} value={value} onChange={onChange} />;
};

const QuantityControl = ({ label, value, onChange, min = 1, max = 99, step = 1 }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
}) => (
  <div className="space-y-2">
    <Label className="font-medium text-gray-700 dark:text-gray-300">{label}</Label>
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" size="icon" onClick={() => {
        const currentValue = parseInt(value) || min;
        const newValue = Math.max(min, currentValue - step);
        onChange(newValue.toString());
      }} disabled={(parseInt(value) || min) <= min} className="h-12 w-12 rounded-lg">
        <Minus className="w-5 h-5" />
      </Button>
      <Input type="number" value={value} onChange={e => {
          const inputValue = e.target.value;
          onChange(inputValue);
      }} className="h-12 text-center text-lg font-bold rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
      <Button type="button" variant="outline" size="icon" onClick={() => {
        const currentValue = parseInt(value) || min;
        const newValue = Math.min(max, currentValue + step);
        onChange(newValue.toString());
      }} disabled={(parseInt(value) || min) >= max} className="h-12 w-12 rounded-lg">
        <Plus className="w-5 h-5" />
      </Button>
    </div>
  </div>
);

export const SessionForm = memo(SessionFormComponent);