"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/input";

function formatINR(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function EmiCalculator() {
  const [amount, setAmount] = useState(2500000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const { emi, totalInterest, totalPayment } = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const months = years * 12;
    if (monthlyRate === 0 || months === 0) {
      return { emi: amount / (months || 1), totalInterest: 0, totalPayment: amount };
    }
    const factor = Math.pow(1 + monthlyRate, months);
    const emiValue = (amount * monthlyRate * factor) / (factor - 1);
    const totalPaymentValue = emiValue * months;
    return {
      emi: emiValue,
      totalInterest: totalPaymentValue - amount,
      totalPayment: totalPaymentValue,
    };
  }, [amount, rate, years]);

  const principalShare = totalPayment > 0 ? (amount / totalPayment) * 100 : 100;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Loan amount</Label>
              <span className="font-mono-data text-sm font-medium">{formatINR(amount)}</span>
            </div>
            <input
              id="amount"
              type="range"
              min={100000}
              max={20000000}
              step={50000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-2 w-full accent-accent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="rate">Interest rate (annual)</Label>
              <span className="font-mono-data text-sm font-medium">{rate.toFixed(2)}%</span>
            </div>
            <input
              id="rate"
              type="range"
              min={5}
              max={18}
              step={0.05}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="mt-2 w-full accent-accent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="years">Tenure</Label>
              <span className="font-mono-data text-sm font-medium">{years} years</span>
            </div>
            <input
              id="years"
              type="range"
              min={1}
              max={30}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="mt-2 w-full accent-accent"
            />
          </div>
        </div>
      </Card>

      <Card className="flex flex-col justify-between p-6">
        <div>
          <p className="text-sm text-muted">Your monthly EMI</p>
          <p className="font-display mt-1 text-4xl font-semibold">{formatINR(emi)}</p>
        </div>

        <div className="mt-6">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-accent" style={{ width: `${principalShare}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" /> Principal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-line" /> Interest
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-3 border-t border-line pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Principal amount</span>
            <span className="font-mono-data font-medium">{formatINR(amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Total interest</span>
            <span className="font-mono-data font-medium">{formatINR(totalInterest)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Total payment</span>
            <span className="font-mono-data font-medium">{formatINR(totalPayment)}</span>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted">
          Indicative only — actual EMI depends on the partner bank&apos;s
          final terms.
        </p>
      </Card>
    </div>
  );
}
