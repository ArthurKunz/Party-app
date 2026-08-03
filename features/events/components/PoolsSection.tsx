'use client'

import type { Profile } from '@/features/profile/services/profile.service'
import type { Pool } from '../types/events.types'
import PoolCard from './PoolCard'

type Props = {
  pools: Pool[]
  userId: string
  myProfile: Profile | null
  onRefresh: () => void
}

export default function PoolsSection({ pools, userId, myProfile, onRefresh }: Props) {
  return (
    <div className='flex flex-col gap-4'>
      {pools.map((pool) => (
        <PoolCard
          key={pool.id}
          pool={pool}
          userId={userId}
          myProfile={myProfile}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  )
}
