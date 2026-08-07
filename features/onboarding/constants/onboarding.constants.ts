export const MAX_BYTES = 5 * 1024 * 1024

// Per field, so a full name tops out at 41 characters with the space. The same
// number the party title uses, and enough for the longest names this app will see;
// beyond it the name is only ever shown truncated (the profile's Name row) or
// wrapped (the 25px heading above it) anyway.
export const NAME_MAX = 20

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
