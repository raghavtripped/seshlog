import { useState } from 'react';
import { useNutritionEntries, type NutritionEntry } from '@/hooks/useNutritionEntries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Utensils, Trash2, Calendar, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const NutritionHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { entries, isLoading, deleteEntry } = useNutritionEntries();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteEntry.mutateAsync(id);
      toast({
        title: "Deleted",
        description: "Nutrition entry deleted successfully",
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

  const getMealTypeEmoji = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'lunch': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'dinner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'snack': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
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
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="heading-lg">Nutrition History</h1>
              <p className="text-muted-foreground body-sm">{entries.length} entries</p>
            </div>
          </div>
        </div>

        {/* Entries List */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {entries.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No nutrition entries yet</p>
                <Button
                  onClick={() => navigate('/nutrition')}
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
                      <div className="text-2xl">
                        {getMealTypeEmoji(entry.meal_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold">{entry.description}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMealTypeColor(entry.meal_type)}`}>
                            {entry.meal_type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center space-x-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            <span className="text-sm">{entry.calories} cal</span>
                          </div>
                          {entry.protein && (
                            <div className="text-sm text-muted-foreground">
                              P: {entry.protein}g
                            </div>
                          )}
                          {entry.carbs && (
                            <div className="text-sm text-muted-foreground">
                              C: {entry.carbs}g
                            </div>
                          )}
                          {entry.fats && (
                            <div className="text-sm text-muted-foreground">
                              F: {entry.fats}g
                            </div>
                          )}
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

export default NutritionHistory;