import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type CalculationResult,
  type MortgageInput,
  formatCurrency,
  formatPercent,
} from "@/lib/mortgageCalculator";

interface ResultDisplayProps {
  result: CalculationResult;
  formData: MortgageInput;
}

export default function ResultDisplay({ result, formData }: ResultDisplayProps) {
  const methodLabel =
    formData.repaymentMethod === "equal_principal_interest" ? "等额本息" : "等额本金";

  return (
    <div className="space-y-6">
      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 原始月还款额 */}
        <Card className="animate-card-enter">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">原始月还款额</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 animate-number-count" style={{ animationDelay: "0.2s" }}>
              {formatCurrency(result.originalMonthlyPayment)}
            </div>
          </CardContent>
        </Card>

        {/* 新月还款额 */}
        <Card className="animate-card-enter" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">新月还款额</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 animate-number-count" style={{ animationDelay: "0.3s" }}>
              {formatCurrency(result.newMonthlyPayment)}
            </div>
            <p className="text-xs text-gray-500 mt-1 animate-number-count" style={{ animationDelay: "0.4s" }}>
              降低 {formatCurrency(result.originalMonthlyPayment - result.newMonthlyPayment)}
            </p>
          </CardContent>
        </Card>

        {/* 原始总利息 */}
        <Card className="animate-card-enter" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">原始总利息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 animate-number-count" style={{ animationDelay: "0.4s" }}>
              {formatCurrency(result.totalInterestOriginal)}
            </div>
          </CardContent>
        </Card>

        {/* 新总利息 */}
        <Card className="animate-card-enter" style={{ animationDelay: "0.3s" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">新总利息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 animate-number-count" style={{ animationDelay: "0.5s" }}>
              {formatCurrency(result.totalInterestNew)}
            </div>
          </CardContent>
        </Card>

        {/* 利息节省 */}
        <Card className="animate-card-enter-stagger sm:col-span-2" style={{ animationDelay: "0.4s" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">利息节省</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 animate-number-count" style={{ animationDelay: "0.6s" }}>
              {formatCurrency(result.interestSavings)}
            </div>
            <p className="text-xs text-gray-500 mt-1 animate-number-count" style={{ animationDelay: "0.7s" }}>
              节省比例：{((result.interestSavings / result.totalInterestOriginal) * 100).toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        {/* 期数变化（仅当选择缩短年限时显示） */}
        {formData.prepaymentType === "reduce_period" && result.periodReduction > 0 && (
          <Card className="animate-card-enter sm:col-span-2" style={{ animationDelay: "0.5s" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">期数变化</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 animate-number-count" style={{ animationDelay: "0.8s" }}>
                缩短 {result.periodReduction} 期
              </div>
              <p className="text-xs text-gray-500 mt-1 animate-number-count" style={{ animationDelay: "0.9s" }}>
                从 {formData.remainingPeriods} 期减少到 {result.newRemainingPeriods} 期
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 还款计划表格 */}
      <Card>
        <CardHeader>
          <CardTitle>还款计划表</CardTitle>
          <CardDescription>
            还款方式：{methodLabel} | 剩余期数：{result.newRemainingPeriods} 月
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-center">期数</TableHead>
                  <TableHead className="text-right">月还款额</TableHead>
                  <TableHead className="text-right">本金</TableHead>
                  <TableHead className="text-right">利息</TableHead>
                  <TableHead className="text-right">剩余本金</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.schedule.map((item, index) => (
                  <TableRow
                    key={item.period}
                    className="animate-slide-up border-b hover:bg-gray-50 transition-all duration-200 ease-out"
                    style={{
                      animationDelay: `${index * 0.03}s`,
                    }}
                  >
                    <TableCell className="text-center font-medium">{item.period}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.payment)}</TableCell>
                    <TableCell className="text-right text-blue-600">
                      {formatCurrency(item.principal)}
                    </TableCell>
                    <TableCell className="text-right text-orange-600">
                      {formatCurrency(item.interest)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(item.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {result.schedule.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              提前还款金额已覆盖全部贷款
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

