import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar sesión — miservicio',
  description: 'Accedé a tu cuenta en miservicio para contactar profesionales.',
  alternates: { canonical: '/login' },
  robots: { index: false, follow: true },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}


