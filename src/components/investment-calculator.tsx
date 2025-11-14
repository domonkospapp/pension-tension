/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { ChevronDownIcon } from "lucide-react";
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
      intro:
        "This calculator helps you determine how much you need to save and how long it will take to achieve financial independence, based on your income, expenses, and other key financial factors.",
      incomeLabel: "Yearly Net Income",
      incomePlaceholder: "Enter your yearly net income",
      expensesLabel: "Yearly Expenses",
      expensesPlaceholder: "Enter your yearly expenses",
      savingsLabel: "Current Savings",
      savingsPlaceholder: "Enter your current savings",
      advanced: "Advanced Options",
      livingOffRate: "Living Off Rate (%)",
      interestRate: "Returns On Investments (%)",
      taxRate: "Investment Tax Rate (%)",
      calculate: "Calculate Needed Years",
      resultPrefix: "You need approximately ",
      resultMiddle:
        " to start living off your investments. You need to save for approximately ",
      resultSuffix: " year(s).",
      savingsPeriod: "Savings Period",
      adjustSavings: "Adjust Savings Period",
      adjustYearsSuffix: " Years",
      savingsHint:
        "You can consider starting to live off your investments later to decrease risks and maximize your net worth.",
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
      intro:
        "Ez a kalkulátor segít meghatározni, mennyit kell félretenned és mennyi időre van szükség a pénzügyi függetlenség eléréséhez a jövedelmed, kiadásaid és más fontos tényezők alapján.",
      incomeLabel: "Éves nettó jövedelem",
      incomePlaceholder: "Add meg az éves nettó jövedelmed",
      expensesLabel: "Éves kiadások",
      expensesPlaceholder: "Add meg az éves kiadásaid",
      savingsLabel: "Jelenlegi megtakarítás",
      savingsPlaceholder: "Add meg a jelenlegi megtakarításod",
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
    calculateChartData(newYears); // Recalculate chart data based on new yearsNeeded
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
        <div className="bg-white p-4 border border-gray-200 rounded shadow-md">
          <p className="font-bold">
            {t.yearLabel}: {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatThousands = (value: number) => {
    return `${(value / 1000).toFixed(1)}K`; // Change from millions to thousands
  };

  useEffect(() => {
    if (isHU) {
      setTaxRate("0");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHU]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-700">
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end gap-2">
          <Button
            variant={isHU ? "outline" : "default"}
            size="sm"
            onClick={() => setCountry("at")}
            aria-pressed={!isHU}
          >
            <span className="fi fi-at mr-2" aria-hidden="true" /> Austria (EUR)
          </Button>
          <Button
            variant={isHU ? "default" : "outline"}
            size="sm"
            onClick={() => setCountry("hu")}
            aria-pressed={isHU}
          >
            <span className="fi fi-hu mr-2" aria-hidden="true" /> Hungary (HUF)
          </Button>
        </div>
        <p className="text-gray-600">{t.intro}</p>
        <div className="space-y-2">
          <Label htmlFor="income">
            {t.incomeLabel} ({currencySymbolForLabel})
          </Label>
          <Input
            id="income"
            type="text"
            value={formatInputValue(income)}
            onChange={(e) => setIncome(e.target.value)}
            placeholder={t.incomePlaceholder}
            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expenses">
            {t.expensesLabel} ({currencySymbolForLabel})
          </Label>
          <Input
            id="expenses"
            type="text"
            value={formatInputValue(expenses)}
            onChange={(e) => setExpenses(e.target.value)}
            placeholder={t.expensesPlaceholder}
            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="savings">
            {t.savingsLabel} ({currencySymbolForLabel})
          </Label>
          <Input
            id="savings"
            type="text"
            value={formatInputValue(savings)}
            onChange={(e) => setSavings(e.target.value)}
            placeholder={t.savingsPlaceholder}
            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
          />
        </div>
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-sm font-medium text-left text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100">
            {t.advanced}
            <ChevronDownIcon className="w-4 h-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2 p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="livingOffRate">{t.livingOffRate}</Label>
              <Input
                id="livingOffRate"
                type="number"
                value={livingOffRate}
                onChange={(e) => setLivingOffRate(e.target.value)}
                step="0.1"
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interestRate">{t.interestRate}</Label>
              <Input
                id="interestRate"
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                step="0.1"
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">{t.taxRate}</Label>
              <Input
                id="taxRate"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                step="0.1"
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
        <Button
          onClick={calculateNeededAmount}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
        >
          {t.calculate}
        </Button>
        {!!yearsNeeded && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800">
              {t.resultPrefix}
              <strong>{formatCurrency(amountNeeded)}</strong>
              {t.resultMiddle}
              <strong>{yearsNeeded}</strong>
              {t.resultSuffix}
            </p>
          </div>
        )}
        <div className="mt-8">
          {savingsChartData.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mb-4 text-blue-700">
                {t.savingsPeriod}
              </h3>
              <div className="mb-4">
                <Label htmlFor="yearsSlider">
                  {t.adjustSavings}: {actualYears}
                  {t.adjustYearsSuffix}
                </Label>
                <p className="text-gray-600 text-sm">{t.savingsHint}</p>
                <Slider
                  id="yearsSlider"
                  min={1}
                  max={40}
                  step={1}
                  value={[actualYears]} // Ensure this is an array
                  onValueChange={(value) => handleYearsChange(value[0])} // Update state correctly
                  className="text-blue-600 mt-2"
                />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={savingsChartData}>
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={formatThousands} />
                  <Tooltip
                    cursor={{ fill: "rgba(191, 219, 254, 0.3)" }}
                    content={<CustomTooltip />}
                  />
                  <Legend />
                  <Bar
                    dataKey="contributions"
                    fill="#3b82f6"
                    name={t.incomeContributions}
                  />
                  <Bar
                    dataKey="returns"
                    fill="#93c5fd"
                    name={t.investmentReturns}
                  />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
        <div className="mt-8">
          {netWorthChartData.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mb-4 text-blue-700">
                {t.netWorthProjection}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={netWorthChartData}>
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={formatMillions} />
                  <Tooltip
                    cursor={{ fill: "rgba(191, 219, 254, 0.3)" }}
                    content={<CustomTooltip />}
                  />
                  <Legend />
                  <Bar dataKey="netWorth" fill="#2563eb" name={t.netWorth} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
