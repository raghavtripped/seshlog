import { useState } from 'react';
import { usePainEntries, type PainEntry } from '@/hooks/usePainEntries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Zap, Trash2, Calendar, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const PainHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { entries, isLoading, deleteEntry } = usePainEntries();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteEntry.mutateAsync(id);
      toast({
        title: "Deleted",
        description: "Pain entry deleted successfully",
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

  const getPainLevelColor = (level: number) => {
    if (level <= 2) return 'text-green-500';
    if (level <= 4) return 'text-yellow-500';
    if (level <= 6) return 'text-orange-500';
    if (level <= 8) return 'text-red-500';
    return 'text-red-700';
  };

  const getStiffnessColor = (level: number) => {
    if (level <= 2) return 'text-green-500';
    if (level <= 4) return 'text-yellow-500';
    if (level <= 6) return 'text-orange-500';
    if (level <= 8) return 'text-red-500';
    return 'text-red-700';
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
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="heading-lg">Pain History</h1>
              <p className="text-muted-foreground body-sm">{entries.length} entries</p>
            </div>
          </div>
        </div>

        {/* Entries List */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {entries.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pain entries yet</p>
                <Button
                  onClick={() => navigate('/pain')}
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
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                        <Zap className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="font-semibold">{entry.location}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-2">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-muted-foreground">Pain:</span>
                            <span className={`font-medium ${getPainLevelColor(entry.pain_level)}`}>
                              {entry.pain_level}/10
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-muted-foreground">Stiffness:</span>
                            <span className={`font-medium ${getStiffnessColor(entry.stiffness_level)}`}>
                              {entry.stiffness_level}/10
                            </span>
                          </div>
                        </div>
                        {entry.description && (
                          <div className="text-sm text-muted-foreground mb-1">
                            {entry.description}
                          </div>
                        )}
                        {entry.triggers && (
                          <div className="text-sm text-muted-foreground mb-1">
                            Triggers: {entry.triggers}
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(entry.created_at), 'MMM d, yyyy h:mm a')}</span>
                        </div>
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

export default PainHistory;