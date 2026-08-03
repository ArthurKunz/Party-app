import { Suspense } from 'react'
import OnboardingScreen from '@/features/onboarding/OnboardingScreen'

export default function Onboarding() {
    return (
        <Suspense>
            <OnboardingScreen />
        </Suspense>
    );
}
