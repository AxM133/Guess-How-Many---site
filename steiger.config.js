import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

// Проверка правил Feature-Sliced Design (часть `npm run lint`)
export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      // Слайсы выделены по смыслу (каждое действие админа — отдельная фича), даже если
      // сейчас используются в одном месте. Совет «слить со страницей» здесь отключаем.
      'fsd/insignificant-slice': 'off',
    },
  },
])
