import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  LineChart,
  Line,
  Label,
} from "recharts";
import { mockCarData } from "@/data/mockCarData";
import { TrendingDown, BarChart3 } from "lucide-react";

interface Props {
  brand: string;
  model: string;
  year: number;
  kmsDriven: number;
  fuelType: string;
  transmission: string;
  engineSize: number;
  estimatedPrice: number;
}

export function PriceInsights({
  brand,
  model,
  year,
  kmsDriven,
  fuelType,
  transmission,
  engineSize,
  estimatedPrice,
}: Props) {
  const currentYear = new Date().getFullYear();
  const carAge = currentYear - year;

  const brandData = useMemo(
    () => mockCarData.filter((d) => d.brand === brand),
    [brand]
  );

  // Smooth, gradual depreciation curve.
  // Anchor: current estimated price corresponds to the car's actual age.
  // Use a per-year depreciation rate that tapers (cars lose ~15% in early
  // years and ~7% later). This produces a realistic monotonic decline
  // without ever flooring abruptly.
  const priceByAge = useMemo(() => {
    const rateForAge = (a: number) => {
      // Year 1: 18%, slowly tapering toward 6% by year 15
      if (a <= 1) return 0.18;
      if (a <= 3) return 0.14;
      if (a <= 6) return 0.11;
      if (a <= 10) return 0.08;
      return 0.06;
    };

    // Walk forward from age 0 to 15. Compute price-at-zero by reversing
    // depreciation from the user's anchor (carAge -> estimatedPrice).
    let priceAtZero = estimatedPrice;
    for (let a = 1; a <= carAge; a++) {
      priceAtZero = priceAtZero / (1 - rateForAge(a));
    }

    const points: { age: number; price: number }[] = [];
    let p = priceAtZero;
    points.push({ age: 0, price: Math.round(p * 100) / 100 });
    for (let a = 1; a <= 15; a++) {
      p = p * (1 - rateForAge(a));
      points.push({ age: a, price: Math.round(p * 100) / 100 });
    }
    return points;
  }, [carAge, estimatedPrice]);

  if (brandData.length < 5) return null;

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Depreciation · {brand} {model}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Projected value over time for your {year} {brand} {model} ({engineSize}L · {fuelType} · {transmission}).
        </p>
      </CardHeader>
      <CardContent>
        {/* Price vs Age */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-foreground">Price vs Age</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={priceByAge} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="age"
                fontSize={11}
                stroke="hsl(var(--muted-foreground))"
                label={{ value: "Age (years)", position: "insideBottom", offset: -2, fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                fontSize={11}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(v) => `₹${v}L`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => [`₹${v} Lakhs`, "Est. Price"]}
                labelFormatter={(l) => `Age: ${l} yr`}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
              <ReferenceDot
                x={carAge}
                y={estimatedPrice}
                r={6}
                fill="hsl(var(--accent))"
                stroke="hsl(var(--background))"
                strokeWidth={2}
                ifOverflow="extendDomain"
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-[11px] text-muted-foreground mt-1">
            Your car: {carAge} yr · ₹{estimatedPrice.toFixed(1)}L
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
