export type AuthStep = 'signup' | 'signin' | 'verify' | 'onboarding' | 'reset-password'

export interface SignInProps {
  onSuccess: () => void
  onGoToSignUp: () => void
}

export interface SignUpProps {
  onSuccess: (email: string) => void
  onGoToSignIn: () => void
}

export interface VerifyProps {
  email: string
  onSuccess: () => void
}

