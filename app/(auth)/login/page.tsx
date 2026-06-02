import AuthScreen from '@/features/auth/AuthScreen'
import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <Suspense>
      <AuthScreen />
    </Suspense>
  )
}