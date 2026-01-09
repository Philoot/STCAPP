"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

// STC calculation constants
const DEEMING_PERIOD_YEARS = 2030 // STCs are calculated until 2030
const STC_MULTIPLIER = 1.382 // kW to STC multiplier

// Zone multipliers (representing solar radiation in different zones)
const ZONE_MULTIPLIERS: Record<number, number> = {
  1: 1.622,
  2: 1.536,
  3: 1.382,
  4: 1.185,
}

export function STCCalculator() {
  const [systemSize, setSystemSize] = useState("")
  const [postcode, setPostcode] = useState("")
  const [zone, setZone] = useState("")
  const [stcValue, setStcValue] = useState(38) // Current approximate STC market value
  const [result, setResult] = useState<{
    totalSTCs: number
    estimatedValue: number
  } | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const { toast } = useToast()

  const calculateSTCs = async () => {
    if (!systemSize || !postcode || !zone) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields to calculate STCs.",
        variant: "destructive",
      })
      return
    }

    setIsCalculating(true)

    const currentYear = new Date().getFullYear()
    const yearsRemaining = DEEMING_PERIOD_YEARS - currentYear

    if (yearsRemaining <= 0) {
      toast({
        title: "STC program ended",
        description: "The STC program has ended.",
        variant: "destructive",
      })
      setIsCalculating(false)
      return
    }

    const size = Number.parseFloat(systemSize)
    const zoneNum = Number.parseInt(zone)
    const zoneMultiplier = ZONE_MULTIPLIERS[zoneNum]

    // Calculate total STCs: System Size (kW) × Zone Rating × Deeming Period (years)
    const totalSTCs = Math.floor(size * zoneMultiplier * yearsRemaining)
    const estimatedValue = totalSTCs * stcValue

    setResult({
      totalSTCs,
      estimatedValue,
    })

    // Save to database
    try {
      const supabase = createClient()
      await supabase.from("calculations").insert({
        system_size: size,
        postcode,
        zone: zoneNum,
        stc_value: stcValue,
        total_stcs: totalSTCs,
      })
    } catch (error) {
      console.error("[v0] Error saving calculation:", error)
    }

    setIsCalculating(false)
  }

  return (
    <Card className="shadow-lg border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          STC Calculator
        </CardTitle>
        <CardDescription>Enter your solar system details to estimate your STC value</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="system-size">System Size (kW)</Label>
          <Input
            id="system-size"
            type="number"
            step="0.1"
            min="0"
            placeholder="e.g., 6.6"
            value={systemSize}
            onChange={(e) => setSystemSize(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Typical residential systems range from 3kW to 10kW</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="postcode">Postcode</Label>
          <Input
            id="postcode"
            type="text"
            placeholder="e.g., 2000"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            maxLength={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zone">Solar Zone</Label>
          <Select value={zone} onValueChange={setZone}>
            <SelectTrigger id="zone">
              <SelectValue placeholder="Select your zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Zone 1 - Highest solar radiation (Darwin, etc.)</SelectItem>
              <SelectItem value="2">Zone 2 - High solar radiation (Brisbane, Perth)</SelectItem>
              <SelectItem value="3">Zone 3 - Medium solar radiation (Sydney, Adelaide)</SelectItem>
              <SelectItem value="4">Zone 4 - Lower solar radiation (Melbourne, Hobart)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Your zone determines how many STCs your system generates</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stc-value">Current STC Value ($)</Label>
          <Input
            id="stc-value"
            type="number"
            step="1"
            min="0"
            value={stcValue}
            onChange={(e) => setStcValue(Number.parseFloat(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Current market value per STC (typically $35-$40)</p>
        </div>

        <Button onClick={calculateSTCs} className="w-full" disabled={isCalculating}>
          {isCalculating ? (
            "Calculating..."
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Calculate STCs
            </>
          )}
        </Button>

        {result && (
          <div className="mt-6 rounded-lg bg-primary/5 border border-primary/20 p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Your Estimated STC Value</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Total STCs:</span>
                <span className="text-2xl font-bold text-foreground">{result.totalSTCs}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Estimated Value:</span>
                <span className="text-3xl font-bold text-primary">${result.estimatedValue.toLocaleString()}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              This rebate is typically deducted from your upfront installation cost. Actual value may vary based on
              market conditions.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
