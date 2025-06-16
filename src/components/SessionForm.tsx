
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Session, SessionType } from "@/types/session";

interface SessionFormProps {
  onSubmit: (session: Omit<Session, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  initialSession?: Session;
}

const getQuantityLabel = (sessionType: SessionType) => {
  switch (sessionType) {
    case 'Joint': return 'Number of Joints';
    case 'Bong': return 'Number of Bowls';
    case 'Vape': return 'Number of Sessions';
    case 'Edible': return 'Number of Pieces';
    case 'Other': return 'Quantity';
    default: return 'Quantity';
  }
};

const getIndividualLabel = (sessionType: SessionType) => {
  switch (sessionType) {
    case 'Joint': return 'joints per person';
    case 'Bong': return 'bowls per person';
    case 'Vape': return 'sessions per person';
    case 'Edible': return 'pieces per person';
    case 'Other': return 'items per person';
    default: return 'per person';
  }
};

export const SessionForm = ({ onSubmit, onCancel, initialSession }: SessionFormProps) => {
  const [sessionType, setSessionType] = useState<SessionType>(initialSession?.sessionType || 'Joint');
  const [quantity, setQuantity] = useState(initialSession?.quantity || 1);
  const [participantCount, setParticipantCount] = useState(initialSession?.participantCount || 1);
  const [notes, setNotes] = useState(initialSession?.notes || '');
  const [rating, setRating] = useState<number>(initialSession?.rating || 5);
  const [sessionDate, setSessionDate] = useState(() => {
    if (initialSession?.sessionDate) {
      const date = new Date(initialSession.sessionDate);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      return date.toISOString().slice(0, 16);
    }
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  const individualConsumption = quantity / participantCount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      sessionType,
      quantity,
      participantCount,
      notes: notes.trim() || undefined,
      rating,
      sessionDate: new Date(sessionDate).toISOString(),
      individualConsumption,
    });
  };

  return (
    <div className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-emerald-500 to-blue-600 rounded-full"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {initialSession ? 'Edit Session' : 'Log New Session'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-gray-800 dark:text-gray-200 font-medium">Session Type</Label>
              <Select value={sessionType} onValueChange={(value: SessionType) => setSessionType(value)}>
                <SelectTrigger className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800/90 transition-all rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 backdrop-blur-md rounded-xl">
                  <SelectItem value="Joint" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">🌿 Joint</SelectItem>
                  <SelectItem value="Bong" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">💨 Bong</SelectItem>
                  <SelectItem value="Vape" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">💨 Vape</SelectItem>
                  <SelectItem value="Edible" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">🍪 Edible</SelectItem>
                  <SelectItem value="Other" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">🔄 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionDate" className="text-gray-800 dark:text-gray-200 font-medium">Date & Time</Label>
              <Input
                id="sessionDate"
                type="datetime-local"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800/90 transition-all focus:border-emerald-400 dark:focus:border-emerald-400 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-gray-800 dark:text-gray-200 font-medium">{getQuantityLabel(sessionType)}</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800/90 transition-all focus:border-emerald-400 dark:focus:border-emerald-400 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="participants" className="text-gray-800 dark:text-gray-200 font-medium">Number of Participants</Label>
              <Input
                id="participants"
                type="number"
                min="1"
                max="20"
                value={participantCount}
                onChange={(e) => setParticipantCount(Number(e.target.value))}
                className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800/90 transition-all focus:border-emerald-400 dark:focus:border-emerald-400 rounded-xl"
              />
            </div>
          </div>

          {/* Individual Consumption Display */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/30 dark:to-blue-900/30 border border-emerald-200/60 dark:border-emerald-700/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <Label className="text-emerald-700 dark:text-emerald-400 font-medium text-sm">Individual Consumption</Label>
            </div>
            <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {individualConsumption.toFixed(2)} {getIndividualLabel(sessionType)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating" className="text-gray-800 dark:text-gray-200 font-medium">Rating</Label>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-xl sm:text-2xl transition-all duration-200 transform hover:scale-110 ${
                      star <= rating 
                        ? 'text-amber-400 drop-shadow-lg' 
                        : 'text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">{rating}/5</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-800 dark:text-gray-200 font-medium">Notes <span className="text-gray-500 dark:text-gray-400 text-sm">(optional)</span></Label>
            <Textarea
              id="notes"
              placeholder="How was the session? Any special details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[80px] sm:min-h-[100px] backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800/90 transition-all focus:border-emerald-400 dark:focus:border-emerald-400 resize-none rounded-xl"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold py-3 transition-all duration-200 transform hover:scale-[1.02] shadow-lg rounded-xl"
            >
              {initialSession ? 'Update Session' : 'Log Session'}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 py-3 backdrop-blur-sm transition-all duration-200 rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
