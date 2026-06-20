import type { ThemeId } from '../types/settings';

export interface Theme {
  id: ThemeId;
  background: string;
  primary: string;
  saveButton: string;
  balanceBanner: string;
  incomeColor: string;
  expenseColor: string;
  textDark: string;
  textMid: string;
  card: string;
}

export const themes: Record<ThemeId, Theme> = {
  waiwai: {
    id: 'waiwai',
    background: '#FFE033',
    primary: '#FF8F00',
    saveButton: '#43A047',
    balanceBanner: '#E53935',
    incomeColor: '#2E7D32',
    expenseColor: '#C62828',
    textDark: '#3E2700',
    textMid: '#8D6E00',
    card: 'rgba(255,255,255,0.6)',
  },
  hokkori: {
    id: 'hokkori',
    background: '#FDF6EC',
    primary: '#E8926A',
    saveButton: '#E8926A',
    balanceBanner: '#E8926A',
    incomeColor: '#5D8A6B',
    expenseColor: '#C26A5A',
    textDark: '#3E2700',
    textMid: '#9E7B5B',
    card: 'rgba(255,255,255,0.65)',
  },
  princess: {
    id: 'princess',
    background: '#EEF6FC',
    primary: '#C9A84C',
    saveButton: '#C9A84C',
    balanceBanner: '#88BFDE',
    incomeColor: '#4A90C4',
    expenseColor: '#C47A8A',
    textDark: '#2C3E5A',
    textMid: '#7A90A8',
    card: 'rgba(255,255,255,0.75)',
  },
  prince: {
    id: 'prince',
    background: '#F0F5FF',
    primary: '#B8962E',
    saveButton: '#1A3A6B',
    balanceBanner: '#1A3A6B',
    incomeColor: '#1A5276',
    expenseColor: '#922B21',
    textDark: '#0D1F3C',
    textMid: '#4A6080',
    card: 'rgba(255,255,255,0.8)',
  },
  host: {
    id: 'host',
    background: '#1A1A2E',
    primary: '#C9A84C',
    saveButton: '#C9A84C',
    balanceBanner: '#2C2C54',
    incomeColor: '#C9A84C',
    expenseColor: '#E06C75',
    textDark: '#F0E6FF',
    textMid: '#A89BC2',
    card: 'rgba(255,255,255,0.08)',
  },
};
