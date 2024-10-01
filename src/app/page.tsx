import { InvestmentCalculatorComponent } from "@/components/investment-calculator";

export default function Home() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center">
      <InvestmentCalculatorComponent />
    </div>
  );
}
