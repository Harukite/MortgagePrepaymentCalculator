import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateMortgage,
  formatCurrency,
  formatPercent,
  type MortgageInput,
  type CalculationResult,
} from "@/lib/mortgageCalculator";
import ResultDisplay from "@/components/ResultDisplay";

export default function Home() {
  const [formData, setFormData] = useState<MortgageInput>({
    totalLoan: 500000,
    remainingPeriods: 240,
    annualRate: 3.85,
    prepaymentAmount: 100000,
    repaymentMethod: "equal_principal_interest",
    prepaymentType: "reduce_payment",
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  const handleInputChange = (field: keyof MortgageInput, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: typeof value === "string" ? (value === "" ? 0 : parseFloat(value) || 0) : value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      repaymentMethod: value as "equal_principal_interest" | "equal_principal",
    }));
  };

  const handlePrepaymentTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      prepaymentType: value as "reduce_payment" | "reduce_period",
    }));
  };

  const handleClearForm = () => {
    setFormData({
      totalLoan: 0,
      remainingPeriods: 0,
      annualRate: 0,
      prepaymentAmount: 0,
      repaymentMethod: "equal_principal_interest",
      prepaymentType: "reduce_payment",
    });
    setResult(null);
    setHasCalculated(false);
  };

  const handleCalculate = () => {
    if (
      formData.totalLoan <= 0 ||
      formData.remainingPeriods <= 0 ||
      formData.annualRate < 0 ||
      formData.prepaymentAmount < 0
    ) {
      alert("请输入有效的数值");
      return;
    }

    if (formData.prepaymentAmount >= formData.totalLoan) {
      alert("提前还款金额不能大于等于贷款总额");
      return;
    }

    const calculationResult = calculateMortgage(formData);
    setResult(calculationResult);
    setHasCalculated(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">房贷提前还款计算器</h1>
          <p className="text-gray-600">轻松计算提前还款的利息节省和还款计划</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：输入表单 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>计算参数</CardTitle>
                <CardDescription>输入您的贷款信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 贷款总额 */}
                <div className="space-y-2">
                  <Label htmlFor="totalLoan">贷款总额（元）</Label>
                  <Input
                    id="totalLoan"
                    type="number"
                    min="0"
                    step="10000"
                    value={formData.totalLoan === 0 ? "" : formData.totalLoan}
                    onChange={(e) => handleInputChange("totalLoan", e.target.value)}
                    placeholder="请输入贷款总额"
                  />
                </div>

                {/* 剩余期数 */}
                <div className="space-y-2">
                  <Label htmlFor="remainingPeriods">剩余期数（月）</Label>
                  <Input
                    id="remainingPeriods"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.remainingPeriods === 0 ? "" : formData.remainingPeriods}
                    onChange={(e) => handleInputChange("remainingPeriods", e.target.value)}
                    placeholder="请输入剩余期数"
                  />
                </div>

                {/* 年利率 */}
                <div className="space-y-2">
                  <Label htmlFor="annualRate">年利率（%）</Label>
                  <Input
                    id="annualRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.annualRate === 0 ? "" : formData.annualRate}
                    onChange={(e) => handleInputChange("annualRate", e.target.value)}
                    placeholder="请输入年利率"
                  />
                </div>

                {/* 提前还款金额 */}
                <div className="space-y-2">
                  <Label htmlFor="prepaymentAmount">提前还款金额（元）</Label>
                  <Input
                    id="prepaymentAmount"
                    type="number"
                    min="0"
                    step="10000"
                    value={formData.prepaymentAmount === 0 ? "" : formData.prepaymentAmount}
                    onChange={(e) => handleInputChange("prepaymentAmount", e.target.value)}
                    placeholder="请输入提前还款金额"
                  />
                </div>

                {/* 还款方式 */}
                <div className="space-y-2">
                  <Label htmlFor="repaymentMethod">还款方式</Label>
                  <Select
                    value={formData.repaymentMethod}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger id="repaymentMethod">
                      <SelectValue placeholder="选择还款方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equal_principal_interest">等额本息</SelectItem>
                      <SelectItem value="equal_principal">等额本金</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 提前还贷方式 */}
                <div className="space-y-2">
                  <Label htmlFor="prepaymentType">提前还贷方式</Label>
                  <Select
                    value={formData.prepaymentType}
                    onValueChange={handlePrepaymentTypeChange}
                  >
                    <SelectTrigger id="prepaymentType">
                      <SelectValue placeholder="选择提前还贷方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reduce_payment">降低月还款额</SelectItem>
                      <SelectItem value="reduce_period">缩短还款年限</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 按钮组 */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleCalculate}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 h-10"
                  >
                    计算
                  </Button>
                  <Button
                    onClick={handleClearForm}
                    variant="outline"
                    className="px-4 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 h-10"
                  >
                    清空
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：结果展示 */}
          <div className="lg:col-span-2">
            {hasCalculated && result ? (
              <ResultDisplay result={result} formData={formData} />
            ) : (
              <Card className="h-full flex items-center justify-center min-h-96">
                <CardContent className="text-center">
                  <p className="text-gray-500 text-lg">
                    输入参数后点击"计算"按钮查看结果
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

