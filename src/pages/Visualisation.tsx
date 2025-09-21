import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppDashboard } from '@/components/AppDashboard'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAuth } from '@/hooks/useAuth'
import { useSessions } from '@/hooks/useSessions'
import { Category, Session, SessionType } from '@/types/session'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { FilterSortDialog } from '@/components/FilterSortDialog'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  format,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  parseISO,
} from 'date-fns'
import { getNormalizedIndividualConsumption, getCategoryBaseUnit } from '@/lib/utils'
import { DateRange } from 'react-day-picker'
import { supabase } from '@/integrations/supabase/client'
import { LiquorServingSize, SessionType as AllSessionType } from '@/types/session'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type TimeGranularity = 'day' | 'week' | 'month' | 'year'

const CATEGORY_ORDER: Category[] = ['weed', 'cigs', 'vapes', 'liquor']

const getCategoryColor = (category: Category) => {
  switch (category) {
    case 'weed':
      return '#10b981'
    case 'cigs':
      return '#6b7280'
    case 'vapes':
      return '#06b6d4'
    case 'liquor':
      return '#f59e0b'
    default:
      return '#3b82f6'
  }
}

const getStartOfPeriod = (date: Date, granularity: TimeGranularity): Date => {
  switch (granularity) {
    case 'day':
      return startOfDay(date)
    case 'week':
      return startOfWeek(date)
    case 'month':
      return startOfMonth(date)
    case 'year':
      return startOfYear(date)
    default:
      return startOfDay(date)
  }
}

const addPeriod = (date: Date, granularity: TimeGranularity): Date => {
  switch (granularity) {
    case 'day':
      return addDays(date, 1)
    case 'week':
      return addWeeks(date, 1)
    case 'month':
      return addMonths(date, 1)
    case 'year':
      return addYears(date, 1)
    default:
      return addDays(date, 1)
  }
}

const isSamePeriod = (
  date1: Date,
  date2: Date,
  granularity: TimeGranularity
): boolean => {
  switch (granularity) {
    case 'day':
      return isSameDay(date1, date2)
    case 'week':
      return isSameWeek(date1, date2)
    case 'month':
      return isSameMonth(date1, date2)
    case 'year':
      return isSameYear(date1, date2)
    default:
      return isSameDay(date1, date2)
  }
}

