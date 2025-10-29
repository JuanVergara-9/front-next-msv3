import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tu perfil — miservicio',
  alternates: { canonical: '/profile' },
  robots: { index: false, follow: false },
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}


