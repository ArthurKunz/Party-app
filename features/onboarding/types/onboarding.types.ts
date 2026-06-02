export type PersonalDataObject = {
  firstname: string,
  surname: string,
  gender: string
}

export interface PersonalDataProps {
  onSuccess: (data: PersonalDataObject) => void
}

export interface ProfilePictureProps {
  onSuccess: (avatarUrl: string) => void
  onGoBack: () => void
}