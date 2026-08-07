import FloatingEmojis from '@/features/events/components/FloatingEmojis'
import ChangePasswordForm from '@/features/settings/components/ChangePasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className='relative w-full h-dvh overflow-hidden bg-main'>
      <FloatingEmojis active seed />

      <ChangePasswordForm />
    </div>
  )
}
