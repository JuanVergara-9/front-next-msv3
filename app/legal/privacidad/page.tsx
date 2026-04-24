import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad - miservicio',
  description: 'Política de Privacidad de miservicio - Cómo protegemos y usamos tu información personal',
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
            <span className="text-4xl">🔒</span>
            Política de Privacidad
          </h1>
          <p className="text-lg text-muted-foreground">
            <strong>Aplicación:</strong> miservicio
          </p>
          <p className="text-sm text-muted-foreground">
            Última actualización: Abril 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm">

            <div className="space-y-8">
              {/* Section 1 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Información Recopilada
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Datos de registro, contacto, fotos de pedidos, perfil profesional, ubicación (con permiso) y metadatos de WhatsApp.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Finalidad y Scoring
                </h2>
                <div className="pl-11 space-y-3">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <p className="text-muted-foreground">
                      <strong>2.1 Análisis de Reputación Digital (Scoring):</strong> Con tu consentimiento expreso, procesamos tus datos para ofrecerte prioridad en trabajos y beneficios financieros. Podés revocar este permiso en Configuración.
                    </p>
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                      <p className="text-muted-foreground text-sm">
                        <strong>Protección Especial:</strong> Nunca usaremos el scoring para decisiones discriminatorias por origen, género, orientación sexual, religión, condición social o discapacidad.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Transferencia Internacional
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Algunos de nuestros proveedores de servicios técnicos se encuentran fuera de la República Argentina. Al aceptar esta política, autorizás la transferencia de tus datos personales a los siguientes proveedores que garantizan niveles de protección adecuados según la AAIP:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong>Estados Unidos (Vercel Inc.):</strong> Proveedor del servicio de hosting y despliegue de nuestra plataforma frontend.</li>
                    <li><strong>Estados Unidos (Railway Corp.):</strong> Proveedor del servicio de infraestructura y alojamiento de nuestro backend y bases de datos.</li>
                    <li><strong>Estados Unidos / Irlanda (Meta Platforms, Inc.):</strong> Proveedor de la tecnología WhatsApp Business API para el funcionamiento de nuestro Chatbot oficial.</li>
                  </ul>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-muted-foreground text-sm">
                      <strong>Garantías:</strong> Estos terceros están contractualmente obligados a procesar tus datos bajo estrictas normas de confidencialidad y únicamente para los fines técnicos necesarios para la prestación del servicio de miservicio.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Retención de Datos
                </h2>
                <div className="pl-11 space-y-3">
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong>DNI/Selfie:</strong> Se eliminan en <strong>48 horas</strong> tras verificar.</li>
                    <li><strong>Datos de perfil:</strong> Se borran <strong>30 días</strong> después de la baja.</li>
                    <li><strong>Historial transaccional:</strong> Se guarda <strong>10 años</strong> por ley.</li>
                  </ul>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  Tus Derechos ARCO
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Acceso (gratis cada 6 meses), Rectificación, Supresión y Oposición.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-muted-foreground text-sm">
                      <strong>Contacto:</strong> <a href="mailto:app.miservicio@gmail.com" className="text-primary hover:underline font-medium">app.miservicio@gmail.com</a> (Asunto: &quot;Ejercicio de Derechos ARCO&quot;). Responderemos en <strong>10 días hábiles</strong>.
                    </p>
                    <p className="text-muted-foreground text-sm">
                      <strong>Reclamos AAIP:</strong> Av. Pte. Julio A. Roca 710, CABA | <a href="mailto:denuncias@aaip.gob.ar" className="text-primary hover:underline font-medium">denuncias@aaip.gob.ar</a>
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">6</span>
                  Seguridad y Brechas
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Investigamos incidentes en <strong>72 horas</strong> y notificamos a los afectados y a la AAIP en un máximo de <strong>5 días hábiles</strong>.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">7</span>
                  Menores
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    miservicio no es para menores de 18 años. Si detectamos datos de un menor, los borramos en <strong>72 horas</strong>.
                  </p>
                </div>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">8</span>
                  Cookies y Rastreo
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Usamos cookies <strong>Esenciales</strong> (sesión y seguridad) y <strong>Analíticas</strong> (desactivables). Nuestro chatbot registra metadatos de conversación, pero no accede a otros contactos o chats privados.
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">9</span>
                  Registro de Base de Datos
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    miservicio está en proceso de registro ante la <strong>AAIP</strong>.
                  </p>
                  <p className="text-muted-foreground text-sm italic">
                    Disposición: En trámite.
                  </p>
                </div>
              </section>

              {/* Section 10 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">10</span>
                  Modificaciones
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Avisaremos cambios significativos por email o banner. El uso continuado implica aceptación.
                  </p>
                </div>
              </section>

              {/* Section 11 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">11</span>
                  Contacto
                </h2>
                <div className="pl-11 space-y-3">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <a 
                      href="mailto:app.miservicio@gmail.com" 
                      className="text-primary hover:text-primary/80 transition-colors font-medium text-lg"
                    >
                      app.miservicio@gmail.com
                    </a>
                    <p className="text-muted-foreground text-sm mt-1">
                      Tiempo de respuesta: Máximo 10 días hábiles.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-border/50">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Protegemos tu privacidad y datos personales
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>miservicio © 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
