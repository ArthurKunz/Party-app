import ChangePasswordForm from '@/features/settings/components/ChangePasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className='relative w-screen h-screen overflow-hidden bg-background-main'>
      <div className='relative z-10 w-full h-full flex flex-col items-center justify-center px-6'>
        <div className='w-full max-w-sm'>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  )
}
