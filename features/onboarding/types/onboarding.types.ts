export interface NameFormProps {
  onSuccess: (firstname: string, lastname: string) => void
  // Deliberately NOT an onClose: step one has no back button, so this is the
  // labelled way out and it says out loud what it does.
  onSwitchAccount: () => void
}

export interface BirthdateFormProps {
  onSuccess: (birthday: string) => void
  onClose: () => void
}

export interface ProfilePictureFormProps {
  // Resolves once the profile row has been written, so the button can hold its
  // spinner across the upload AND the insert that follows it.
  onSuccess: (avatarUrl: string | null, avatarColor: string) => Promise<void>
  onClose: () => void
  firstname: string
  lastname: string
}
