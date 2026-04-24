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
            <p className="text-muted-foreground mb-6">
              Bienvenido/a a <strong>miservicio</strong>. Al registrarte o utilizar nuestra plataforma (sitio web o Chatbot de WhatsApp), aceptás estos Términos y Condiciones, los cuales constituyen un contrato legalmente vinculante. Si no estás de acuerdo con alguna de estas cláusulas, por favor, abstenete de utilizar el servicio.
            </p>

            <div className="space-y-8">
              {/* Section 1 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Descripción del Servicio y Fase Beta
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    <strong>miservicio</strong> es una plataforma tecnológica que facilita el contacto entre personas que requieren un servicio (&quot;Clientes&quot;) y prestadores independientes que los ofrecen (&quot;Proveedores&quot;).
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-muted-foreground">
                      <strong>1.1 Fase de Validación (Beta):</strong> El usuario reconoce que la plataforma opera actualmente en una fase de validación técnica. El servicio se ofrece &quot;tal cual está&quot;. miservicio se compromete a notificar con al menos 48 horas de anticipación cualquier modificación sustancial que afecte la funcionalidad esencial, salvo casos de fuerza mayor o urgencia técnica. Durante esta fase, el usuario acepta la posibilidad de errores menores que serán corregidos progresivamente.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Gratuidad y Modelo de Negocio
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Durante esta etapa, el registro y la intermediación básica son <strong>gratuitos</strong>. miservicio se reserva el derecho de implementar modelos de suscripción (como el nivel PRO) o comisiones en el futuro, notificando previamente a los usuarios antes de su entrada en vigencia.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Capacidad y Registro
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    El servicio es para <strong>mayores de 18 años</strong> con capacidad legal. Al registrarte, declarás bajo juramento que los datos proporcionados son reales.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-muted-foreground">
                      <strong>3.1 Verificación de Identidad (Insignia de Confianza):</strong> Ofrecemos una verificación opcional mediante DNI y selfie.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                      <li><strong>Alcance Limitado:</strong> Confirma que la persona coincide con el documento al momento de la verificación.</li>
                    </ul>
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-2">
                      <p className="text-muted-foreground font-semibold text-sm">IMPORTANTE: Esta verificación NO constituye:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2 text-sm mt-1">
                        <li>Una certificación de idoneidad técnica</li>
                        <li>Garantía de ausencia de antecedentes penales o judiciales</li>
                        <li>Validación de matrícula profesional habilitante</li>
                        <li>Un aval sobre la calidad del servicio prestado</li>
                      </ul>
                    </div>
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
                    <strong>miservicio</strong> actúa únicamente como un intermediario digital (vidriera). No existe relación laboral, de dependencia ni subordinación entre los Proveedores y miservicio. El Proveedor es un profesional autónomo responsable de sus propias obligaciones impositivas y herramientas de trabajo.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  Limitación de Responsabilidad
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Dado que <strong>miservicio</strong> no forma parte de la transacción final:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong>Calidad y Conflictos:</strong> Cualquier reclamo por daños o perjuicios derivados del servicio es un asunto privado entre Cliente y Proveedor. miservicio queda eximido de toda responsabilidad civil, penal o administrativa.</li>
                    <li><strong>Seguridad:</strong> La contratación es responsabilidad exclusiva de las partes. No realizamos visitas domiciliarias ni verificaciones de antecedentes de oficio.</li>
                  </ul>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">6</span>
                  Generación de Reputación y Historial Profesional
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    La plataforma procesa datos de actividad (trabajos realizados, puntualidad, reseñas) para construir un Historial de Trabajo o Reputación Digital. El usuario acepta que este historial es propiedad de miservicio y podrá ser utilizado para ofrecer beneficios, niveles de visibilidad o servicios financieros basados en el desempeño.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">7</span>
                  Propiedad Intelectual y Licencia de Contenido
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    <strong>7.1 Propiedad:</strong> El software, marca y diseño de <strong>miservicio</strong> son propiedad exclusiva de sus creadores.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>7.2 Contenido del Usuario:</strong> Al subir fotos o reseñas, otorgás a miservicio una licencia gratuita y mundial para usar dicho material en promoción, redes sociales y mejora de algoritmos de Inteligencia Artificial.
                  </p>
                </div>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">8</span>
                  Suspensión Preventiva y Cancelación
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    <strong>8.1 Suspensión:</strong> Podemos suspender una cuenta preventivamente (máximo 10 días) ante denuncias fundadas, sospecha de fraude o uso de documentos falsos mientras se investiga el caso.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>8.2 Baja:</strong> Nos reservamos el derecho de eliminar cuentas que violen estos términos o utilicen lenguaje ofensivo, sin derecho a indemnización.
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">9</span>
                  Resolución de Conflictos (Mediación)
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Previo a cualquier acción judicial, las partes se comprometen a intentar resolver sus diferencias mediante una <strong>Mediación Privada</strong> ante un mediador matriculado en la Provincia de Mendoza, por un plazo máximo de 30 días, compartiendo los gastos de la misma por partes iguales.
                  </p>
                </div>
              </section>

              {/* Section 10 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">10</span>
                  Ley Aplicable y Jurisdicción
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Estos términos se rigen por las leyes de la República Argentina. Solo en caso de fracaso de la mediación, las partes se someten a los <strong>Tribunales Ordinarios de la ciudad de San Rafael, Mendoza</strong>.
                  </p>
                </div>
              </section>

              {/* Section 11 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">11</span>
                  Consentimiento Electrónico y Trazabilidad
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Al interactuar con nuestro Chatbot y aceptar los términos, manifiestas tu consentimiento expreso. miservicio registrará la traza de auditoría (número, fecha y hora) como prueba fehaciente del contrato.
                  </p>
                </div>
              </section>

              {/* Section 12 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">12</span>
                  Cláusula de Indemnidad
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    El usuario se compromete a mantener indemne a miservicio, sus directores y representantes frente a cualquier reclamo, demanda o costo legal iniciado por terceros como consecuencia de su incumplimiento de estos términos o de los servicios prestados entre Cliente y Proveedor.
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
