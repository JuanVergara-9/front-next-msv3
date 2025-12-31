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
            Última actualización: Diciembre 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm">
            <p className="text-muted-foreground mb-6">
              En <strong>miservicio</strong> nos tomamos muy en serio la protección de tus datos personales. Esta política detalla cómo recopilamos, utilizamos y protegemos tu información, en cumplimiento con la <strong>Ley de Protección de Datos Personales N° 25.326</strong> de la República Argentina.
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
                    Para el funcionamiento de la aplicación, recabamos los siguientes datos:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong>Datos de Registro:</strong> Nombre, apellido, correo electrónico, contraseña y foto de perfil.</li>
                    <li><strong>Datos de Contacto:</strong> Número de teléfono celular y dirección (provincia, ciudad, domicilio aproximado).</li>
                    <li><strong>Datos de las Solicitudes (Pedidos):</strong> La información que incluís al describir tu problema (ej: "Se rompió el tanque de agua", fotos del desperfecto, zona aproximada). Tené en cuenta que esta descripción será visible para los Proveedores registrados.</li>
                    <li><strong>Datos del Perfil (Proveedores):</strong> Profesión, descripción de habilidades, fotos de trabajos previos y matrícula (si aplica).</li>
                    <li><strong>Datos de Ubicación:</strong> Recopilamos tu ubicación precisa o aproximada (a través del GPS o red) <strong>solo si nos das permiso</strong>, para mostrarte servicios o clientes cercanos.</li>
                    <li><strong>Datos Técnicos:</strong> Información sobre tu dispositivo, dirección IP y sistema operativo para fines de seguridad y mejora de la app.</li>
                    <li><strong>Datos de Verificación de Identidad (Opcional):</strong> Si decidís verificar tu perfil, recopilaremos imágenes de tu DNI (frente y dorso) y una selfie para cotejar la identidad. Estos datos son sensibles y tienen protección reforzada.</li>
                  </ul>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Finalidad: ¿Para qué usamos tus datos?
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Tus datos personales serán utilizados con las siguientes finalidades:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong>Conexión de Servicios:</strong> Permitir que Clientes y Proveedores se encuentren y comuniquen.</li>
                    <li><strong>Gestión de Cuenta y Verificación:</strong> Crear tu perfil, brindarte soporte y, si lo solicitás, procesar tus documentos de identidad para otorgar la insignia de “Perfil Verificado”.</li>
                    <li><strong>Seguridad:</strong> Detectar y prevenir fraudes o usos indebidos de la plataforma.</li>
                    <li><strong>Comunicaciones:</strong> Enviarte notificaciones sobre tu cuenta o actualizaciones del servicio.</li>
                  </ol>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Compartición de datos con terceros
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    <strong>miservicio</strong> no vende tus datos personales. Sin embargo, para que la aplicación cumpla su función, es necesario compartir cierta información:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>
                      <strong>Entre Usuarios:</strong>
                      <div className="mt-2 ml-4 space-y-2">
                        <p><strong>Visibilidad de Pedidos:</strong> Al publicar una solicitud, entendés que la descripción del problema, las fotos adjuntas y tu zona aproximada (Barrio/Ciudad) serán visibles para los Proveedores registrados en la plataforma a fin de que puedan evaluar el trabajo y postularse.</p>
                        <p><strong>Datos de Contacto:</strong> Tu número de teléfono y dirección exacta solo se compartirán con el profesional una vez que se haya establecido una conexión o aceptación de presupuesto, según el flujo de la plataforma.</p>
                        <p className="text-xs italic mt-1">Las imágenes de tu DNI y tu selfie de verificación son de uso exclusivo del equipo de administración de miservicio y nunca se comparten ni se publican en tu perfil.</p>
                      </div>
                    </li>
                    <li><strong>Proveedores de Servicios Externos:</strong> Podemos usar servicios de terceros para alojamiento web, mapas (ej. Google Maps) o análisis de datos, quienes solo accederán a la información necesaria para prestar su servicio y bajo obligación de confidencialidad.</li>
                    <li><strong>Requerimiento Legal:</strong> Compartiremos información si una autoridad judicial competente lo solicita formalmente.</li>
                  </ul>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Consentimiento
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Al registrarte, declarás que los datos proporcionados son verdaderos y otorgás tu <strong>consentimiento expreso</strong> para que <strong>miservicio</strong> los procese conforme a esta política. La provisión de datos es voluntaria, pero la negativa a proporcionar los datos obligatorios impedirá el uso de la aplicación.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">5</span>
                  Seguridad de la información
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Implementamos medidas técnicas y organizativas razonables para proteger tus datos contra acceso no autorizado, alteración o pérdida. Sin embargo, ningún sistema de transmisión por internet es 100% seguro, por lo que no podemos garantizar la seguridad absoluta de la información transmitida.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">6</span>
                  Tus Derechos (Acceso, Rectificación y Supresión)
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Como titular de los datos, tenés derecho a acceder a tu información, rectificarla si es errónea o solicitar su eliminación (derecho al olvido), enviando un correo a <strong>app.miservicio@gmail.com</strong>.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 mt-4 space-y-2">
                    <p className="text-muted-foreground italic text-sm">
                      "El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley Nº 25.326".
                    </p>
                    <p className="text-muted-foreground italic text-sm">
                      "La Agencia de Acceso a la Información Pública, Órgano de Control de la Ley Nº 25.326, tiene la atribución de atender las denuncias y reclamos que se interpongan con relación al incumplimiento de las normas sobre protección de datos personales".
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">7</span>
                  Retención de datos
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Mantendremos tu información mientras tu cuenta esté activa o sea necesario para cumplir con obligaciones legales. Si decidís eliminar tu cuenta, tus datos personales serán bloqueados o eliminados, salvo aquellos que debamos conservar por ley.
                  </p>
                </div>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">8</span>
                  Cambios en la Política
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Podemos actualizar esta política ocasionalmente. Te notificaremos sobre cambios significativos a través de la app o por email. El uso continuado de la app implica la aceptación de los nuevos términos.
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">9</span>
                  Contacto
                </h2>
                <div className="pl-11 space-y-3">
                  <p className="text-muted-foreground">
                    Para dudas sobre privacidad, contactanos en:
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
