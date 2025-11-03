
export enum Role {
  Adult = '大人',
  Child = '子ども',
  StudentStaff = '学生スタッフ',
  Manager = '管理人',
}

export const ROLE_RATIOS: { [key in Role]: number } = {
  [Role.Adult]: 1.0,
  [Role.Child]: 0.8,
  [Role.StudentStaff]: 1.0,
  [Role.Manager]: 1.0,
};

export interface Participant {
  id: string;
  name: string;
  role: Role;
  unitId: string;
}

export type SettlementUnitType = 'family' | 'individual';

export interface SettlementUnit {
  id: string;
  name: string;
  type: SettlementUnitType;
  members: Participant[];
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  payerId: string;
  participantIds: string[];
  ratioOverrides?: { [key: string]: number };
}

export interface Transaction {
  from: string;
  to: string;
  amount: number;
  settled: boolean;
}

export interface Balance {
  unitId: string;
  unitName: string;
  paid: number;
  share: number;
  balance: number;
}
