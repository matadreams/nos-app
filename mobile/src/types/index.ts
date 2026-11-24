export type Tab = 'home' | 'discover' | 'goals' | 'community' | 'account'

export type Experience = {
  id: number
  title: string
  description: string
  category: string
  categoryLabel: string
  duration: string
  durationMinutes: number
  budget: string
  budgetLevel: number
  location: string
  resource: { label: string; url: string }
}

export type Goal = {
  id: number
  title: string
  description: string
  progress: number
  total: number
  accent: 'coral' | 'sage' | 'lilac'
  nextStep: string
}

export type AccountProfile = {
  name: string
  email: string
}

export type CoupleConnection = {
  linked: boolean
  coupleName: string
  partnerName: string
  inviteCode: string
  joinedAt: string
}

export type CommunityCouple = {
  id: number
  names: string
  initials: string
  city: string
  points: number
  position: number
  streak: string
  activity: string
  accent: 'coral' | 'sage' | 'lilac'
}
