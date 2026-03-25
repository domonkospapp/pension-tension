/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { ChevronDownIcon, TrendingUpIcon, WalletIcon, PiggyBankIcon, SettingsIcon, ZapIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function InvestmentCalculatorComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialCountry =
    (searchParams.get("country") || "").toLowerCase() === "hu" ? "hu" : "at";
  const [country, setCountry] = useState<"at" | "hu">(initialCountry);
  const isHU = country === "hu";

  const translations = {
    en: {
      title: "Pension Tension",
      subtitle: "Financial Independence Calculator",
      intro:
        "Determine how much you need to save and how long it will take to achieve financial independence, based on your income, expenses, and key financial factors.",
      incomeLabel: "Yearly Net Income",
      incomePlaceholder: "e.g. 60,000",
      expensesLabel: "Yearly Expenses",
      expensesPlaceholder: "e.g. 36,000",
      savingsLabel: "Current Savings",
      savingsPlaceholder: "e.g. 20,000",
      advanced: "Advanced Options",
      livingOffRate: "Living Off Rate (%)",
      interestRate: "Returns On Investments (%)",
      taxRate: "Investment Tax Rate (%)",
      calculate: "Calculate My Path to FIRE",
      resultPrefix: "You need approximately ",
      resultMiddle:
        " to start living off your investments. You need to save for approximately ",
      resultSuffix: " year(s).",
      savingsPeriod: "Savings Period",
      adjustSavings: "Adjust Savings Period",
      adjustYearsSuffix: " Years",
      savingsHint:
        "Consider starting to live off your investments later to reduce risk and maximize your net worth.",
      incomeContributions: "Income Contributions",
      investmentReturns: "Investment Returns",
      netWorthProjection: "Net Worth Projection for 40 Years",
      netWorth: "Net Worth",
      yearLabel: "Year",
      currencySymbol: "€",
      numberLocale: "en-US" as const,
      currencyCode: "EUR" as const,
    },
    hu: {
      title: "Pension Tension",
      subtitle: "Pénzügyi Függetlenség Kalkulátor",
      intro:
        "Ez a kalkulátor segít meghatározni, mennyit kell félretenned és mennyi időre van szükség a pénzügyi függetlenség eléréséhez a jövedelmed, kiadásaid és más fontos tényezők alapján.",
      incomeLabel: "Éves nettó jövedelem",
      incomePlaceholder: "pl. 6,000,000",
      expensesLabel: "Éves kiadások",
      expensesPlaceholder: "pl. 3,600,000",
      savingsLabel: "Jelenlegi megtakarítás",
      savingsPlaceholder: "pl. 2,000,000",
      advanced: "Speciális beállítások",
      livingOffRate: "Kivételi ráta (%)",
      interestRate: "Befektetések hozama (%)",
      taxRate: "Befektetési adókulcs (%) (TBSZ)",
      calculate: "Szükséges évek számítása",
      resultPrefix: "Körülbelül ",
      resultMiddle:
        " megtakarításra van szükséged, hogy megkezdhesd a befektetésekből való megélést. Körülbelül ",
      resultSuffix: " évig kell takarékoskodnod.",
      savingsPeriod: "Megtakarítási időszak",
      adjustSavings: "Megtakarítási időszak beállítása",
      adjustYearsSuffix: " év",
      savingsHint:
        "Megfontolhatod, hogy később kezdd el a befektetésekből való megélést a kockázatok csökkentése és a vagyon maximalizálása érdekében.",
      incomeContributions: "Jövedelemből származó befizetések",
      investmentReturns: "Befektetési hozam",
      netWorthProjection: "Vagyon alakulása 40 évre",
      netWorth: "Vagyon",
      yearLabel: "Év",
      currencySymbol: "Ft",
      numberLocale: "hu-HU" as const,
      currencyCode: "HUF" as const,
    },
  };
  const t = isHU ? translations.hu : translations.en;

  const currencyCode = t.currencyCode;
  const numberLocale = t.numberLocale;
  const currencySymbolForLabel = t.currencySymbol;

  const [income, setIncome] = useState("0");
  const [expenses, setExpenses] = useState("0");
  const [savings, setSavings] = useState("0");
  const [livingOffRate, setLivingOffRate] = useState("4");
  const [interestRate, setInterestRate] = useState("8");
  const [taxRate, setTaxRate] = useState(isHU ? "0" : "28");
  const [savingsChartData, setSavingsChartData] = useState<any[]>([]);
  const [netWorthChartData, setNetWorthChartData] = useState<any[]>([]);
  const [yearsNeeded, setYearsNeeded] = useState(0);
  const [amountNeeded, setAmountNeeded] = useState(0);
  const [actualYears, setActualYears] = useState(0);

  // Keep URL query param in sync with selected country
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (country === "hu") {
      params.set("country", "hu");
    } else {
      params.delete("country");
    }
    const qs = params.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;
    router.replace(href);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(numberLocale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatMillions = (value: number) => {
    return `${(value / 1000000).toFixed(1)}M`;
  };

  const formatInputValue = (value: string) => {
    const number = parseFloat(value.replace(/[^\d.-]/g, ""));
    if (isNaN(number)) return "";
    return number.toLocaleString("en-US");
  };

  const calculateNeededAmount = () => {
    const incomeNum = parseFloat(income.replace(/,/g, ""));
    const expensesNum = parseFloat(expenses.replace(/,/g, ""));
    const savingsNum = parseFloat(savings.replace(/,/g, ""));
    const livingOffRateNum = parseFloat(livingOffRate) / 100;
    const interestRateNum = parseFloat(interestRate) / 100;
    const taxRateNum = parseFloat(taxRate) / 100;

    if (expensesNum <= 0 || savingsNum < 0 || incomeNum <= 0) {
      alert("Please enter valid income, expenses, and savings.");
      return;
    }

    const neededAmount = expensesNum / livingOffRateNum;
    let years = 0;
    let totalSavings = savingsNum;
    const annualContributions = incomeNum - expensesNum;

    const newSavingsChartData = [];
    const newNetWorthChartData = [];

    // Accumulation phase
    while (totalSavings < neededAmount && years < 40) {
      const interestEarned = totalSavings * interestRateNum;
      totalSavings += annualContributions + interestEarned;
      years++;
      newSavingsChartData.push({
        year: years,
        contributions: annualContributions,
        returns: interestEarned,
      });
      newNetWorthChartData.push({
        year: years,
        netWorth: totalSavings,
      });
      console.log(totalSavings);
    }
    setYearsNeeded(years);
    setActualYears(years);

    // Living off investments phase
    for (let i = years; i < 40; i++) {
      const grossReturns = totalSavings * interestRateNum;
      const livingExpenses = expensesNum;
      const taxableAmount = Math.min(grossReturns, livingExpenses);
      const taxPaid = taxableAmount * taxRateNum;
      const netReturns = grossReturns - taxPaid;
      totalSavings = totalSavings + netReturns - livingExpenses;
      years++;
      newNetWorthChartData.push({
        year: years,
        netWorth: totalSavings,
      });
    }

    setSavingsChartData(newSavingsChartData);
    setNetWorthChartData(newNetWorthChartData);
    setAmountNeeded(neededAmount);
  };

  const handleYearsChange = (newYears: number) => {
    setActualYears(newYears);
    calculateChartData(newYears);
  };

  const calculateChartData = (years: number) => {
    const incomeNum = parseFloat(income.replace(/,/g, ""));
    const expensesNum = parseFloat(expenses.replace(/,/g, ""));
    const savingsNum = parseFloat(savings.replace(/,/g, ""));
    const interestRateNum = parseFloat(interestRate) / 100;
    const taxRateNum = parseFloat(taxRate) / 100;

    const newSavingsChartData = [];
    const newNetWorthChartData = [];
    let totalSavings = savingsNum;
    const annualContributions = incomeNum - expensesNum;

    // Accumulation phase
    for (let year = 0; year < years; year++) {
      const interestEarned = totalSavings * interestRateNum;
      totalSavings += annualContributions + interestEarned;
      newSavingsChartData.push({
        year: year + 1,
        contributions: annualContributions,
        returns: interestEarned,
      });
      newNetWorthChartData.push({
        year: year + 1,
        netWorth: totalSavings,
      });
    }

    // Living off investments phase
    for (let year = years; year < 40; year++) {
      const grossReturns = totalSavings * interestRateNum;
      const livingExpenses = expensesNum;
      const taxableAmount = Math.min(grossReturns, livingExpenses);
      const taxPaid = taxableAmount * taxRateNum;
      const netReturns = grossReturns - taxPaid;
      totalSavings = totalSavings + netReturns - livingExpenses;
      newNetWorthChartData.push({
        year: year + 1,
        netWorth: totalSavings,
      });
    }

    setSavingsChartData(newSavingsChartData);
    setNetWorthChartData(newNetWorthChartData);
  };

  useEffect(() => {
    if (savingsChartData.length > 0) {
      setSavingsChartData(savingsChartData.slice(0, actualYears));
    }
  }, [actualYears]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-strong rounded-xl p-3 shadow-2xl">
          <p className="font-semibold text-slate-200 text-sm mb-2">
            {t.yearLabel} {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatThousands = (value: number) => {
    return `${(value / 1000).toFixed(1)}K`;
  };

  useEffect(() => {
    if (isHU) {
      setTaxRate("0");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHU]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6 text-xs font-medium text-violet-300">
          <ZapIcon className="w-3 h-3" />
          <span>FIRE Calculator</span>
        </div>
        <h1 className="text-6xl font-bold gradient-text mb-4 tracking-tight">
          {t.title}
        </h1>
        <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
          {t.intro}
        </p>
      </div>

      {/* Country switcher */}
      <div className="flex justify-center mb-8">
        <div className="glass rounded-2xl p-1.5 flex gap-1">
          <button
            onClick={() => setCountry("at")}
            aria-pressed={!isHU}
            className={`pill-tab flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all ${!isHU ? "active" : "text-slate-400"}`}
          >
            <span className="fi fi-at" aria-hidden="true" />
            Austria <span className="text-xs opacity-60">EUR</span>
          </button>
          <button
            onClick={() => setCountry("hu")}
            aria-pressed={isHU}
            className={`pill-tab flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all ${isHU ? "active" : "text-slate-400"}`}
          >
            <span className="fi fi-hu" aria-hidden="true" />
            Hungary <span className="text-xs opacity-60">HUF</span>
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="glass-strong rounded-3xl p-8 glow-card mb-6">
        {/* Input grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="space-y-2">
            <Label htmlFor="income" className="text-slate-300 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
              <WalletIcon className="w-3.5 h-3.5 text-violet-400" />
              {t.incomeLabel} ({currencySymbolForLabel})
            </Label>
            <Input
              id="income"
              type="text"
              value={formatInputValue(income)}
              onChange={(e) => setIncome(e.target.value)}
              placeholder={t.incomePlaceholder}
              className="glass-input rounded-xl text-white placeholder:text-slate-600 border-0 h-12 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expenses" className="text-slate-300 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUpIcon className="w-3.5 h-3.5 text-pink-400" />
              {t.expensesLabel} ({currencySymbolForLabel})
            </Label>
            <Input
              id="expenses"
              type="text"
              value={formatInputValue(expenses)}
              onChange={(e) => setExpenses(e.target.value)}
              placeholder={t.expensesPlaceholder}
              className="glass-input rounded-xl text-white placeholder:text-slate-600 border-0 h-12 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="savings" className="text-slate-300 text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
              <PiggyBankIcon className="w-3.5 h-3.5 text-indigo-400" />
              {t.savingsLabel} ({currencySymbolForLabel})
            </Label>
            <Input
              id="savings"
              type="text"
              value={formatInputValue(savings)}
              onChange={(e) => setSavings(e.target.value)}
              placeholder={t.savingsPlaceholder}
              className="glass-input rounded-xl text-white placeholder:text-slate-600 border-0 h-12 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        {/* Advanced options */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 text-sm font-medium text-slate-400 hover:text-slate-200 glass rounded-xl mb-2 transition-all hover:border-violet-500/20 group">
            <SettingsIcon className="w-3.5 h-3.5 text-violet-400" />
            {t.advanced}
            <ChevronDownIcon className="w-4 h-4 ml-auto transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 glass rounded-xl mb-4">
              <div className="space-y-2">
                <Label htmlFor="livingOffRate" className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                  {t.livingOffRate}
                </Label>
                <Input
                  id="livingOffRate"
                  type="number"
                  value={livingOffRate}
                  onChange={(e) => setLivingOffRate(e.target.value)}
                  step="0.1"
                  className="glass-input rounded-xl text-white border-0 h-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate" className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                  {t.interestRate}
                </Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  step="0.1"
                  className="glass-input rounded-xl text-white border-0 h-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate" className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                  {t.taxRate}
                </Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  step="0.1"
                  className="glass-input rounded-xl text-white border-0 h-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Calculate button */}
        <button
          onClick={calculateNeededAmount}
          className="gradient-btn w-full py-4 rounded-xl text-white font-semibold text-base tracking-wide"
        >
          {t.calculate}
        </button>

        {/* Result */}
        {!!yearsNeeded && (
          <div className="mt-5 result-glow rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ZapIcon className="w-5 h-5 text-violet-300" />
              </div>
              <p className="text-slate-200 text-base leading-relaxed">
                {t.resultPrefix}
                <span className="font-bold text-violet-300">{formatCurrency(amountNeeded)}</span>
                {t.resultMiddle}
                <span className="font-bold text-pink-300">{yearsNeeded}</span>
                {t.resultSuffix}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Charts section */}
      {savingsChartData.length > 0 && (
        <div className="space-y-6">
          <div className="section-divider my-4" />

          {/* Savings period chart */}
          <div className="glass-strong rounded-3xl p-8 glow-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {t.savingsPeriod}
              </h3>
              <span className="text-sm text-violet-300 font-medium glass px-3 py-1 rounded-full">
                {actualYears}{t.adjustYearsSuffix}
              </span>
            </div>
            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-3">{t.savingsHint}</p>
              <Slider
                id="yearsSlider"
                min={1}
                max={40}
                step={1}
                value={[actualYears]}
                onValueChange={(value) => handleYearsChange(value[0])}
                className="[&_[role=slider]]:bg-violet-500 [&_[role=slider]]:border-violet-400 [&_[role=slider]]:shadow-lg [&_.relative]:bg-slate-700"
              />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={savingsChartData} barGap={0}>
                <XAxis
                  dataKey="year"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={{ stroke: "#1e293b" }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatThousands}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(139, 92, 246, 0.08)" }}
                  content={<CustomTooltip />}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", color: "#94a3b8", paddingTop: "12px" }}
                />
                <Bar
                  dataKey="contributions"
                  fill="#7c3aed"
                  name={t.incomeContributions}
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="returns"
                  fill="#ec4899"
                  name={t.investmentReturns}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Net worth projection chart */}
          {netWorthChartData.length > 0 && (
            <div className="glass-strong rounded-3xl p-8 glow-card">
              <h3 className="text-lg font-semibold text-white mb-6">
                {t.netWorthProjection}
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={netWorthChartData}>
                  <XAxis
                    dataKey="year"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={{ stroke: "#1e293b" }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatMillions}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(139, 92, 246, 0.08)" }}
                    content={<CustomTooltip />}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", color: "#94a3b8", paddingTop: "12px" }}
                  />
                  <Bar
                    dataKey="netWorth"
                    fill="url(#netWorthGradient)"
                    name={t.netWorth}
                    radius={[3, 3, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6d28d9" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-slate-600 text-xs mt-8 mb-4">
        Pension Tension — FIRE Calculator
      </p>
    </div>
  );
}
