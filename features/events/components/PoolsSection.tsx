'use client'

import type { Pool } from '../types/events.types'
import PoolCard from './PoolCard'

type Props = {
  pools: Pool[]
  userId: string
  onRefresh: () => void
}

export default function PoolsSection({ pools, userId, onRefresh }: Props) {
  return (
    <div className='flex flex-col gap-4'>
      {pools.map((pool) => (
        <PoolCard key={pool.id} pool={pool} userId={userId} onRefresh={onRefresh} />
      ))}
    </div>
  )
}
