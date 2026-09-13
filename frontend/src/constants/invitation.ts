import type { Option } from '@/types/invitation';

export const AUTH_HASH_STORAGE_KEY = 'authHash';

const COUNTRY_NAMES = [
  'Турция',
  'Занзибар',
  'Китай (Хайнань)',
  'Египетские Мальдивы',
  'Маврикий',
  'Вьетнам',
  'Тайланд',
  'Корея',
  'Япония',
  'Грузия',
  'Кипр',
  'Горячая путевка',
] as const;

export const COUNTRIES: readonly Option[] = COUNTRY_NAMES.map((name) => ({ id: name, label: name }));

export const HOTEL_OPTIONS: readonly Option[] = [{ id: 'Все включено', label: 'Все включено 🍹' }];

export const DATE_OPTIONS: readonly Option[] = [
  { id: 'С 19.09.2026 до конца отпуска', label: 'С 19.09.2026 до конца отпуска 🌴' },
];