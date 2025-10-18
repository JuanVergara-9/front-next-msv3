import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones - miservicio',
  description: 'Términos y Condiciones de Uso de miservicio - Conectamos personas con profesionales locales',
}

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Términos y Condiciones de Uso
          </h1>
          <p className="text-lg text-muted-foreground">
            <strong>miservicio</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Última actualización: Octubre 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm">
            <p className="text-muted-foreground mb-6">
              Bienvenido/a a miservicio, una aplicación que conecta a personas que buscan un servicio con trabajadores y profesionales que los ofrecen.
              <br />
              Al registrarte o usar la aplicación, aceptás estos Términos y Condiciones. Si no estás de acuerdo, no deberás utilizar la plataforma.
            </p>

            <div className="space-y-8">
              {/* Section 1 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Objeto del servicio
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    miservicio actúa como un intermediario digital que facilita el contacto entre usuarios y trabajadores/proveedores de servicios.
                  </p>
                  <p className="text-muted-foreground">
                    miservicio no presta directamente los servicios ofrecidos ni forma parte de los acuerdos que se celebren entre las partes.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Registro y uso
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Para usar la aplicación, debés registrarte con datos reales y mantener tu información actualizada.
                  </p>
                  <p className="text-muted-foreground">
                    Sos responsable de la confidencialidad de tus credenciales de acceso.
                  </p>
                  <p className="text-muted-foreground">
                    Está prohibido usar miservicio para fines ilegales, fraudulentos o que afecten a otros usuarios.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Responsabilidad
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    miservicio no garantiza la calidad, disponibilidad ni resultado de los servicios contratados entre usuarios y trabajadores.
                  </p>
                  <p className="text-muted-foreground">
                    Cualquier acuerdo, pago, conflicto o incumplimiento entre ambas partes es responsabilidad exclusiva de ellas.
                  </p>
                  <p className="text-muted-foreground">
                    miservicio no se hace responsable por daños, pérdidas o disputas que puedan surgir entre usuarios y proveedores.
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Contenido
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Los usuarios y trabajadores son responsables del contenido que publiquen (fotos, descripciones, reseñas, etc.).
                  </p>
                  <p className="text-muted-foreground">
                    MiServicio puede eliminar o suspender cuentas o contenidos que considere inapropiados, falsos o que violen estos Términos.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  Limitación de servicio
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    miservicio se reserva el derecho de modificar, suspender o interrumpir la plataforma, total o parcialmente, en cualquier momento, sin previo aviso.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">6</span>
                  Propiedad intelectual
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    El nombre, logotipo y diseño de miservicio son propiedad de sus creadores y no pueden ser usados sin autorización previa.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">7</span>
                  Ley aplicable
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Estos Términos se rigen por las leyes de la República Argentina.
                  </p>
                  <p className="text-muted-foreground">
                    Cualquier conflicto será resuelto ante los tribunales competentes de la ciudad de San Rafael, Mendoza.
                  </p>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-border/50">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Para consultas sobre estos términos, contactanos:
                  </p>
                  <a 
                    href="mailto:app.miservicio@gmail.com" 
                    className="text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    📧 app.miservicio@gmail.com
                  </a>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>miservicio © 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
