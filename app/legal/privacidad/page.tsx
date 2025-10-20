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
              En miservicio valoramos tu privacidad. Esta Política explica cómo recolectamos, usamos y protegemos tu información personal.
            </p>

            <div className="space-y-8">
              {/* Section 1 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Datos que recopilamos
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Cuando te registrás o usás la app, podemos solicitar:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Nombre, apellido, correo electrónico, contraseña</li>
                    <li>Teléfono, provincia, ciudad, y foto de perfil</li>
                    <li>Información profesional (en caso de proveedores)</li>
                    <li>Ubicación (si aceptás compartirla para mostrarte resultados cercanos)</li>
                  </ul>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Uso de la información
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Utilizamos tus datos para:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Crear y gestionar tu cuenta</li>
                    <li>Mostrarte trabajadores o servicios cercanos</li>
                    <li>Permitir la comunicación entre usuarios y proveedores</li>
                    <li>Mejorar la experiencia en la plataforma</li>
                  </ul>
                  <p className="text-muted-foreground font-medium">
                    No vendemos ni compartimos tus datos personales con terceros ajenos al funcionamiento de miservicio.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Protección de datos
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Adoptamos medidas de seguridad razonables para proteger tu información frente a accesos no autorizados, pérdidas o usos indebidos.
                  </p>
                  <p className="text-muted-foreground">
                    Aun así, ningún sistema es completamente seguro, por lo que no podemos garantizar una protección absoluta.
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Derechos del usuario
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Podés acceder, modificar o eliminar tus datos en cualquier momento enviando una solicitud a{' '}
                    <a 
                      href="mailto:app.miservicio@gmail.com" 
                      className="text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      app.miservicio@gmail.com
                    </a>
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  Uso de cookies y almacenamiento
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Podemos usar cookies o almacenamiento local (por ejemplo, tokens de sesión) para mejorar el funcionamiento de la app.
                  </p>
                  <p className="text-muted-foreground">
                    Podés desactivarlas desde la configuración de tu navegador o dispositivo.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">6</span>
                  Cambios en esta política
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Podemos actualizar esta Política de Privacidad en cualquier momento.
                  </p>
                  <p className="text-muted-foreground">
                    Si hay cambios importantes, te lo informaremos en la app o por correo electrónico.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">7</span>
                  Contacto
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Para consultas o reclamos sobre privacidad, escribinos a:
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <a 
                      href="mailto:app.miservicio@gmail.com" 
                      className="text-primary hover:text-primary/80 transition-colors font-medium text-lg flex items-center gap-2"
                    >
                      📧 app.miservicio@gmail.com
                    </a>
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
