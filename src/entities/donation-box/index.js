import { lazy } from 'react'

// three.js тяжёлый — сцена грузится отдельным чанком, только когда нужна
export const DonationBox3D = lazy(() => import('./ui/DonationBox3D'))
export { dropNotes } from './model/drop'
