import { lazy } from 'react'

// Админка не нужна обычным посетителям — грузим её отдельным чанком
export const AdminPage = lazy(() => import('./ui/AdminPage'))
