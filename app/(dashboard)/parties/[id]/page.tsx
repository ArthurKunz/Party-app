import EventDetailScreen from '@/features/events/EventDetailScreen'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <EventDetailScreen eventId={id} />
}
