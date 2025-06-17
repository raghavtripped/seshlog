// /src/components/SessionForm.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Session, SessionType, Category, WeedSessionType, CigSessionType, VapeSessionType, LiquorSessionType, LiquorServingSize } from "@/types/session";
import { Plus, Minus } from "lucide-react";
import { useSessions } from "@/hooks/useSessions";
import { useIsMobile } from "@/hooks/use-mobile";

interface SessionFormProps {
  category: Category;
  initialSession?: Session;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  onSessionAdded?: () => void;
  onSessionUpdated?: () => void;
}

// Liquor serving sizes
const getLiquorServingSizes = (): Array<{ value: LiquorServingSize; label: string; ml: number }> => [
  { value: '30ml (Shot)', label: '🥃 30ml (Shot)', ml: 30 },
  { value: '60ml (Double Shot)', label: '🥃 60ml (Double Shot)', ml: 60 },
  { value: '150ml (Wine Glass)', label: '🍷 150ml (Wine Glass)', ml: 150 },
  { value: '250ml (Large Wine)', label: '🍷 250ml (Large Wine)', ml: 250 },
  { value: '330ml (Beer Bottle)', label: '🍺 330ml (Beer Bottle)', ml: 330 },
  { value: '500ml (Pint)', label: '🍺 500ml (Pint)', ml: 500 },
  { value: '750ml (Wine Bottle)', label: '🍷 750ml (Wine Bottle)', ml: 750 },
  { value: '1000ml (Large Bottle)', label: '🍺 1000ml (Large Bottle)', ml: 1000 },
  { value: 'Custom', label: '🔧 Custom Size', ml: 0 }
];

// Category-specific session types
const getSessionTypesForCategory = (category: Category) => {
  switch (category) {
    case 'weed':
      return [
        { value: 'Joint', label: '🌿 Joint', emoji: '🌿' },
        { value: 'Bong', label: '💨 Bong', emoji: '💨' },
        { value: 'Vape', label: '💨 Vape', emoji: '💨' },
        { value: 'Edible', label: '🍪 Edible', emoji: '🍪' },
        { value: 'Other', label: '🔄 Other', emoji: '🔄' }
      ];
    case 'cigs':
      return [
        { value: 'Regular', label: '🚬 Regular', emoji: '🚬' },
        { value: 'Light', label: '🚬 Light', emoji: '🚬' },
        { value: 'Menthol', label: '🌿 Menthol', emoji: '🌿' },
        { value: 'E-Cigarette', label: '💨 E-Cigarette', emoji: '💨' },
        { value: 'Other', label: '🔄 Other', emoji: '🔄' }
      ];
    case 'vapes':
      return [
        { value: 'Disposable', label: '💨 Disposable', emoji: '💨' },
        { value: 'Pod', label: '🔋 Pod', emoji: '🔋' },
        { value: 'Mod', label: '🔧 Mod', emoji: '🔧' },
        { value: 'Pen', label: '✏️ Pen', emoji: '✏️' },
        { value: 'Other', label: '🔄 Other', emoji: '🔄' }
      ];
    case 'liquor':
      return [
        { value: 'Beer', label: '🍺 Beer', emoji: '🍺' },
        { value: 'Wine', label: '🍷 Wine', emoji: '🍷' },
        { value: 'Spirits', label: '🥃 Spirits', emoji: '🥃' },
        { value: 'Cocktail', label: '🍸 Cocktail', emoji: '🍸' },
        { value: 'Other', label: '🔄 Other', emoji: '🔄' }
      ];
    default:
      return [{ value: 'Other', label: '🔄 Other', emoji: '🔄' }];
  }
};

const getQuantityLabel = (sessionType: SessionType, category: Category) => {
  if (category === 'weed') {
    switch (sessionType) {
      case 'Joint': return 'Number of Joints';
      case 'Bong': return 'Number of Bowls';
      case 'Vape': return 'Number of Sessions';
      case 'Edible': return 'Number of Pieces';
      case 'Other': return 'Quantity';
      default: return 'Quantity';
    }
  } else if (category === 'cigs') {
    switch (sessionType) {
      case 'Regular': case 'Light': case 'Menthol': return 'Number of Cigarettes';
      case 'E-Cigarette': return 'Number of Sessions';
      case 'Other': return 'Quantity';
      default: return 'Quantity';
    }
  } else if (category === 'vapes') {
    switch (sessionType) {
      case 'Disposable': case 'Pod': case 'Mod': case 'Pen': return 'Number of Sessions';
      case 'Other': return 'Quantity';
      default: return 'Quantity';
    }
  } else if (category === 'liquor') {
    return 'Number of Servings';
  }
  return 'Quantity';
};

