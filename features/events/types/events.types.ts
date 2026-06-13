export type CreateEventPayload = {
  host_id: string
  title: string
  description: string | null
  invite_code: string
  event_date: string
  location: string
  max_guests: number | null
}

export type CreateEventFormValues = {
  title: string
  description: string
  day: string
  month: string
  year: string
  hour: string
  minute: string
  location: string
  max_guests: string
}

export interface CreateEventFormProps {
  onSubmit: (values: CreateEventFormValues) => Promise<void>
  loading: boolean
}
