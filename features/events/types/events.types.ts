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

export type EventWithCount = {
  id: string
  title: string
  event_date: string
  location: string
  invite_code: string
  attendee_count: number
}

export type EventDetail = {
  id: string
  host_id: string
  title: string
  description: string | null
  event_date: string
  location: string
  invite_code: string
}

export type Attendee = {
  user_id: string
  firstname: string | null
  lastname: string | null
  birthday: string | null
}

export type EventHost = {
  firstname: string | null
  lastname: string | null
}

export type RsvpStatus = 'going' | 'not_going'

export type PoolType = 'options' | 'text_only'

export type PoolOption = {
  id: string
  pool_id: string
  label: string
  position: number
}

export type PoolResponse = {
  id: string
  pool_id: string
  user_id: string
  option_id: string | null
  text_response: string | null
  created_at: string
  firstname: string | null
  lastname: string | null
}

export type Pool = {
  id: string
  event_id: string
  question: string
  description: string | null
  type: PoolType
  allow_text_response: boolean
  created_at: string
  options: PoolOption[]
  responses: PoolResponse[]
}