const getIndividualLabel = (sessionType: SessionType, category: Category) => {
  if (category === 'weed') {
    switch (sessionType) {
      case 'Joint': return 'joints per person';
      case 'Bong': return 'bowls per person';
      case 'Vape': return 'sessions per person';
      case 'Edible': return 'pieces per person';
      case 'Other': return 'items per person';
      default: return 'per person';
    }
  } else if (category === 'cigs') {
    switch (sessionType) {
      case 'Regular': case 'Light': case 'Menthol': return 'cigarettes per person';
      case 'E-Cigarette': return 'sessions per person';
      case 'Other': return 'items per person';
      default: return 'per person';
    }
  } else if (category === 'vapes') {
    return 'sessions per person';
  } else if (category === 'liquor') {
    return 'ml total consumed';
  }
  return 'per person';
};

const getCategoryEmoji = (category: Category) => {
  switch (category) {
    case 'weed': return '🌿';
    case 'cigs': return '🚬';
    case 'vapes': return '💨';
    case 'liquor': return '🥃';
    default: return '📝';
  }
};

const getCategoryGradient = (category: Category) => {
  switch (category) {
    case 'weed': return 'from-green-500 to-emerald-600';
    case 'cigs': return 'from-gray-500 to-slate-600';
    case 'vapes': return 'from-cyan-500 to-blue-600';
    case 'liquor': return 'from-amber-500 to-orange-600';
    default: return 'from-blue-500 to-purple-600';
  }
};

