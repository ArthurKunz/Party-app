export const MAX_BYTES = 5 * 1024 * 1024

export const BUCKET = 'avatars'

export const AVATAR_COLORS = [
  '#FF0090',
  '#A336FF',
  '#161BFA',
  '#FF6B35',
  '#00C896',
  '#FF3B5C',
  '#0099FF',
  '#7B2FBE',
  '#FF9500',
  '#34C759',
]

export const pickRandomAvatarColor = () =>
  AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
