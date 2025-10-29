import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crear cuenta — miservicio',
  description: 'Registrate gratis en miservicio y empezá a contactar profesionales.',
  alternates: { canonical: '/register' },
  robots: { index: false, follow: true },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}


