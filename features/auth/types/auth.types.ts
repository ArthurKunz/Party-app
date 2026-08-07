export interface SignInProps {
  onSuccess: () => void
  onClose: () => void
}

export interface SignUpProps {
  onSuccess: (email: string) => void
  onClose: () => void
}

export interface VerifyProps {
  email: string
  onSuccess: () => void
  onClose: () => void
}
