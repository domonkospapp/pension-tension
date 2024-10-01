"use client";

import { useState, useEffect } from "react";
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
  const [income, setIncome] = useState("37500");
  const [expenses, setExpenses] = useState("10000");
  const [savings, setSavings] = useState("100000");
  const [livingOffRate, setLivingOffRate] = useState("4");
  const [interestRate, setInterestRate] = useState("8");
  const [taxRate, setTaxRate] = useState("28");
  const [result, setResult] = useState<string | null>(null);
  const [savingsChartData, setSavingsChartData] = useState<any[]>([]);
  const [netWorthChartData, setNetWorthChartData] = useState<any[]>([]);
  const [yearsNeeded, setYearsNeeded] = useState(0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
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
    setYearsNeeded(years); // Set yearsNeeded based on the calculated years

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
    setResult(
      `You need approximately ${formatCurrency(
        neededAmount
      )} to start living off your investments. You need to save for approximately ${years} year(s).`
    );
  };

  const handleYearsChange = (newYears: number) => {
    setYearsNeeded(newYears);
    calculateChartData(newYears); // Recalculate chart data based on new yearsNeeded
  };

  const calculateChartData = (years: number) => {
    const incomeNum = parseFloat(income.replace(/,/g, ""));
    const expensesNum = parseFloat(expenses.replace(/,/g, ""));
    const savingsNum = parseFloat(savings.replace(/,/g, ""));
    const livingOffRateNum = parseFloat(livingOffRate) / 100;
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
      setSavingsChartData(savingsChartData.slice(0, yearsNeeded));
    }
  }, [yearsNeeded]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow-md">
          <p className="font-bold">Year: {label}</p>
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-700">
          Pension Tension
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="income">Yearly Net Income (€)</Label>
          <Input
            id="income"
            type="text"
            value={formatInputValue(income)}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="Enter your yearly net income"
            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expenses">Yearly Expenses (€)</Label>
          <Input
            id="expenses"
            type="text"
            value={formatInputValue(expenses)}
            onChange={(e) => setExpenses(e.target.value)}
            placeholder="Enter your yearly expenses"
            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="savings">Current Savings (€)</Label>
          <Input
            id="savings"
            type="text"
            value={formatInputValue(savings)}
            onChange={(e) => setSavings(e.target.value)}
            placeholder="Enter your current savings"
            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
          />
        </div>
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-sm font-medium text-left text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100">
            Advanced Options
            <ChevronDownIcon className="w-4 h-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            <div className="space-y-2">
              <Label htmlFor="livingOffRate">Max Living Off Rate (%)</Label>
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
              <Label htmlFor="interestRate">Interest Return (%)</Label>
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
              <Label htmlFor="taxRate">Investment Tax Rate (%)</Label>
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Calculate Needed Amount
        </Button>
        {result && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800">{result}</p>
          </div>
        )}
        <div className="mt-8">
          {savingsChartData.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mb-4 text-blue-700">
                Savings Period
              </h3>
              <div className="mb-4">
                <Label htmlFor="yearsSlider">Adjust Years: {yearsNeeded}</Label>
                <Slider
                  id="yearsSlider"
                  min={1}
                  max={40}
                  step={1}
                  value={[yearsNeeded]} // Ensure this is an array
                  onValueChange={(value) => handleYearsChange(value[0])} // Update state correctly
                  className="text-blue-600"
                />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={savingsChartData}>
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={formatMillions} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="contributions"
                    fill="#3b82f6"
                    name="Contributions"
                  />
                  <Bar dataKey="returns" fill="#93c5fd" name="Returns" />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
        <div className="mt-8">
          {netWorthChartData.length > 0 && (
            <>
              <h3 className="text-lg font-semibold mb-4 text-blue-700">
                Net Worth Projection (40 Years)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={netWorthChartData}>
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={formatMillions} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="netWorth" fill="#2563eb" name="Net Worth" />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
