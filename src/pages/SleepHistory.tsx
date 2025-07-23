import { useState } from 'react';
import { useSleepEntries, type SleepEntry } from '@/hooks/useSleepEntries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Moon, Trash2, Calendar, Clock, Star, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const SleepHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { entries, isLoading, deleteEntry } = useSleepEntries();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteEntry.mutateAsync(id);
      toast({
        title: "Deleted",
        description: "Sleep entry deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const renderQualityStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  const getQualityColor = (rating: number) => {
    if (rating <= 2) return 'text-red-500';
    if (rating <= 3) return 'text-orange-500';
    if (rating <= 4) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 pt-16 pb-20">
        <div className="container mx-auto px-4 py-8">
          <div className="glass-card p-6 max-w-2xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="skeleton w-12 h-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-3 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 pt-16 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/routines')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="heading-lg">Sleep History</h1>
              <p className="text-muted-foreground body-sm">{entries.length} entries</p>
            </div>
          </div>
        </div>

        {/* Entries List */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {entries.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Moon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No sleep entries yet</p>
                <Button
                  onClick={() => navigate('/sleep')}
                  className="mt-4"
                >
                  Add First Entry
                </Button>
              </CardContent>
            </Card>
          ) : (
            entries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm font-medium">{entry.duration_hours}h</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-muted-foreground">Quality:</span>
                            <div className="flex items-center space-x-0.5">
                              {renderQualityStars(entry.quality_rating)}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Bedtime:</span>
                            <span className="ml-1 font-medium">{entry.bedtime}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Wake:</span>
                            <span className="ml-1 font-medium">{entry.wake_time}</span>
                          </div>
                        </div>
                        {entry.awakenings > 0 && (
                          <div className="flex items-center space-x-1 mb-1">
                            <AlertCircle className="w-3 h-3 text-orange-500" />
                            <span className="text-sm text-orange-600 dark:text-orange-400">
                              Awoke {entry.awakenings} time{entry.awakenings !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(entry.created_at), 'MMM d, yyyy')}</span>
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SleepHistory;