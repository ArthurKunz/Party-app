'use client'

import { useState } from 'react'
import PersonalDataForm from './components/PersonalDataForm'
import ProfilePictureForm from './components/ProfilePictureForm'
import { PersonalDataObject } from './types/onboarding.types'
import { getSession } from './services/onboarding.service'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function OnboardingScreen () {
    const [step, setStep] = useState<'personal' | 'photo'>('personal')
    const [personalData, setPersonalData] = useState<PersonalDataObject | null>(null)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const progressWidth =
        step === 'personal' ? '50%' : '100%'

    const router = useRouter()

    const setUpProfile = async () => {
        const { data: { session } } = await getSession()
        if(!session) return

        if (!personalData || !avatarUrl) return

        const { error } = await supabase.from('profiles').insert({
            id: session.user.id,
            avatar_url: avatarUrl,
            firstname: personalData.firstname,
            surname: personalData.surname,
            gender: personalData.gender,
        })

        if (error) alert(error.message)
        else router.push('/home')
    }

    return (
        <div className='w-screen h-screen p-2.5 flex bg-primary'>
            <div className='w-3/5 flex justify-center items-end h-full rounded-3xl bg-[linear-gradient(180deg,#0056FF_0%,#0c0c0c_75%,#0c0c0c_100%)]'>
                <div className='flex flex-col items-center w-65 h-75 mb-15 gap-10'>
                    <div className='flex flex-col items-center'>
                        <span className='text-center text-sm text-brand font-semibold mb-2.5'>Student Connect</span>
                        <span className='text-center text-3xl text-light-heading font-semibold mb-2'>Starte jetzt mit uns</span>
                        <span className='text-center text-xs w-60 text-light-subheading'>Folge diesen einfachen Schritten, um deinen account zu erstellen</span>
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <div className='w-full h-12.5 bg-white rounded-xl flex gap-3 items-center px-3'>
                            <div className='text-xs text-light-heading  w-6 h-6 bg-brand rounded-full flex justify-center items-center'>1</div>
                            <span className='text-xs text-brand'>Erstelle deinen Account</span>
                        </div>
                        <div className='w-full h-12.5 bg-white rounded-xl flex gap-3 items-center px-3'>
                            <div className='text-xs text-light-heading  w-6 h-6 bg-brand rounded-full flex justify-center items-center'>2</div>
                            <span className='text-xs text-brand'>Verifiziere dein Account</span>
                        </div>
                        <div className='w-full h-12.5 bg-white rounded-xl flex gap-3 items-center px-3'>
                            <div className='text-xs text-light-heading  w-6 h-6 bg-brand rounded-full flex justify-center items-center'>3</div>
                            <span className='text-xs text-brand'>Erstelle dein Profil</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className='relative flex w-2/5 h-full flex-col px-20 pt-20 pb-0'>
                <div className='absolute px-20 top-0 left-[50%] translate-x-[-50%] w-full h-20 flex items-center'>
                    <div className='w-full h-1 bg-secondary rounded-full '>
                        <div
                            className='h-full bg-brand rounded-full transition-[width] duration-300 ease-out'
                            style={{ width: progressWidth }}
                        />
                    </div>
                </div>
                <div className='flex min-h-0 w-full flex-1 flex-col'>
                    {step === 'personal' && (
                        <PersonalDataForm 
                            onSuccess={(data) => {
                                setPersonalData(data) 
                                setStep('photo')
                            }}
                        />
                    )}

                    {step === 'photo' && (
                        <ProfilePictureForm
                            onSuccess={(url) => {
                                setAvatarUrl(url)
                                setUpProfile()
                            }}
                            onGoBack={() => setStep('personal')}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}