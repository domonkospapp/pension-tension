import { InvestmentCalculatorComponent } from "@/components/investment-calculator";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center">
      <Suspense fallback={<div className="text-gray-500">Loading…</div>}>
        <InvestmentCalculatorComponent />
      </Suspense>
    </div>
  );
}
