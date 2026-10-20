import { Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { AdminPage } from '@/pages/admin'
import { HomePage } from '@/pages/home'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/admin"
          element={
            <Suspense>
              <AdminPage />
            </Suspense>
          }
        />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}