export const SessionForm = ({ 
  category, 
  initialSession, 
  showForm, 
  setShowForm,
  onSessionAdded,
  onSessionUpdated 
}: SessionFormProps) => {
  const { addSession, updateSession } = useSessions(category);
  const isMobile = useIsMobile();
  
  const sessionTypes = getSessionTypesForCategory(category);
  const defaultSessionType = sessionTypes[0]?.value as SessionType;
  const servingSizes = getLiquorServingSizes();
  
  const [sessionType, setSessionType] = useState<SessionType>(initialSession?.session_type || defaultSessionType);
  const [quantity, setQuantity] = useState(initialSession?.quantity || 1);
  const [participantCount, setParticipantCount] = useState(initialSession?.participant_count || 1);
  const [liquorServingSize, setLiquorServingSize] = useState<LiquorServingSize>(
    initialSession?.liquor_serving_size || '330ml (Beer Bottle)'
  );
  const [customServingSize, setCustomServingSize] = useState(0);
  const [notes, setNotes] = useState(initialSession?.notes || '');
  const [rating, setRating] = useState<number>(initialSession?.rating || 3);
  const [sessionDate, setSessionDate] = useState(() => {
    if (initialSession?.session_date) {
      const date = new Date(initialSession.session_date);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      return date.toISOString().slice(0, 16);
    }
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  // Reset form when initialSession changes
  useEffect(() => {
    if (initialSession) {
      setSessionType(initialSession.session_type);
      setQuantity(initialSession.quantity);
      setParticipantCount(initialSession.participant_count);
      setLiquorServingSize(initialSession.liquor_serving_size || '330ml (Beer Bottle)');
      setCustomServingSize(0);
      setNotes(initialSession.notes || '');
      setRating(initialSession.rating || 3);
      const date = new Date(initialSession.session_date);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      setSessionDate(date.toISOString().slice(0, 16));
    }
  }, [initialSession]);

  // Calculate consumption based on category
  const getConsumptionDisplay = () => {
    if (category === 'liquor') {
      const selectedSize = servingSizes.find(size => size.value === liquorServingSize);
      const mlPerServing = liquorServingSize === 'Custom' ? customServingSize : (selectedSize?.ml || 0);
      const totalMl = quantity * mlPerServing;
      return { value: totalMl, label: getIndividualLabel(sessionType, category) };
    } else {
      // For weed and all other categories, just use quantity / participantCount
      const individualConsumption = quantity / participantCount;
      return { value: individualConsumption, label: getIndividualLabel(sessionType, category) };
    }
  };

  const consumptionDisplay = getConsumptionDisplay();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let sessionData: any = {
      session_type: sessionType,
      quantity,
      notes: notes.trim() || null,
      rating,
      session_date: new Date(sessionDate).toISOString(),
    };

    if (category === 'liquor') {
      sessionData.liquor_serving_size = liquorServingSize;
      sessionData.participant_count = 1;
      
      if (liquorServingSize === 'Custom') {
        const customNote = `Custom serving size: ${customServingSize}ml`;
        sessionData.notes = sessionData.notes ? `${sessionData.notes}\n${customNote}` : customNote;
      }
    } else {
      sessionData.participant_count = participantCount;
    }

    try {
      if (initialSession) {
        await updateSession(initialSession.id, sessionData);
        onSessionUpdated?.();
      } else {
        await addSession(sessionData);
        onSessionAdded?.();
      }
      
      // Reset form if adding new session
      if (!initialSession) {
        setQuantity(1);
        setParticipantCount(1);
        setLiquorServingSize('330ml (Beer Bottle)');
        setCustomServingSize(0);
        setNotes('');
        setRating(3);
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setSessionDate(now.toISOString().slice(0, 16));
      }
      
      setShowForm(false);
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    
    // Reset form if not editing
    if (!initialSession) {
      setSessionType(defaultSessionType);
      setQuantity(1);
      setParticipantCount(1);
      setLiquorServingSize('330ml (Beer Bottle)');
      setCustomServingSize(0);
      setNotes('');
      setRating(3);
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setSessionDate(now.toISOString().slice(0, 16));
    }
  };

  // Updated QuantityControl for mobile: natural numbers + custom
  const QuantityControl = ({ value, onChange, min = 1, max = 50, step = 1, label }: {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    label: string;
  }) => {
    const [customMode, setCustomMode] = useState(false);
    const [customValue, setCustomValue] = useState(value);

    useEffect(() => {
      if (!customMode) setCustomValue(value);
    }, [value, customMode]);

    if (isMobile) {
      return (
        <div className="space-y-2">
          <Label className="form-text text-gray-700 dark:text-gray-300">{label}</Label>
          {customMode ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={min}
                max={max}
                value={customValue}
                onChange={e => setCustomValue(Number(e.target.value))}
                onBlur={() => {
                  if (customValue >= min && customValue <= max) {
                    onChange(customValue);
                  }
                }}
                className="w-20 bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200"
              />
              <Button type="button" size="sm" variant="outline" onClick={() => { setCustomMode(false); onChange(customValue); }}>
                Set
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange(Math.max(min, value - step))}
                disabled={value <= min}
                className="w-10 h-10 p-0 rounded-full"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="flex-1 text-center">
                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">{value}</div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange(Math.min(max, value + step))}
                disabled={value >= max}
                className="w-10 h-10 p-0 rounded-full"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="ml-2 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600"
                onClick={() => setCustomMode(true)}
              >
                Custom
              </Button>
            </div>
          )}
        </div>
      );
    }
    // Desktop/laptop view unchanged
    return (
      <div className="space-y-2">
        <Label className="form-text text-gray-700 dark:text-gray-300">{label}</Label>
        <Input
          type="number"
          min={min}
          step={step}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200"
        />
      </div>
    );
  };

  function SessionFormContent() {
    return (
      <div className={`glass-card ${isMobile ? 'mx-2' : 'max-w-2xl mx-auto'}`}>
        <div className={`${isMobile ? 'p-4' : 'p-6 sm:p-8'}`}>
          {/* Header */}
          <div className={`flex items-center gap-3 ${isMobile ? 'mb-4' : 'mb-6 sm:mb-8'}`}>
            <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-r ${getCategoryGradient(category)} rounded-full flex items-center justify-center`}>
              <span className={`text-white ${isMobile ? 'text-lg' : 'text-xl'}`}>{getCategoryEmoji(category)}</span>
            </div>
            <div>
              <h2 className={`${isMobile ? 'text-lg font-semibold' : 'heading-lg'} text-gray-800 dark:text-gray-200`}>
                {initialSession ? 'Edit Session' : 'Log New Session'}
              </h2>
              <p className={`${isMobile ? 'text-xs' : 'body-sm'} text-gray-600 dark:text-gray-400`}>
                {initialSession ? 'Update your session details' : 'Record your session details'}
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className={`space-y-${isMobile ? '4' : '6'}`}>
            {/* Session Type and Date */}
            <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'sm:grid-cols-2 gap-6'}`}>
              <div className="space-y-2">
                <Label htmlFor="type" className="form-text text-gray-700 dark:text-gray-300">Session Type</Label>
                <Select value={sessionType} onValueChange={(value: SessionType) => setSessionType(value)}>
                  <SelectTrigger className={`w-full ${isMobile ? 'h-12' : ''} bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card-secondary border-slate-200 dark:border-gray-700 rounded-xl">
                    {sessionTypes.map((type) => (
                      <SelectItem 
                        key={type.value} 
                        value={type.value} 
                        className={`hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors ${isMobile ? 'py-3' : ''}`}
                      >
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionDate" className="form-text text-gray-700 dark:text-gray-300">Date & Time</Label>
                <Input
                  id="sessionDate"
                  type="datetime-local"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className={`w-full ${isMobile ? 'h-12' : ''} bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200`}
                />
              </div>
            </div>

            {/* Quantity and Participants/Serving Size */}
            <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'sm:grid-cols-2 gap-6'}`}>
              <QuantityControl
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={50}
                step={1}
                label={getQuantityLabel(sessionType, category)}
              />

              {category === 'liquor' ? (
                <div className="space-y-2">
                  <Label htmlFor="servingSize" className="form-text text-gray-700 dark:text-gray-300">Serving Size</Label>
                  <Select value={liquorServingSize} onValueChange={(value: LiquorServingSize) => setLiquorServingSize(value)}>
                    <SelectTrigger className={`w-full ${isMobile ? 'h-12' : ''} bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card-secondary border-slate-200 dark:border-gray-700 rounded-xl">
                      {servingSizes.map((size) => (
                        <SelectItem 
                          key={size.value} 
                          value={size.value} 
                          className={`hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors ${isMobile ? 'py-3' : ''}`}
                        >
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {liquorServingSize === 'Custom' && (
                    <Input
                      type="number"
                      min="1"
                      max="2000"
                      placeholder="Enter custom size in ml"
                      value={customServingSize}
                      onChange={(e) => setCustomServingSize(Number(e.target.value))}
                      className={`w-full ${isMobile ? 'h-12' : ''} bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200 mt-2`}
                    />
                  )}
                </div>
              ) : (
                <QuantityControl
                  value={participantCount}
                  onChange={setParticipantCount}
                  min={1}
                  max={20}
                  step={1}
                  label="Number of Participants"
                />
              )}
            </div>

            {/* Individual Consumption Highlight */}
            <div className={`glass-card-secondary ${isMobile ? 'p-4' : 'p-6'} border border-blue-200/50 dark:border-blue-800/50`}>
              <div className={`flex items-center gap-3 ${isMobile ? 'mb-2' : 'mb-3'}`}>
                <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} bg-gradient-to-r ${getCategoryGradient(category)} rounded-full flex items-center justify-center`}>
                  <span className={`text-white ${isMobile ? 'text-xs' : 'text-sm'}`}>🎯</span>
                </div>
                <div>
                  <h3 className={`${isMobile ? 'text-sm font-medium' : 'form-text'} text-gray-700 dark:text-gray-300`}>
                    {category === 'liquor' ? 'Total Consumption' : 'Individual Consumption'}
                  </h3>
                  <p className={`${isMobile ? 'text-xs' : 'body-xs'} text-gray-500 dark:text-gray-400`}>
                    {category === 'liquor' ? 'Total amount consumed' : 'Your personal share'}
                  </p>
                </div>
              </div>
              <p className={`${isMobile ? 'text-lg font-semibold' : 'heading-md'} gradient-text`}>
                {consumptionDisplay.value.toFixed(2)} {consumptionDisplay.label}
              </p>
            </div>

            {/* Rating */}
            <div className="space-y-3">
              <Label className="form-text text-gray-700 dark:text-gray-300">How was this session?</Label>
              <div className={`flex items-center ${isMobile ? 'flex-col gap-3' : 'gap-4'}`}>
                <div className={`flex ${isMobile ? 'gap-2' : 'gap-1'}`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`${isMobile ? 'w-12 h-12' : 'w-10 h-10'} rounded-full transition-all duration-200 transform hover:scale-110 flex items-center justify-center ${isMobile ? 'text-xl' : 'text-lg'} font-semibold ${
                        star <= rating 
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <div className="glass-card-secondary px-3 py-2 rounded-lg">
                  <span className={`${isMobile ? 'text-sm' : 'body-sm'} font-medium text-gray-700 dark:text-gray-300`}>{rating}/5</span>
                </div>
              </div>
              <p className={`${isMobile ? 'text-xs' : 'body-xs'} text-gray-500 dark:text-gray-400`}>Rate from 1 (poor) to 5 (excellent)</p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="form-text text-gray-700 dark:text-gray-300">
                Notes <span className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'text-xs' : 'body-xs'}`}>(optional)</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="How was the session? Any special details, effects, or thoughts to remember..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`w-full bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200 ${isMobile ? 'min-h-[80px]' : 'min-h-[100px]'} resize-none`}
              />
            </div>

            {/* Action Buttons */}
            <div className={`flex ${isMobile ? 'flex-col gap-3 pt-4' : 'flex-col sm:flex-row gap-3 pt-6'} border-t border-gray-200 dark:border-gray-700`}>
              <Button
                type="submit"
                className={`${isMobile ? 'w-full h-12' : 'flex-1'} bg-gradient-to-r ${getCategoryGradient(category)} hover:opacity-90 text-white font-semibold ${isMobile ? 'py-3' : 'py-3'} rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-0`}
              >
                <span className="mr-2">💾</span>
                {initialSession ? 'Update Session' : 'Log Session'}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                className={`${isMobile ? 'w-full h-12' : 'flex-1'} border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 ${isMobile ? 'py-3' : 'py-3'} rounded-xl transition-all duration-200`}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return <SessionFormContent />;
};