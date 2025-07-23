import { useState } from 'react';
import { useWorkEntries, type WorkEntry } from '@/hooks/useWorkEntries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Briefcase, Trash2, Calendar, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const WorkHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { entries, isLoading, deleteEntry } = useWorkEntries();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteEntry.mutateAsync(id);
      toast({
        title: "Deleted",
        description: "Work entry deleted successfully",
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
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
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="heading-lg">Work History</h1>
              <p className="text-muted-foreground body-sm">{entries.length} entries</p>
            </div>
          </div>
        </div>

        {/* Entries List */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {entries.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No work entries yet</p>
                <Button
                  onClick={() => navigate('/work')}
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
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold">{entry.task_description}</span>
                        </div>
                        {entry.project && (
                          <div className="text-sm text-muted-foreground mb-1">
                            Project: {entry.project}
                          </div>
                        )}
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">{formatDuration(entry.duration_minutes)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-muted-foreground">Productivity:</span>
                            <div className="flex items-center space-x-0.5">
                              {renderStars(entry.productivity_level)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(entry.created_at), 'MMM d, yyyy h:mm a')}</span>
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

export default WorkHistory;