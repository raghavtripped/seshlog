import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { user_id } = await req.json()

    if (!user_id) {
      throw new Error('user_id is required')
    }

    // Fetch last 30 days of events for analysis
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    
    const { data: events, error: eventsError } = await supabaseClient
      .from('daily_events')
      .select('*')
      .eq('user_id', user_id)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true })

    if (eventsError) throw eventsError

    console.log(`Analyzing ${events.length} events for user ${user_id}`)

    const insights: string[] = []

    // Analysis 1: Sleep Quality vs Next Day Mood Correlation
    const sleepEvents = events.filter(e => e.event_type === 'SLEEP_LOG')
    const moodEvents = events.filter(e => e.event_type === 'MOOD_LOG_AM')
    
    if (sleepEvents.length >= 5 && moodEvents.length >= 5) {
      // Simple correlation analysis
      const sleepMoodPairs = []
      
      for (const sleepEvent of sleepEvents) {
        const sleepDate = new Date(sleepEvent.created_at).toDateString()
        const nextDayMood = moodEvents.find(m => {
          const moodDate = new Date(m.created_at)
          const sleepEventDate = new Date(sleepEvent.created_at)
          return moodDate.getTime() > sleepEventDate.getTime() && 
                 moodDate.getTime() < sleepEventDate.getTime() + 24 * 60 * 60 * 1000
        })
        
        if (nextDayMood && sleepEvent.payload.quality && nextDayMood.payload.mood) {
          sleepMoodPairs.push({
            sleep_quality: sleepEvent.payload.quality,
            next_mood: typeof nextDayMood.payload.mood === 'string' ? 
              getMoodScore(nextDayMood.payload.mood) : nextDayMood.payload.mood
          })
        }
      }

      if (sleepMoodPairs.length >= 3) {
        const avgSleepQuality = sleepMoodPairs.reduce((sum, p) => sum + p.sleep_quality, 0) / sleepMoodPairs.length
        const avgMood = sleepMoodPairs.reduce((sum, p) => sum + p.next_mood, 0) / sleepMoodPairs.length
        
        const correlation = calculateCorrelation(
          sleepMoodPairs.map(p => p.sleep_quality),
          sleepMoodPairs.map(p => p.next_mood)
        )

        if (correlation > 0.3) {
          insights.push(`Strong positive correlation detected: Better sleep quality leads to improved next-day mood (correlation: ${(correlation * 100).toFixed(0)}%)`)
        } else if (correlation < -0.3) {
          insights.push(`Negative correlation detected: Higher sleep quality appears linked to lower mood scores`)
        }

        if (avgSleepQuality < 3) {
          insights.push(`Your average sleep quality is ${avgSleepQuality.toFixed(1)}/5. Consider improving your sleep routine.`)
        }
      }
    }

    // Analysis 2: Activity vs Energy Patterns
    const activityEvents = events.filter(e => e.event_type === 'ACTIVITY_LOG')
    const reflectionEvents = events.filter(e => e.event_type === 'DAILY_REFLECTION')
    
    if (activityEvents.length >= 3) {
      const activeDays = new Set(activityEvents.map(e => new Date(e.created_at).toDateString()))
      const totalDays = Math.ceil((Date.now() - new Date(thirtyDaysAgo).getTime()) / (24 * 60 * 60 * 1000))
      const activityFrequency = (activeDays.size / totalDays) * 100

      if (activityFrequency > 50) {
        insights.push(`Excellent activity consistency! You're active ${activityFrequency.toFixed(0)}% of days.`)
      } else if (activityFrequency < 25) {
        insights.push(`Low activity frequency detected (${activityFrequency.toFixed(0)}% of days). Consider increasing physical activity.`)
      }
    }

    // Analysis 3: Hydration Patterns
    const hydrationEvents = events.filter(e => e.event_type === 'HYDRATION_LOG')
    
    if (hydrationEvents.length >= 5) {
      const dailyHydration = new Map()
      
      hydrationEvents.forEach(event => {
        const date = new Date(event.created_at).toDateString()
        const quantity = event.payload.quantity_ml || 0
        dailyHydration.set(date, (dailyHydration.get(date) || 0) + quantity)
      })

      const avgDailyHydration = Array.from(dailyHydration.values()).reduce((sum, qty) => sum + qty, 0) / dailyHydration.size

      if (avgDailyHydration < 1500) {
        insights.push(`Low hydration detected: Average ${avgDailyHydration.toFixed(0)}ml/day. Aim for 2000ml+ daily.`)
      } else if (avgDailyHydration > 2500) {
        insights.push(`Great hydration habits! You're averaging ${avgDailyHydration.toFixed(0)}ml/day.`)
      }
    }

    // Analysis 4: Pain and Activity Relationship
    const somaticEvents = events.filter(e => e.event_type === 'SOMATIC_LOG_AM')
    
    if (somaticEvents.length >= 5 && activityEvents.length >= 3) {
      const activeDaysSet = new Set(activityEvents.map(e => new Date(e.created_at).toDateString()))
      const painOnActiveDays = []
      const painOnRestDays = []

      somaticEvents.forEach(event => {
        const eventDate = new Date(event.created_at).toDateString()
        const painLevel = event.payload.pain || 0
        
        if (activeDaysSet.has(eventDate)) {
          painOnActiveDays.push(painLevel)
        } else {
          painOnRestDays.push(painLevel)
        }
      })

      if (painOnActiveDays.length >= 2 && painOnRestDays.length >= 2) {
        const avgPainActive = painOnActiveDays.reduce((sum, p) => sum + p, 0) / painOnActiveDays.length
        const avgPainRest = painOnRestDays.reduce((sum, p) => sum + p, 0) / painOnRestDays.length

        if (avgPainActive < avgPainRest - 1) {
          insights.push(`Activity appears to reduce pain levels. Pain on active days: ${avgPainActive.toFixed(1)}/10 vs rest days: ${avgPainRest.toFixed(1)}/10`)
        } else if (avgPainActive > avgPainRest + 1) {
          insights.push(`Higher pain levels on active days detected. Consider adjusting activity intensity.`)
        }
      }
    }

    // Default insights if no patterns found
    if (insights.length === 0) {
      insights.push("Continue logging consistently to unlock personalized insights!")
      if (events.length < 10) {
        insights.push("More data needed for meaningful analysis. Keep logging your daily activities.")
      }
    }

    // Create user_insights table if it doesn't exist and store insights
    const { error: createTableError } = await supabaseClient.rpc('create_user_insights_table')
    
    // Store insights (overwrite previous ones)
    const { error: deleteError } = await supabaseClient
      .from('user_insights')
      .delete()
      .eq('user_id', user_id)

    const insightRecords = insights.map((insight, index) => ({
      user_id,
      insight_text: insight,
      generated_at: new Date().toISOString(),
      priority: index + 1
    }))

    const { error: insertError } = await supabaseClient
      .from('user_insights')
      .insert(insightRecords)

    if (insertError) {
      console.error('Error inserting insights:', insertError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        insights,
        events_analyzed: events.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in insights-engine:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

// Helper functions
function getMoodScore(mood: string): number {
  const moodMap: Record<string, number> = {
    'Sad': 2,
    'Anxious': 3,
    'Tired': 4,
    'Neutral': 5,
    'Calm': 6,
    'Happy': 7,
    'Energetic': 8
  }
  return moodMap[mood] || 5
}

function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length
  if (n === 0) return 0
  
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)
  const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0)
  
  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY))
  
  return denominator === 0 ? 0 : numerator / denominator
} 