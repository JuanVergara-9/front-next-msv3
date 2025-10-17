import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, Phone, MapPin, Heart, Users, Shield, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sobre MiServicio - Conectamos personas con profesionales locales',
  description: 'Conoce más sobre MiServicio, la plataforma que digitaliza los oficios locales en San Rafael, Mendoza. Busca servicios, contacta profesionales y encuentra confianza.',
}

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mx-auto mb-6 premium-shadow-lg">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Sobre MiServicio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            La plataforma que digitaliza los oficios locales y facilita el encuentro entre quienes necesitan un servicio y quienes lo ofrecen.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Description Section */}
          <section className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              Nuestra Historia
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-6">
                MiServicio nace en San Rafael, Mendoza para digitalizar los oficios locales y facilitar el encuentro entre quienes necesitan un servicio y quienes lo ofrecen.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                En la app podés buscar por rubro (electricidad, gas, plomería, mantenimiento y limpieza de piletas, etc.), ver perfiles verificados, reseñas reales y contactar por WhatsApp o llamada.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Nuestro foco es lo local: priorizamos cercanía, disponibilidad y reputación transparente para que el trabajo llegue a buen puerto, rápido y con confianza.
              </p>
            </div>
          </section>

          {/* Features Section */}
          <section className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <Star className="w-6 h-6 text-primary" />
              ¿Por qué elegir MiServicio?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Enfoque Local</h3>
                    <p className="text-muted-foreground text-sm">Priorizamos la cercanía y disponibilidad en tu zona</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Perfiles Verificados</h3>
                    <p className="text-muted-foreground text-sm">Todos los profesionales pasan por un proceso de verificación</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Star className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Reseñas Reales</h3>
                    <p className="text-muted-foreground text-sm">Calificaciones auténticas de clientes reales</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Comunicación Directa</h3>
                    <p className="text-muted-foreground text-sm">Contacta por WhatsApp o llamada sin intermediarios</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 border border-border/50">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <Phone className="w-6 h-6 text-primary" />
              Contactanos
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email</h3>
                    <a 
                      href="mailto:app.miservicio@gmail.com" 
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      app.miservicio@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Ubicación</h3>
                    <p className="text-muted-foreground">San Rafael, Mendoza, Argentina</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/50 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">¿Necesitás ayuda?</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Estamos aquí para ayudarte. Enviá un email y te responderemos lo antes posible.
                </p>
                <a 
                  href="mailto:app.miservicio@gmail.com"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <Mail className="w-4 h-4" />
                  Enviar email
                </a>
              </div>
            </div>
          </section>

          {/* Legal Section */}
          <section className="bg-card rounded-2xl p-8 border border-border/50 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              Información Legal
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Link 
                  href="/legal/terminos" 
                  className="block p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors group"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    Términos y Condiciones
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Conocé las condiciones de uso de la plataforma MiServicio
                  </p>
                </Link>
                <Link 
                  href="/legal/privacidad" 
                  className="block p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors group"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    Política de Privacidad
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Cómo protegemos y usamos tu información personal
                  </p>
                </Link>
              </div>
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Tu privacidad es importante</h3>
                <p className="text-muted-foreground text-sm">
                  En MiServicio respetamos tu privacidad y protegemos tus datos personales. 
                  Consultá nuestros documentos legales para conocer más sobre cómo manejamos tu información.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border/50 text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 MiServicio. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
