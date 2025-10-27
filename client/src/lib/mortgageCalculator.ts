/**
 * 房贷提前还款计算器
 * 支持等额本息和等额本金两种还款方式
 */

export interface MortgageInput {
  totalLoan: number; // 贷款总额（元）
  remainingPeriods: number; // 剩余期数（月）
  annualRate: number; // 年利率（%）
  prepaymentAmount: number; // 提前还款金额（元）
  repaymentMethod: "equal_principal_interest" | "equal_principal"; // 还款方式
  prepaymentType: "reduce_payment" | "reduce_period"; // 提前还贷方式：降低月还款 vs 缩短年限
}

export interface PaymentSchedule {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface CalculationResult {
  originalMonthlyPayment: number;
  totalInterestOriginal: number;
  newMonthlyPayment: number;
  totalInterestNew: number;
  interestSavings: number;
  periodReduction: number;
  newRemainingPeriods: number;
  schedule: PaymentSchedule[];
}

/**
 * 计算月利率
 */
function getMonthlyRate(annualRate: number): number {
  return annualRate / 100 / 12;
}

/**
 * 等额本息还款方式 - 计算月还款额
 * 公式: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 * P: 贷款本金, r: 月利率, n: 还款期数
 */
function calculateEqualPayment(
  principal: number,
  monthlyRate: number,
  periods: number
): number {
  if (monthlyRate === 0) {
    return principal / periods;
  }
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, periods);
  const denominator = Math.pow(1 + monthlyRate, periods) - 1;
  return (principal * numerator) / denominator;
}

/**
 * 等额本息还款方式 - 生成还款计划
 */
function generateEqualPaymentSchedule(
  principal: number,
  monthlyRate: number,
  periods: number
): PaymentSchedule[] {
  const monthlyPayment = calculateEqualPayment(principal, monthlyRate, periods);
  const schedule: PaymentSchedule[] = [];
  let balance = principal;

  for (let i = 1; i <= periods; i++) {
    const interest = balance * monthlyRate;
    const principalPayment = monthlyPayment - interest;
    balance -= principalPayment;

    schedule.push({
      period: i,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interest,
      balance: Math.max(0, balance),
    });
  }

  return schedule;
}

/**
 * 等额本金还款方式 - 生成还款计划
 */
function generateEqualPrincipalSchedule(
  principal: number,
  monthlyRate: number,
  periods: number
): PaymentSchedule[] {
  const principalPayment = principal / periods;
  const schedule: PaymentSchedule[] = [];
  let balance = principal;

  for (let i = 1; i <= periods; i++) {
    const interest = balance * monthlyRate;
    const payment = principalPayment + interest;
    balance -= principalPayment;

    schedule.push({
      period: i,
      payment: payment,
      principal: principalPayment,
      interest: interest,
      balance: Math.max(0, balance),
    });
  }

  return schedule;
}

/**
 * 计算原始还款计划的总利息
 */
function calculateTotalInterest(schedule: PaymentSchedule[]): number {
  return schedule.reduce((sum, item) => sum + item.interest, 0);
}

/**
 * 计算缩短年限后的新期数
 * 通过二分法求解：在保持月还款额不变的情况下，能还清贷款的最短期限
 */
function calculateNewPeriods(
  principal: number,
  monthlyRate: number,
  monthlyPayment: number
): number {
  if (monthlyRate === 0) {
    return Math.ceil(principal / monthlyPayment);
  }

  // 使用二分法求解
  let low = 1;
  let high = 1000; // 最大1000期
  let result = high;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const testPayment = calculateEqualPayment(principal, monthlyRate, mid);
    
    if (testPayment <= monthlyPayment) {
      result = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return result;
}

/**
 * 主计算函数：计算提前还款后的结果
 */
export function calculateMortgage(input: MortgageInput): CalculationResult {
  const monthlyRate = getMonthlyRate(input.annualRate);

  // 生成原始还款计划
  const originalSchedule =
    input.repaymentMethod === "equal_principal_interest"
      ? generateEqualPaymentSchedule(
          input.totalLoan,
          monthlyRate,
          input.remainingPeriods
        )
      : generateEqualPrincipalSchedule(
          input.totalLoan,
          monthlyRate,
          input.remainingPeriods
        );

  const originalMonthlyPayment = originalSchedule[0].payment;
  const totalInterestOriginal = calculateTotalInterest(originalSchedule);

  // 计算提前还款后的剩余本金
  const remainingPrincipal = input.totalLoan - input.prepaymentAmount;

  if (remainingPrincipal <= 0) {
    return {
      originalMonthlyPayment,
      totalInterestOriginal,
      newMonthlyPayment: 0,
      totalInterestNew: 0,
      interestSavings: totalInterestOriginal,
      periodReduction: input.remainingPeriods,
      newRemainingPeriods: 0,
      schedule: [],
    };
  }

  let newSchedule: PaymentSchedule[];
  let newMonthlyPayment: number;
  let newRemainingPeriods: number;
  let periodReduction: number;

  if (input.prepaymentType === "reduce_payment") {
    // 降低月还款方式：保持期数不变，降低月还款额
    newRemainingPeriods = input.remainingPeriods;
    periodReduction = 0;
    
    newSchedule =
      input.repaymentMethod === "equal_principal_interest"
        ? generateEqualPaymentSchedule(
            remainingPrincipal,
            monthlyRate,
            newRemainingPeriods
          )
        : generateEqualPrincipalSchedule(
            remainingPrincipal,
            monthlyRate,
            newRemainingPeriods
          );
    
    newMonthlyPayment = newSchedule[0].payment;
    } else {
      // 缩短年限方式：保持月还款额不变，缩短还款期数
      newMonthlyPayment = originalMonthlyPayment;
      
      if (input.repaymentMethod === "equal_principal_interest") {
        // 等额本息：计算新的期数
        newRemainingPeriods = calculateNewPeriods(
          remainingPrincipal,
          monthlyRate,
          newMonthlyPayment
        );
      } else {
        // 等额本金：计算新的期数
        // 在等额本金模式下，缩短年限意味着保持每月本金还款额不变
        // 原始每月本金还款额 = 原始贷款总额 / 原始期数
        const originalPrincipalPayment = input.totalLoan / input.remainingPeriods;
        newRemainingPeriods = Math.ceil(remainingPrincipal / originalPrincipalPayment);
      }
      
      periodReduction = input.remainingPeriods - newRemainingPeriods;
      
      // 生成新的还款计划
      newSchedule =
        input.repaymentMethod === "equal_principal_interest"
          ? generateEqualPaymentSchedule(
              remainingPrincipal,
              monthlyRate,
              newRemainingPeriods
            )
          : generateEqualPrincipalSchedule(
              remainingPrincipal,
              monthlyRate,
              newRemainingPeriods
            );
    }

  const totalInterestNew = calculateTotalInterest(newSchedule);

  return {
    originalMonthlyPayment,
    totalInterestOriginal,
    newMonthlyPayment,
    totalInterestNew,
    interestSavings: totalInterestOriginal - totalInterestNew,
    periodReduction,
    newRemainingPeriods,
    schedule: newSchedule,
  };
}

/**
 * 格式化货币
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

