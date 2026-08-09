export interface SignInProps {
  onSuccess: () => void
  onClose: () => void
}

export interface SignUpProps {
  onSuccess: (email: string) => void
  onClose: () => void
  // Handed back when the user returns from the verification step, so the address
  // they already typed is still standing there.
  initialEmail?: string
  // Offered next to the 'already taken' warning — the only thing left to do there.
  onSignIn: () => void
}

export interface VerifyProps {
  email: string
  onSuccess: () => void
  onClose: () => void
}
