
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Session, SessionType } from "@/types/session";

interface SessionFormProps {
  onSubmit: (session: Omit<Session, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
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

export const SessionForm = ({ onSubmit, onCancel }: SessionFormProps) => {
  const [sessionType, setSessionType] = useState<SessionType>('Joint');
  const [quantity, setQuantity] = useState(1);
  const [participantCount, setParticipantCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [sessionDate, setSessionDate] = useState(() => {
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
    <div className="backdrop-blur-sm bg-gray-800/90 border border-gray-700/50 rounded-xl shadow-2xl">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 bg-gradient-to-b from-green-400 to-green-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">Log New Session</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-gray-200 font-medium">Session Type</Label>
              <Select value={sessionType} onValueChange={(value: SessionType) => setSessionType(value)}>
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white backdrop-blur-sm hover:bg-gray-700/70 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 backdrop-blur-md">
                  <SelectItem value="Joint" className="text-white hover:bg-gray-700">🌿 Joint</SelectItem>
                  <SelectItem value="Bong" className="text-white hover:bg-gray-700">💨 Bong</SelectItem>
                  <SelectItem value="Vape" className="text-white hover:bg-gray-700">💨 Vape</SelectItem>
                  <SelectItem value="Edible" className="text-white hover:bg-gray-700">🍪 Edible</SelectItem>
                  <SelectItem value="Other" className="text-white hover:bg-gray-700">🔄 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionDate" className="text-gray-200 font-medium">Date & Time</Label>
              <Input
                id="sessionDate"
                type="datetime-local"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="bg-gray-700/50 border-gray-600 text-white backdrop-blur-sm hover:bg-gray-700/70 transition-all focus:border-green-400"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-gray-200 font-medium">{getQuantityLabel(sessionType)}</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="bg-gray-700/50 border-gray-600 text-white backdrop-blur-sm hover:bg-gray-700/70 transition-all focus:border-green-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="participants" className="text-gray-200 font-medium">Number of Participants</Label>
              <Input
                id="participants"
                type="number"
                min="1"
                max="20"
                value={participantCount}
                onChange={(e) => setParticipantCount(Number(e.target.value))}
                className="bg-gray-700/50 border-gray-600 text-white backdrop-blur-sm hover:bg-gray-700/70 transition-all focus:border-green-400"
              />
            </div>
          </div>

          {/* Individual Consumption Display */}
          <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <Label className="text-green-400 font-medium text-sm">Individual Consumption</Label>
            </div>
            <p className="text-lg font-semibold text-white">
              {individualConsumption.toFixed(2)} {getIndividualLabel(sessionType)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating" className="text-gray-200 font-medium">Rating</Label>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-all duration-200 transform hover:scale-110 ${
                      star <= rating 
                        ? 'text-yellow-400 drop-shadow-lg' 
                        : 'text-gray-600 hover:text-gray-500'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <span className="text-gray-300 font-medium">{rating}/5</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-200 font-medium">Notes <span className="text-gray-400 text-sm">(optional)</span></Label>
            <Textarea
              id="notes"
              placeholder="How was the session? Any special details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 min-h-[100px] backdrop-blur-sm hover:bg-gray-700/70 transition-all focus:border-green-400 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
            >
              Log Session
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700/50 py-3 backdrop-blur-sm transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
