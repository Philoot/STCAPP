"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { History } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Calculation {
  id: string
  system_size: number
  postcode: string
  zone: number
  total_stcs: number
  stc_value: number
  created_at: string
}

export function RecentCalculations() {
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCalculations()
  }, [])

  const fetchCalculations = async () => {
    try {
      console.log("[v0] Fetching calculations from Supabase...")
      const supabase = createClient()

      const { data, error } = await supabase
        .from("calculations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("[v0] Error fetching calculations:", error)
        setError(error.message || "Could not load calculations")
        setCalculations([])
        return
      }

      console.log("[v0] Successfully fetched calculations:", data?.length || 0)
      setCalculations(data || [])
      setError(null)
    } catch (error) {
      console.error("[v0] Unexpected error:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-lg border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Recent Calculations
        </CardTitle>
        <CardDescription>See what others are calculating across Australia</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">Could not load recent calculations</p>
            <button onClick={fetchCalculations} className="text-sm text-primary hover:underline">
              Try again
            </button>
          </div>
        ) : calculations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No calculations yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {calculations.map((calc) => (
              <div
                key={calc.id}
                className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-foreground">{calc.system_size}kW System</div>
                    <div className="text-sm text-muted-foreground">
                      Postcode: {calc.postcode} • Zone {calc.zone}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">${(calc.total_stcs * calc.stc_value).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{calc.total_stcs} STCs</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
