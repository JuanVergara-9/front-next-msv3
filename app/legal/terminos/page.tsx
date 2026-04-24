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
            <strong>Nombre de la App:</strong> miservicio
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
                  Descripción y Fase Beta
                </h2>
                <div className="pl-11 space-y-3">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-muted-foreground">
                      <strong>1.1 Validación técnica:</strong> miservicio opera en fase Beta. El servicio se ofrece &quot;tal cual está&quot;. Notificaremos cambios sustanciales con 48 horas de antelación, salvo urgencias técnicas.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Gratuidad
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    El uso básico es gratuito. miservicio se reserva el derecho de implementar modelos de suscripción o comisiones, notificando previamente.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Registro y Verificación
                </h2>
                <div className="pl-11 space-y-3">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-muted-foreground">
                      <strong>3.1 Verificación de Identidad (Insignia de Confianza):</strong> Ofrecemos una verificación opcional mediante DNI y selfie. Confirma que la persona coincide con el documento al momento de la verificación.
                    </p>
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-2">
                      <p className="text-muted-foreground font-semibold text-sm">IMPORTANTE: Esta verificación NO constituye:</p>
                      <p className="text-muted-foreground text-sm mt-1">
                        Certificación de idoneidad técnica, garantía de ausencia de antecedentes penales, validación de matrícula, aval de calidad ni garantía de solvencia.
                      </p>
                    </div>
                    <p className="text-muted-foreground text-sm mt-2">
                      <strong>Revocación:</strong> Podemos retirar la insignia sin previo aviso por inconsistencias o sospecha de fraude.
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-muted-foreground">
                      <strong>3.2 Reglas para Publicación de Pedidos:</strong> El Cliente se compromete a describir necesidades reales, sin contenido ilícito, violento o discriminatorio, y a no publicar datos de contacto directos en la descripción pública.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Independencia Laboral
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    miservicio es un intermediario digital. No existe relación laboral ni dependencia entre los Proveedores y miservicio.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  Responsabilidad
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Cualquier disputa por el servicio es un asunto privado entre Cliente y Proveedor. miservicio queda eximido de toda responsabilidad civil, penal o administrativa.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">6</span>
                  Reputación y Scoring
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Procesamos datos de actividad para construir tu &quot;Reputación Digital&quot;.
                  </p>
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-muted-foreground text-sm">
                      <strong>IMPORTANTE:</strong> El uso de estos datos para scoring financiero requiere tu consentimiento específico según la Política de Privacidad. El historial básico es propiedad de miservicio para gestionar la visibilidad en la plataforma.
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 mt-2">
                    <p className="text-muted-foreground">
                      <strong>6.1 Pagos entre Usuarios:</strong> Los pagos se acuerdan y ejecutan exclusivamente entre las partes (efectivo u otros medios ajenos). miservicio no procesa pagos ni interviene en la facturación.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">7</span>
                  Propiedad Intelectual
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    El software y la marca son propiedad exclusiva de miservicio. Otorgás una licencia de uso para el contenido que subas (fotos/reseñas) con fines de promoción y mejora de IA.
                  </p>
                </div>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">8</span>
                  Suspensión y Resolución de Conflictos
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    <strong>8.1 Suspensión Preventiva:</strong> Podemos suspender cuentas por 10 días ante denuncias de fraude o documentos falsos.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>8.2 Mediación:</strong> Previo a cualquier juicio, las partes aceptan una mediación privada en San Rafael, Mendoza, por un plazo máximo de 30 días.
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">9</span>
                  Ley Aplicable
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Leyes de Argentina. Jurisdicción: <strong>Tribunales Ordinarios de San Rafael, Mendoza</strong>.
                  </p>
                </div>
              </section>

              {/* Section 10 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">10</span>
                  Consentimiento y Trazabilidad
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    El uso del Bot de WhatsApp implica aceptación expresa. miservicio guarda registro encriptado de dicha aceptación (Audit Trail).
                  </p>
                </div>
              </section>

              {/* Section 11 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">11</span>
                  Indemnidad
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    El usuario mantendrá indemne a miservicio ante reclamos de terceros derivados de su uso de la app o de los servicios prestados.
                  </p>
                </div>
              </section>

              {/* Section 12 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">12</span>
                  Usos Prohibidos
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Prohibido contenido ilegal, suplantar identidad, acoso, o captar clientes para operar sistemáticamente fuera de la app. Infringir esto resulta en baja inmediata.
                  </p>
                </div>
              </section>

              {/* Section 13 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">13</span>
                  Modificaciones
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Podemos modificar estos términos con <strong>15 días</strong> de aviso para cambios sustanciales o <strong>7 días</strong> para menores, vía email o notificación push.
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
