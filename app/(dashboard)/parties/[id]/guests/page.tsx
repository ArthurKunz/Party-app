import PartyGuestsScreen from '@/features/parties/PartyGuestsScreen'

export default async function PartyGuestsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  // Where the visitor came from decides where the back button goes. Read on the
  // server and handed down as a prop, so the screen needs no useSearchParams and
  // therefore no Suspense boundary around it.
  searchParams: Promise<{ from?: string }>
}) {
  const { id } = await params
  const { from } = await searchParams
  return <PartyGuestsScreen partyId={id} fromEdit={from === 'edit'} />
}
