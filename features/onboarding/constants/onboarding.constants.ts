import { SelectOption } from '@/components/shared/Selectbox'

export const MAX_BYTES = 5 * 1024 * 1024

export const BUCKET = 'avatars'

export const GENDER_OPTIONS: SelectOption[] = [
    { value: 'female', label: 'Weiblich' },
    { value: 'male', label: 'Männlich' },
    { value: 'diverse', label: 'Divers' },
    { value: 'prefer_not_to_say', label: 'Keine Angabe' },
]