import EditPartyScreen from '@/features/parties/EditPartyScreen'

export default async function EditPartyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <EditPartyScreen partyId={id} />
}
