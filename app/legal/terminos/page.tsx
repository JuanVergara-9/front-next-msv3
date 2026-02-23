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
            Última actualización: Febrero 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm">
            <p className="text-muted-foreground mb-6">
              Bienvenido/a a <strong>miservicio</strong>. Al registrarte o utilizar nuestra aplicación, aceptás estos Términos y Condiciones, los cuales tienen carácter de contrato vinculante. Si no estás de acuerdo, te pedimos que no utilices la plataforma.
            </p>

            <div className="space-y-8">
              {/* Section 1 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Descripción del Servicio y Funcionalidad de Pedidos
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    <strong>miservicio</strong> es una plataforma tecnológica que facilita el contacto entre personas que requieren un servicio ("Clientes") y prestadores independientes que los ofrecen ("Proveedores").
                  </p>
                  <p className="text-muted-foreground">
                    La plataforma permite a los Clientes publicar solicitudes de trabajo ("Pedidos") detallando su necesidad, para que los Proveedores registrados puedan visualizar dichas solicitudes y postularse. Actualmente, la plataforma opera en una fase de validación y prueba (Beta). El usuario reconoce que el servicio se ofrece "tal cual está", pudiendo presentar interrupciones o modificaciones sin previo aviso.
                  </p>
                  <p className="text-muted-foreground">
                    El acceso y uso de la plataforma puede realizarse tanto a través de la aplicación web/móvil como a través de nuestro Chatbot oficial en WhatsApp. Todas las interacciones, solicitudes y confirmaciones realizadas mediante nuestro canal de WhatsApp tienen la misma validez legal y están sujetas a estos mismos Términos y Condiciones.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Gratuidad del Servicio
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Durante esta etapa inicial, el uso de la aplicación, el registro y la intermediación son <strong>totalmente gratuitos</strong> tanto para Clientes como para Proveedores.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>miservicio</strong> se reserva el derecho de modificar esta condición en el futuro, notificando previamente a los usuarios sobre cualquier implementación de tarifas, comisiones o modelos de suscripción antes de su entrada en vigencia.
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
                    El servicio está reservado exclusivamente para <strong>mayores de 18 años</strong> con capacidad legal plena para contratar. Al registrarte, declarás bajo juramento que los datos proporcionados son reales, propios y actuales.
                  </p>
                  <p className="text-muted-foreground">
                    <strong>miservicio</strong> se reserva el derecho de solicitar comprobantes de identidad si lo considera necesario.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-muted-foreground">
                      <strong>3.1 Verificación de Identidad (Insignia de Confianza):</strong> miservicio ofrece una verificación opcional. Podés enviar imágenes de tu DNI (frente y dorso) y una selfie para obtener la insignia de “Perfil Verificado”.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                      <li><strong>Alcance:</strong> Confirma que la persona de la cuenta posee un documento válido que coincide con su rostro al momento de la verificación.</li>
                      <li><strong>No es garantía de conducta:</strong> No acredita idoneidad profesional, honestidad ni ausencia de antecedentes penales.</li>
                      <li><strong>Rechazo:</strong> Podemos rechazar o retirar la insignia si hay inconsistencias, documentos ilegibles o sospecha de fraude.</li>
                    </ul>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-muted-foreground">
                      <strong>3.2 Reglas para la Publicación de Pedidos:</strong> Al utilizar la funcionalidad de "Publicar Pedido", el Cliente se compromete a:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                      <li><strong>Veracidad:</strong> Describir una necesidad real de servicio.</li>
                      <li><strong>Contenido Apropiado:</strong> No publicar solicitudes con contenido ilícito, sexual, violento, discriminatorio o que viole leyes vigentes.</li>
                      <li><strong>Privacidad en la Descripción:</strong> No incluir datos de contacto directo (teléfono, email) ni direcciones exactas (calle y número) en la descripción pública del problema, para proteger su propia seguridad hasta el momento del contacto con el profesional.</li>
                    </ul>
                    <p className="text-muted-foreground text-sm italic mt-2">
                      miservicio se reserva el derecho de rechazar, editar o eliminar cualquier pedido que considere sospecho, ofensivo o que infrinja estas normas, sin previo aviso y sin derecho a reclamo.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Independencia Laboral (Cláusula Clave)
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    <strong>miservicio</strong> actúa únicamente como un intermediario digital (vidriera de contacto).
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong>No existe relación laboral:</strong> Los Proveedores son profesionales autónomos e independientes. No existe ningún tipo de relación laboral, de dependencia, subordinación técnica, jurídica o económica entre los Proveedores y <strong>miservicio</strong>.</li>
                    <li><strong>Responsabilidad:</strong> El Proveedor asume su propia responsabilidad impositiva, previsional y de seguridad social. <strong>miservicio</strong> no dirige, no supervisa horarios ni provee herramientas de trabajo a los Proveedores.</li>
                  </ul>
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
                    Dado que <strong>miservicio</strong> no presta los servicios ofrecidos ni forma parte de la transacción final:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong>Calidad del servicio:</strong> No garantizamos la calidad, seguridad, idoneidad o resultado de los trabajos realizados.</li>
                    <li><strong>Conflictos:</strong> Cualquier reclamo, daño, perjuicio o disputa derivada del servicio prestado es un asunto privado y exclusivo entre el Cliente y el Proveedor. <strong>miservicio</strong> queda eximido de toda responsabilidad civil, penal o administrativa.</li>
                    <li><strong>Seguridad:</strong> Aunque promovemos una comunidad segura y ofrecemos una insignia de verificado, <strong>miservicio no realiza verificaciones de antecedentes penales ni visitas domiciliarias</strong>. La contratación es responsabilidad exclusiva de las partes.</li>
                  </ul>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">6</span>
                  Pagos entre Usuarios
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    En esta etapa, cualquier pago por los servicios prestados se acuerda y ejecuta <strong>exclusivamente entre el Cliente y el Proveedor</strong> (en efectivo u otros medios ajenos a la app). <strong>miservicio</strong> no procesa pagos, no cobra comisiones por transacción ni interviene en la facturación de los servicios.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">7</span>
                  Propiedad Intelectual y Contenido
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    El usuario conserva los derechos sobre las fotos o reseñas que publique, pero otorga a <strong>miservicio</strong> una licencia gratuita y no exclusiva para utilizar dicho contenido (ej. fotos de trabajos realizados) con fines de promoción y mejora de la plataforma.
                  </p>
                  <p className="text-muted-foreground">
                    El software, marca y diseño de <strong>miservicio</strong> son propiedad exclusiva de sus creadores.
                  </p>
                </div>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">8</span>
                  Cancelación y Derecho de Admisión
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    <strong>miservicio</strong> se reserva el derecho de suspender o eliminar, temporal o definitivamente, la cuenta de cualquier usuario que viole estos términos, utilice lenguaje ofensivo, o cuya conducta sea reportada como inapropiada, sin que esto genere derecho a indemnización alguna.
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">9</span>
                  Ley Aplicable y Jurisdicción
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Estos Términos se rigen por las leyes vigentes en la República Argentina. Para cualquier controversia legal, las partes se someten a la jurisdicción exclusiva de los <strong>Tribunales Ordinarios de la ciudad de San Rafael, provincia de Mendoza</strong>, renunciando a cualquier otro fuero que pudiera corresponderles.
                  </p>
                </div>
              </section>

              {/* Section 10 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">10</span>
                  Consentimiento Electrónico y Trazabilidad
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Al utilizar nuestro Chatbot de WhatsApp y seleccionar la opción "Acepto" (o equivalente) frente a nuestros Términos y Políticas, el usuario manifiesta su consentimiento expreso, libre e informado. miservicio registrará de forma encriptada y segura la traza de auditoría de dicha aceptación, incluyendo el número de teléfono, la fecha, la hora exacta y la versión de los términos aceptados, sirviendo este registro como prueba fehaciente del contrato entre las partes.
                  </p>
                </div>
              </section>

              {/* Section 11 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">11</span>
                  Generación de Reputación y Perfil de Trabajo
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    miservicio tiene como objetivo potenciar el desarrollo profesional de los Proveedores. Por ello, la plataforma recopila, procesa y analiza datos derivados de la actividad en la app (cantidad de trabajos realizados, cumplimiento, calificaciones de los Clientes, y presupuestos estimados). Esta información se utiliza para construir un "Historial de Trabajo" o "Scoring" (Reputación Digital). El usuario acepta que este historial es propiedad de miservicio y podrá ser utilizado en el futuro para ofrecer, directa o indirectamente, beneficios, adelantos o servicios financieros basados en su desempeño.
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
