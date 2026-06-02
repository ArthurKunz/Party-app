'use client'

import { useState } from 'react'
import Selectbox from '@/components/shared/Selectbox'
import type { PersonalDataProps } from '../types/onboarding.types'
import { GENDER_OPTIONS } from '../constants/onboarding.constants'

export default function PersonalDataForm ({ onSuccess }: PersonalDataProps) {
    const [firstname, setFirstname] = useState('')
    const [surname, setSurname] = useState('')
    const [gender, setGender] = useState('')

    const data = {
        firstname: firstname,
        surname: surname,
        gender: gender,
    }

    return (
        <div className='w-full flex flex-col items-center gap-15'>
            <div className='w-full h-full flex flex-col items-center gap-2.5'>
                <h1 className='text-4xl font-bold text-light-heading'>Profil erstellen</h1>
                <span className='text-center text-sm text-light-subheading'>Gib deine Informationen in den dafür vorgesehen Feldern ein</span>
            </div>
            <div className='w-full flex flex-col gap-7.5'>
                <div className='w-full flex gap-2.5'>
                    <div className='w-full flex flex-col gap-2'>
                        <label className='text-xs text-light-label'>Vorname</label>
                        <input 
                        type='text' 
                        placeholder='Vorname' 
                        value={firstname} 
                        className='w-full text-light-input text-xs px-3 h-12 bg-input-bg border border-input-border rounded-md text-sm text-light focus:outline-none placeholder:text-xs placeholder:text-light-placeholder' 
                        onChange={(e) => setFirstname(e.target.value)} 
                        required 
                        />
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <label className='text-xs text-light-label'>Nachname</label>
                        <input 
                        type='text' 
                        placeholder='Nachname' 
                        value={surname} 
                        className='w-full px-3 h-12 text-xs text-light-input bg-input-bg border border-input-border rounded-md text-sm text-light focus:outline-none placeholder:text-xs placeholder:text-light-placeholder' 
                        onChange={(e) => setSurname(e.target.value)} 
                        required 
                        />
                    </div>
                </div>

                <div className='w-full flex flex-col gap-2'>
                    <label className='text-xs text-light-label'>Gender</label>
                    <Selectbox
                        aria-label='Gender'
                        options={GENDER_OPTIONS}
                        value={gender}
                        onValueChange={setGender}
                        placeholder='Gender'
                    />
                </div>
            </div>
            <button 
            onClick={() => onSuccess(data)}
            className='flex w-full items-center justify-center gap-2 rounded-full bg-button-bg py-3 text-sm font-semibold'
            >
            Weiter
            </button>
        </div>
    )
}