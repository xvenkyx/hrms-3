export interface SalarySlipLike {
  baseSalary?: number;
  grossSalary?: number;
  netSalary?: number;
  bonus?: number;
  pfAmount?: number;
  pfApplicable?: boolean | string;
  professionalTax?: number;
  absentDeduction?: number;
  perDaySalary?: number;
  lopDays?: number;
  daysInMonth?: number;
  basic?: number;
  hra?: number;
  fuelAllowance?: number;
  paidLeaveUsed?: number;
  leavesRemaining?: number;
  totalLeaves?: number;
  casualLeavesTotal?: number;
  sickLeavesTotal?: number;
  [key: string]: any;
}

const PROFESSIONAL_TAX = 200;
const DEFAULT_TOTAL_LEAVES = 6;
const DEFAULT_CASUAL_LEAVES = 4;
const DEFAULT_SICK_LEAVES = 2;

function calculatePF(baseSalary: number, pfApplicable: boolean | string | undefined) {
  if (pfApplicable === false || pfApplicable === 'false') {
    return 0;
  }

  if (baseSalary < 30000) {
    return Math.round(baseSalary * 0.12);
  }

  return 3600;
}

/**
 * Normalize salary slip values to match the latest compensation rules.
 */
export function normalizeSalarySlip<T extends SalarySlipLike>(slip: T): T {
  const baseSalary = slip.baseSalary ?? 0;
  const lopDays = slip.lopDays ?? 0;
  const daysInMonth = slip.daysInMonth ?? 30;
  const bonus = slip.bonus ?? 0;

  // Deductions
  const pfAmount = calculatePF(baseSalary, slip.pfApplicable);
  const perDaySalary = Math.round(baseSalary / daysInMonth);
  const absentDeduction = Math.round(perDaySalary * lopDays);
  const professionalTax = PROFESSIONAL_TAX;

  // Net pay before bonuses
  const netPay = Math.max(baseSalary - pfAmount - professionalTax - absentDeduction, 0);

  // Earnings breakdown based on NetPay
  const basic = Math.round(netPay * 0.30);
  const hra = Math.round(basic * 0.70);
  const fuelAllowance = Math.max(netPay - basic - hra, 0);
  const grossSalary = basic + hra + fuelAllowance;

  // Final take home including bonus
  const netSalary = grossSalary + bonus;

  return {
    ...slip,
    pfAmount,
    professionalTax,
    perDaySalary,
    absentDeduction,
    basic,
    hra,
    fuelAllowance,
    grossSalary,
    netSalary,
    totalLeaves: slip.totalLeaves ?? DEFAULT_TOTAL_LEAVES,
    casualLeavesTotal: slip.casualLeavesTotal ?? DEFAULT_CASUAL_LEAVES,
    sickLeavesTotal: slip.sickLeavesTotal ?? DEFAULT_SICK_LEAVES,
    leavesRemaining:
      slip.leavesRemaining ??
      (slip.totalLeaves ?? DEFAULT_TOTAL_LEAVES) - (slip.paidLeaveUsed ?? 0),
  } as T;
}