export default function Visualisation() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { user, loading: authLoading } = useAuth()

  const [granularity, setGranularity] = useState<TimeGranularity>('week')
  const [selectedCategories, setSelectedCategories] = useState<Record<Category, boolean>>({
    weed: true,
    cigs: true,
    vapes: true,
    liquor: true,
  })

  // Global Filter & Sort state (applies across categories)
  const [selectedType, setSelectedType] = useState<SessionType | 'All'>('All')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [sortBy, setSortBy] = useState<string>('date-desc')
  const [normalize, setNormalize] = useState<boolean>(false)
  const [overlapThreshold, setOverlapThreshold] = useState<number>(20)

  // Fetch sessions per category
  const weedData = useSessions('weed')
  const cigsData = useSessions('cigs')
  const vapesData = useSessions('vapes')
  const liquorData = useSessions('liquor')

  const isLoading =
    weedData.isLoading || cigsData.isLoading || vapesData.isLoading || liquorData.isLoading

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [authLoading, user, navigate])

  // Robust fetch for all categories with pagination, fallback to useSessions if not available yet
  const [overrideSessionsByCategory, setOverrideSessionsByCategory] = useState<null | Record<Category, Session[]>>(null)

  useEffect(() => {
    const fetchAll = async () => {
      if (!user) return
      const pageSize = 1000
      let from = 0
      type RawRow = {
        id: string
        user_id: string
        category: string
        session_type: string
        quantity: number
        participant_count: number
        notes: string | null
        rating: number | null
        session_date: string
        created_at: string
        updated_at: string
        liquor_serving_size?: string
      }
      let acc: RawRow[] = []
      while (true) {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', user.id)
          .in('category', CATEGORY_ORDER)
          .order('session_date', { ascending: false })
          .range(from, from + pageSize - 1)

        if (error) {
          console.error('[Visualisation] fetchAll error', error)
          break
        }
        acc = acc.concat(data || [])
        if (!data || data.length < pageSize) break
        from += pageSize
      }

      const byCat: Record<Category, Session[]> = { weed: [], cigs: [], vapes: [], liquor: [] }
      acc.forEach((r: RawRow) => {
        const cat = r.category as Category
        const mapped: Session = {
          id: r.id,
          user_id: r.user_id,
          category: cat,
          session_type: r.session_type as AllSessionType,
          quantity: r.quantity,
          participant_count: r.participant_count,
          notes: r.notes,
          rating: r.rating,
          session_date: r.session_date,
          created_at: r.created_at,
          updated_at: r.updated_at,
          liquor_serving_size: r.liquor_serving_size as LiquorServingSize | undefined,
        }
        byCat[cat].push(mapped)
      })
      setOverrideSessionsByCategory(byCat)
    }
    fetchAll()
  }, [user])

  const allSessionsByCategory = useMemo<Record<Category, Session[]>>(
    () =>
      overrideSessionsByCategory || {
        weed: weedData.sessions || [],
        cigs: cigsData.sessions || [],
        vapes: vapesData.sessions || [],
        liquor: liquorData.sessions || [],
      },
    [overrideSessionsByCategory, weedData.sessions, cigsData.sessions, vapesData.sessions, liquorData.sessions]
  )

  const activeCategories = CATEGORY_ORDER.filter((c) => selectedCategories[c])

  type OverlayRow = { date: string; sortKey: string } & Partial<Record<Category, number>>

  const overlayResult = useMemo<{ rows: OverlayRow[]; absRows: OverlayRow[]; maxByCat: Partial<Record<Category, number>> }>(() => {
    // Gather sessions from active categories
    const sessions = activeCategories.flatMap((cat) => allSessionsByCategory[cat])

    // Apply global filters for range calculation
    const filteredForRange = sessions.filter((session) => {
      const sDate = parseISO(session.session_date)
      const inRange = !dateRange || (!dateRange.from && !dateRange.to) || (
        (!dateRange.from || sDate >= dateRange.from) && (!dateRange.to || sDate <= dateRange.to)
      )
      const typeMatches = selectedType === 'All' || session.session_type === selectedType
      return inRange && typeMatches
    })

    // Determine series boundaries honoring dateRange when present
    let seriesStart: Date | undefined
    let seriesEnd: Date | undefined

    if (dateRange?.from) {
      seriesStart = getStartOfPeriod(dateRange.from, granularity)
    }
    if (dateRange?.to) {
      seriesEnd = getStartOfPeriod(dateRange.to, granularity)
    }

    if (!seriesStart || !seriesEnd) {
      if (filteredForRange.length > 0) {
        const dates = filteredForRange.map((s) => parseISO(s.session_date))
        const computedStart = getStartOfPeriod(
          new Date(Math.min(...dates.map((d) => d.getTime()))),
          granularity
        )
        const computedEnd = getStartOfPeriod(
          new Date(Math.max(...dates.map((d) => d.getTime()))),
          granularity
        )
        seriesStart = seriesStart || computedStart
        seriesEnd = seriesEnd || computedEnd
      }
    }

    // If still no bounds and no dateRange selected, nothing to chart
    if (!seriesStart || !seriesEnd) {
      return { rows: [], absRows: [], maxByCat: {} }
    }

    const rowsAbs: OverlayRow[] = []

    let currentDate = seriesStart
    while (currentDate <= seriesEnd) {
      let displayDate: string
      switch (granularity) {
        case 'day':
          displayDate = format(currentDate, 'MMM dd')
          break
        case 'week':
          displayDate = format(currentDate, "'Week of' MMM dd")
          break
        case 'month':
          displayDate = format(currentDate, "MMM ''yy")
          break
        case 'year':
          displayDate = format(currentDate, 'yyyy')
          break
        default:
          displayDate = format(currentDate, 'MMM dd')
      }

      const baseRow: OverlayRow = { date: displayDate, sortKey: format(currentDate, 'yyyy-MM-dd') }

      // Initialize all categories to zero for this period
      activeCategories.forEach((cat) => {
        baseRow[cat] = 0
      })

      // Aggregate values for each active category in this period
      activeCategories.forEach((cat) => {
        // Apply global filters (type + date range)
        const catSessions = allSessionsByCategory[cat].filter((session) => {
          const sDate = parseISO(session.session_date)
          const inRange = !dateRange || (!dateRange.from && !dateRange.to) || (
            (!dateRange.from || sDate >= dateRange.from) && (!dateRange.to || sDate <= dateRange.to)
          )
          const typeMatches = selectedType === 'All' || session.session_type === selectedType
          return inRange && typeMatches
        })

        catSessions.forEach((session) => {
          const sDate = parseISO(session.session_date)
          if (isSamePeriod(currentDate, sDate, granularity)) {
            baseRow[cat] = (baseRow[cat] || 0) + getNormalizedIndividualConsumption(session)
          }
        })
      })

      rowsAbs.push(baseRow)
      currentDate = addPeriod(currentDate, granularity)
    }

    const absSorted = rowsAbs.sort((a, b) => String(a.sortKey).localeCompare(String(b.sortKey)))

    // Compute per-category max for normalization
    const maxByCat: Partial<Record<Category, number>> = {}
    CATEGORY_ORDER.forEach((cat) => {
      if (!selectedCategories[cat]) return
      maxByCat[cat] = absSorted.reduce((m, r) => Math.max(m, Number(r[cat] || 0)), 0)
    })

    let rows: OverlayRow[] = absSorted
    if (normalize) {
      rows = absSorted.map((r) => {
        const nr: OverlayRow = { date: r.date, sortKey: r.sortKey }
        CATEGORY_ORDER.forEach((cat) => {
          if (!selectedCategories[cat]) return
          const maxVal = maxByCat[cat] || 1
          const val = Number(r[cat] || 0)
          nr[cat] = maxVal === 0 ? 0 : (val / maxVal) * 100
        })
        return nr
      })
    }

    return { rows, absRows: absSorted, maxByCat }
    // sortBy is intentionally ignored for charts (time series is always chronological)
  }, [activeCategories, allSessionsByCategory, granularity, selectedType, dateRange, normalize, selectedCategories])

  const granularityOptions: { value: TimeGranularity; label: string }[] = [
    { value: 'day', label: 'Days' },
    { value: 'week', label: 'Weeks' },
    { value: 'month', label: 'Months' },
    { value: 'year', label: 'Years' },
  ]

  const toggleCategory = (category: Category, checked: boolean | string) => {
    setSelectedCategories((prev) => ({ ...prev, [category]: Boolean(checked) }))
  }

  // Tooltip content listing all active series
  type TooltipPayloadItem = { dataKey?: string; color?: string; value?: number }
  interface TooltipProps {
    active?: boolean
    payload?: TooltipPayloadItem[]
    label?: string
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (!active || !payload || payload.length === 0) return null
    return (
      <div className="bg-white/95 dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <div className="mt-2 space-y-1">
          {payload
            .filter((p) => p && p.dataKey && selectedCategories[(p.dataKey as Category)])
            .map((p) => {
              const cat = (p.dataKey as Category) || 'weed'
              const unit = ` ${getCategoryBaseUnit(cat)}`
              const color = p.color || '#999'
              const val = typeof p.value === 'number' ? p.value : 0
              const absRow = overlayResult.absRows.find((r) => r.date === label)
              const absVal = absRow ? Number(absRow[cat] || 0) : 0
              return (
                <div key={cat} className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold" style={{ color }}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}:
                  </span>{' '}
                  {normalize ? `${val.toFixed(0)}%` : `${val.toFixed(2)}${unit}`} {normalize ? `• ${absVal.toFixed(2)}${unit}` : ''}
                </div>
              )
            })}
        </div>
      </div>
    )
  }

  const hasAnyData = CATEGORY_ORDER.some(
    (c) => (allSessionsByCategory[c] && allSessionsByCategory[c].length > 0)
  )

  // Compute co-usage windows (bins) where multiple categories are active above a threshold
  type OverlapEvent = {
    date: string
    sortKey: string
    activeCount: number
    totalPercent: number
    categories: Array<{ cat: Category; abs: number; unit: string; percent: number }>
  }

  const overlapEvents = useMemo<OverlapEvent[]>(() => {
    if (overlayResult.absRows.length === 0) return []
    const events: OverlapEvent[] = []

    overlayResult.absRows.forEach((row) => {
      const cats: Array<{ cat: Category; abs: number; unit: string; percent: number }> = []
      CATEGORY_ORDER.forEach((cat) => {
        if (!selectedCategories[cat]) return
        const abs = Number(row[cat] || 0)
        const maxVal = overlayResult.maxByCat[cat] || 0
        const percent = maxVal === 0 ? 0 : (abs / maxVal) * 100
        if (percent >= overlapThreshold) {
          cats.push({ cat, abs, unit: getCategoryBaseUnit(cat), percent })
        }
      })
      if (cats.length >= 2) {
        const totalPercent = cats.reduce((s, c) => s + c.percent, 0)
        events.push({ date: row.date, sortKey: row.sortKey, activeCount: cats.length, totalPercent, categories: cats })
      }
    })

    return events
      .sort((a, b) => (b.activeCount - a.activeCount) || (b.totalPercent - a.totalPercent))
      .slice(0, 12)
  }, [overlayResult.absRows, overlayResult.maxByCat, selectedCategories, overlapThreshold])

  return (
    <AppDashboard
      title="Visualisation"
      emoji="📈"
      category="vapes"
      onBackToCategories={() => navigate('/categories')}
    >
      <div className="space-y-6">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="heading-md text-gray-800 dark:text-gray-200">Overlay Charts</h2>
              <p className="body-sm text-gray-600 dark:text-gray-400">
                Toggle categories to superimpose their quantity graphs.
              </p>
            </div>
            {/* Global Filter & Sort */}
            <FilterSortDialog
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              dateRange={dateRange}
              setDateRange={setDateRange}
              sortBy={sortBy}
              setSortBy={setSortBy}
              category={'weed'}
              buttonWidth=""
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-4 items-center">
            {CATEGORY_ORDER.map((cat) => (
              <label key={cat} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${cat}`}
                  checked={selectedCategories[cat]}
                  onCheckedChange={(v) => toggleCategory(cat, v)}
                />
                <Label htmlFor={`cat-${cat}`} className="cursor-pointer">
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
                    style={{ backgroundColor: getCategoryColor(cat) }}
                  />
                  {cat.charAt(0).toUpperCase() + cat.slice(1)} ({getCategoryBaseUnit(cat)})
                </Label>
              </label>
            ))}
            <label className="flex items-center gap-2 ml-auto">
              <Checkbox id="normalize" checked={normalize} onCheckedChange={(v) => setNormalize(Boolean(v))} />
              <Label htmlFor="normalize">Normalize (0-100%)</Label>
            </label>
          </div>
        </div>

        {/* Granularity */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                Chart Granularity
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose time period grouping
              </p>
            </div>
          </div>
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-3'}`}>
            {granularityOptions.map((opt) => {
              const isSelected = granularity === opt.value
              return (
                <Button
                  key={opt.value}
                  onClick={() => setGranularity(opt.value)}
                  variant={isSelected ? 'default' : 'outline'}
                  size={isMobile ? 'sm' : 'default'}
                  className={
                    isSelected
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent hover:opacity-90 rounded-xl'
                      : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-white/70 dark:hover:bg-gray-800/70 rounded-xl'
                  }
                >
                  {opt.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overlay" className="w-full">
          <TabsList className="mb-3">
            <TabsTrigger value="overlay">Overlay</TabsTrigger>
            <TabsTrigger value="more">More visualisations</TabsTrigger>
          </TabsList>

          {/* Overlay Tab */}
          <TabsContent value="overlay">
        {/* Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading-md text-gray-800 dark:text-gray-200">Quantity Over Time</h3>
            {!hasAnyData && (
              <span className="text-sm text-gray-500">No data yet</span>
            )}
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overlayResult.rows}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" className="text-sm" tick={{ fontSize: 12 }} />
                <YAxis className="text-sm" tick={{ fontSize: 12 }} domain={normalize ? [0, 100] : ['auto', 'auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {CATEGORY_ORDER.filter((c) => selectedCategories[c]).map((cat) => (
                  <Line
                    key={cat}
                    type="monotone"
                    dataKey={cat}
                    name={normalize ? `${cat.charAt(0).toUpperCase() + cat.slice(1)} (% of max)` : `${cat.charAt(0).toUpperCase() + cat.slice(1)} (${getCategoryBaseUnit(cat)})`}
                    stroke={getCategoryColor(cat)}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
          </TabsContent>

          {/* More visualisations Tab */}
          <TabsContent value="more">
            <div className="glass-card p-4 mb-4">
              {/* Global Filter & Sort duplicated for this tab */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h3 className="heading-md text-gray-800 dark:text-gray-200">Per-category charts</h3>
                <FilterSortDialog
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  category={'weed'}
                  buttonWidth=""
                />
              </div>
            </div>

            {/* Stacked charts sharing the same time extent */}
            <div className="space-y-6">
              {CATEGORY_ORDER.filter((c) => selectedCategories[c]).map((cat) => (
                <div key={`stack-${cat}`} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="heading-md text-gray-800 dark:text-gray-200">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)} ({getCategoryBaseUnit(cat)})
                    </h4>
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={overlayResult.rows}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="date" className="text-sm" tick={{ fontSize: 12 }} />
                        <YAxis className="text-sm" tick={{ fontSize: 12 }} domain={normalize ? [0, 100] : ['auto', 'auto']} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey={cat}
                          name={normalize ? `${cat.charAt(0).toUpperCase() + cat.slice(1)} (% of max)` : `${cat.charAt(0).toUpperCase() + cat.slice(1)} (${getCategoryBaseUnit(cat)})`}
                          stroke={getCategoryColor(cat)}
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Co-usage Insights */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="heading-md text-gray-800 dark:text-gray-200">Co-usage windows</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Threshold</span>
              <Select value={String(overlapThreshold)} onValueChange={(v) => setOverlapThreshold(parseInt(v))}>
                <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 40, 50, 60].map((t) => (
                    <SelectItem key={t} value={String(t)}>{t}% of max</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {overlapEvents.length === 0 ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">No overlapping windows at the current threshold.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {overlapEvents.map((e) => (
                <div key={e.sortKey} className="glass-card-secondary p-3 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-800 dark:text-gray-100">{e.date}</div>
                    <div className="text-xs text-gray-500">{e.activeCount} categories</div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {e.categories.map((c) => (
                      <div key={c.cat} className="text-sm">
                        <span className="inline-block w-2 h-2 rounded-full mr-2 align-middle" style={{ backgroundColor: getCategoryColor(c.cat) }} />
                        <span className="font-medium">{c.cat.charAt(0).toUpperCase() + c.cat.slice(1)}:</span>{' '}
                        {normalize ? `${c.percent.toFixed(0)}%` : `${c.abs.toFixed(2)} ${c.unit}`}
                        {normalize ? ` • ${c.abs.toFixed(2)} ${c.unit}` : ''}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reading guide */}
        <div className="glass-card p-6">
          <h3 className="heading-md text-gray-800 dark:text-gray-200 mb-2">How to read Co-usage windows</h3>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p>- Each row is a time bin defined by your selected granularity (Days/Weeks/Months/Years).</p>
            <p>- A window appears when at least two categories are above the selected <span className="font-medium">Threshold</span> (percentage of that category’s own maximum within the current date range).</p>
            <p>- For each category we show <span className="font-medium">% of max</span> and the <span className="font-medium">absolute quantity</span> with units for that bin.</p>
            <p>- Results are sorted by how many categories are active, then by combined intensity (sum of percents).</p>
            <div className="mt-3">
              <div className="font-semibold mb-1">Examples</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>“Weed: 83% • 4.64 g” means this bin has weed at 83% of your peak weed usage for the selected range, which equals 4.64 g.</li>
                <li>If Threshold = 20% and a row shows 3 categories, all three were at or above 20% of their respective peaks in that bin.</li>
                <li>Turn on “Normalize (0-100%)” in the chart to compare shapes across categories; use the absolute values in the list to see real quantities.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppDashboard>
  )
}


