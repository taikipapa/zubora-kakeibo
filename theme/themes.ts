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
};
