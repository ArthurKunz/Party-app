export interface NameFormProps {
  onSuccess: (firstname: string, lastname: string) => void
}

export interface BirthdateFormProps {
  onSuccess: (birthday: string) => void
}

export interface ProfilePictureFormProps {
  onSuccess: (avatarUrl: string | null, avatarColor: string) => void
}
