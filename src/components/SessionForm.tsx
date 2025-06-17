// /src/components/SessionForm.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Session, SessionType } from "@/types/session";

interface SessionFormProps {
  // **FIXED: Corrected the Omit type to match the Session interface**
  onSubmit: (session: Omit<Session, 'id' | 'createdAt' | 'updated_at' | 'user_id' | 'created_at'>) => void;
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
  // **FIXED: Using snake_case to access properties from initialSession**
  const [sessionType, setSessionType] = useState<SessionType>(initialSession?.session_type || 'Joint');
  const [quantity, setQuantity] = useState(initialSession?.quantity || 1);
  const [participantCount, setParticipantCount] = useState(initialSession?.participant_count || 1);
  const [notes, setNotes] = useState(initialSession?.notes || '');
  const [rating, setRating] = useState<number>(initialSession?.rating || 3);
  const [sessionDate, setSessionDate] = useState(() => {
    // **FIXED: Using snake_case to access property from initialSession**
    if (initialSession?.session_date) {
      const date = new Date(initialSession.session_date);
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
      // **FIXED: Using snake_case for the submitted object keys**
      session_type: sessionType,
      quantity,
      participant_count: participantCount,
      notes: notes.trim() || null,
      rating,
      session_date: new Date(sessionDate).toISOString(),
    });
  };

  return (
    <div className="glass-card max-w-2xl mx-auto">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">📝</span>
          </div>
          <div>
            <h2 className="heading-lg text-gray-800 dark:text-gray-200">
              {initialSession ? 'Edit Session' : 'Log New Session'}
            </h2>
            <p className="body-sm text-gray-600 dark:text-gray-400">
              {initialSession ? 'Update your session details' : 'Record your session details'}
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Type and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="type" className="form-text text-gray-700 dark:text-gray-300">Session Type</Label>
              <Select value={sessionType} onValueChange={(value: SessionType) => setSessionType(value)}>
                <SelectTrigger className="w-full bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card-secondary border-slate-200 dark:border-gray-700 rounded-xl">
                  <SelectItem value="Joint" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">🌿 Joint</SelectItem>
                  <SelectItem value="Bong" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">💨 Bong</SelectItem>
                  <SelectItem value="Vape" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">💨 Vape</SelectItem>
                  <SelectItem value="Edible" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">🍪 Edible</SelectItem>
                  <SelectItem value="Other" className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">🔄 Other</SelectItem>
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
                className="w-full bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200"
              />
            </div>
          </div>

          {/* Quantity and Participants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="form-text text-gray-700 dark:text-gray-300">{getQuantityLabel(sessionType)}</Label>
              <Input
                id="quantity"
                type="number"
                min="0.1"
                step="0.1"
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="participants" className="form-text text-gray-700 dark:text-gray-300">Number of Participants</Label>
              <Input
                id="participants"
                type="number"
                min="1"
                max="20"
                value={participantCount}
                onChange={(e) => setParticipantCount(Number(e.target.value))}
                className="w-full bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200"
              />
            </div>
          </div>

          {/* Individual Consumption Highlight */}
          <div className="glass-card-secondary p-6 border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🎯</span>
              </div>
              <div>
                <h3 className="form-text text-gray-700 dark:text-gray-300">Individual Consumption</h3>
                <p className="body-xs text-gray-500 dark:text-gray-400">Your personal share</p>
              </div>
            </div>
            <p className="heading-md gradient-text">
              {individualConsumption.toFixed(2)} {getIndividualLabel(sessionType)}
            </p>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <Label className="form-text text-gray-700 dark:text-gray-300">How was this session?</Label>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`w-10 h-10 rounded-full transition-all duration-200 transform hover:scale-110 flex items-center justify-center text-lg font-semibold ${
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
                <span className="body-sm font-medium text-gray-700 dark:text-gray-300">{rating}/5</span>
              </div>
            </div>
            <p className="body-xs text-gray-500 dark:text-gray-400">Rate from 1 (poor) to 5 (excellent)</p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="form-text text-gray-700 dark:text-gray-300">
              Notes <span className="text-gray-500 dark:text-gray-400 body-xs">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="How was the session? Any special details, effects, or thoughts to remember..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all duration-200 min-h-[100px] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-0"
            >
              <span className="mr-2">💾</span>
              {initialSession ? 'Update Session' : 'Log Session'}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 py-3 rounded-xl transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};