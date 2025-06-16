
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

export const SessionForm = ({ onSubmit, onCancel }: SessionFormProps) => {
  const [sessionType, setSessionType] = useState<SessionType>('Joint');
  const [participantCount, setParticipantCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number>(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      sessionType,
      participantCount,
      notes: notes.trim() || undefined,
      rating,
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Log New Session</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="type" className="text-gray-300">Session Type</Label>
          <Select value={sessionType} onValueChange={(value: SessionType) => setSessionType(value)}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Joint">Joint</SelectItem>
              <SelectItem value="Bong">Bong</SelectItem>
              <SelectItem value="Vape">Vape</SelectItem>
              <SelectItem value="Edible">Edible</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="participants" className="text-gray-300">Number of Participants</Label>
          <Input
            id="participants"
            type="number"
            min="1"
            max="20"
            value={participantCount}
            onChange={(e) => setParticipantCount(Number(e.target.value))}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating" className="text-gray-300">Rating (1-5)</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl transition-colors ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-600'
                }`}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-gray-300">Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="How was the session? Any special details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 min-h-[100px]"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            Log Session
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
