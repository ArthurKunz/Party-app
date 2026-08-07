import PartyDetailScreen from '@/features/parties/PartyDetailScreen'

export default async function PartyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PartyDetailScreen partyId={id} />
}
