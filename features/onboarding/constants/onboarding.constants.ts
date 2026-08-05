export const MAX_BYTES = 5 * 1024 * 1024

export const BUCKET = 'avatars'

// Nine party colours, and exactly what the profile picture screen offers — so a
// colour assigned at random on signup is always one the user can also pick.
export const AVATAR_COLORS = [
  '#FF0090', // pink
  '#A336FF', // purple
  '#7B2FBE', // deep purple
  '#0099FF', // light blue
  '#00C896', // teal
  '#34C759', // green
  '#FF9500', // amber
  '#FF6B35', // orange
  '#FF3B5C', // red
]

export const pickRandomAvatarColor = () =>
  AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
