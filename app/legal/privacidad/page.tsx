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
            <p className="text-muted-foreground mb-6">
              En <strong>miservicio</strong>, la protección de tus datos es nuestra prioridad. Esta política cumple con la <strong>Ley de Protección de Datos Personales N° 25.326</strong> de la República Argentina.
            </p>

            <div className="space-y-8">
              {/* Section 1 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Información que recopilamos
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Recabamos datos para que la plataforma funcione:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong>Registro y Perfil:</strong> Nombre, correo, número de celular, dirección aproximada y foto.</li>
                    <li><strong>Proveedores:</strong> Profesión, fotos de trabajos, matrícula y datos de verificación (DNI y selfie).</li>
                    <li><strong>Interacción:</strong> Mensajes vía WhatsApp relacionados al servicio y registros de aceptación (Audit Trail).</li>
                    <li><strong>Ubicación:</strong> Solo con tu permiso expreso para mostrarte servicios cercanos.</li>
                  </ul>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Finalidad del tratamiento
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Usamos tus datos para conectarte con otros usuarios, gestionar tu cuenta, garantizar la seguridad y enviarte notificaciones del servicio.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <p className="text-muted-foreground">
                      <strong>2.1 Análisis de Reputación Digital (Scoring de Proveedores):</strong>
                    </p>
                    <p className="text-muted-foreground">
                      El scoring es un perfil construido mediante procesamiento automatizado de tu desempeño (trabajos cumplidos, calificaciones, tasa de respuesta). Con tu consentimiento expreso, usamos este perfil para:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                      <li>Darte acceso prioritario a nuevos trabajos.</li>
                      <li>Ofrecerte servicios financieros o beneficios premium (propios o de terceros).</li>
                    </ul>
                    <p className="text-muted-foreground text-sm">
                      <strong>Tu derecho:</strong> Podés rechazar o revocar este proceso desde la configuración de privacidad en cualquier momento.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Compartición y Transferencia Internacional
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    <strong>No vendemos tus datos.</strong> Compartimos información entre usuarios (Cliente/Proveedor) solo cuando se establece una conexión de trabajo.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-muted-foreground">
                      <strong>3.1 Transferencia Internacional:</strong> Algunos proveedores técnicos (como Google Cloud o AWS) pueden estar fuera de Argentina. Al aceptar esta política, autorizás la transferencia de datos a países con niveles adecuados de protección.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Retención de Datos (Plazos Claros)
                </h2>
                <div className="pl-11 space-y-3">
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong>Cuenta activa:</strong> Mientras uses la plataforma.</li>
                    <li><strong>Tras eliminación:</strong> Los datos de perfil se borran en 30 días; los de verificación (DNI/selfie) en 48 horas. Por obligación legal y fiscal, conservaremos el historial de transacciones por 10 años.</li>
                    <li><strong>Anonimización:</strong> Los datos de scoring se anonimizan irreversiblemente en 60 días tras la baja.</li>
                  </ul>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  Tus Derechos (Acceso, Rectificación, Supresión y Oposición)
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Tenés derecho a controlar tu información (Derechos ARCO):
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong>Acceso gratuito:</strong> Cada 6 meses.</li>
                    <li><strong>Rectificación o Supresión:</strong> Cuando los datos sean erróneos o ya no sean necesarios.</li>
                    <li><strong>Portabilidad:</strong> Recibir tus datos en formato legible.</li>
                  </ul>
                  <div className="bg-muted/50 rounded-lg p-4 mt-4 space-y-2">
                    <p className="text-muted-foreground text-sm">
                      <strong>Cómo ejercerlos:</strong> Enviá un email a <a href="mailto:app.miservicio@gmail.com" className="text-primary hover:underline font-medium">app.miservicio@gmail.com</a> con el asunto &quot;Ejercicio de Derechos ARCO&quot; y copia de tu DNI. Responderemos en un máximo de <strong>10 días hábiles</strong>.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">6</span>
                  Seguridad y Notificación de Brechas
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Implementamos medidas técnicas para protegerte. En caso de una brecha de seguridad que afecte tus datos, nos comprometemos a investigarla en <strong>72 horas</strong> y notificarte individualmente junto a la autoridad de control (AAIP) en un máximo de <strong>5 días hábiles</strong>.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">7</span>
                  Protección de Menores
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    <strong>miservicio</strong> no está dirigida a menores de 18 años. Si detectamos datos de un menor, procederemos a su eliminación inmediata en un plazo de <strong>72 horas</strong>.
                  </p>
                </div>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">8</span>
                  Cookies y Tecnologías de Rastreo
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Utilizamos cookies esenciales para mantener tu sesión activa y cookies analíticas (que podés desactivar) para entender cómo usás la app. No utilizamos cookies publicitarias de terceros por el momento.
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">9</span>
                  Autoridad de Control y Registro
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    <strong>miservicio</strong> está en proceso de registro de sus bases de datos ante la <strong>Agencia de Acceso a la Información Pública (AAIP)</strong>. Ante cualquier incumplimiento, tenés derecho a presentar un reclamo ante dicha agencia.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                    <p className="text-muted-foreground text-sm">
                      Av. Pte. Julio A. Roca 710, CABA
                    </p>
                    <a 
                      href="mailto:denuncias@aaip.gob.ar" 
                      className="text-primary hover:text-primary/80 transition-colors font-medium text-sm"
                    >
                      denuncias@aaip.gob.ar
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
                    Para consultas sobre privacidad, contactanos:
                  </p>
                  <a 
                    href="mailto:app.miservicio@gmail.com" 
                    className="text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    app.miservicio@gmail.com
                  </a>
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
