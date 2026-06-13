import InviteScreen from '@/features/events/InviteScreen'

export default async function InvitePage({ params }: { params: Promise<{ invite_code: string }> }) {
  const { invite_code } = await params
  return <InviteScreen inviteCode={invite_code} />
}
