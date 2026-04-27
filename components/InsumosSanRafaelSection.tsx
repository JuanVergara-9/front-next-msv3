"use client"

import { Store } from "lucide-react"
import { INSUMOS_SAN_RAFAEL_PARTNERS } from "@/lib/data/insumos-san-rafael-partners"

function PartnerLogo({
  name,
  logoSrc,
  href
}: {
  name: string
  logoSrc: string
  href?: string
}) {
  const inner = (
    <div className="flex h-24 md:h-28 w-full items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm transition hover:border-primary/25 hover:shadow-md">
      {/* eslint-disable-next-line @next/next/no-img-element — rutas dinámicas en /public */}
      <img
        src={logoSrc}
        alt={name}
        className="max-h-full max-w-full object-contain"
        loading="lazy"
      />
    </div>
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
        title={`${name} — abrir en nueva pestaña`}
      >
        {inner}
      </a>
    )
  }

  return <div title={name}>{inner}</div>
}

export function InsumosSanRafaelSection() {
  const partners = INSUMOS_SAN_RAFAEL_PARTNERS

  return (
    <section
      className="border-y border-slate-200/70 bg-gradient-to-b from-slate-50/90 to-white py-12 md:py-16"
      aria-labelledby="insumos-san-rafael-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary mb-3">
              <Store className="h-3.5 w-3.5" aria-hidden />
              San Rafael
            </div>
            <h2
              id="insumos-san-rafael-heading"
              className="text-2xl md:text-3xl font-black text-[#0e315d] tracking-tight"
            >
              Insumos en San Rafael
            </h2>
            <p className="mt-2 text-sm md:text-base text-[#0d519b]/70 font-medium max-w-2xl">
              Ferreterías y comercios locales donde podés conseguir materiales para tus trabajos. Acuerdos de difusión mutua con la ciudad.
            </p>
          </div>
        </div>

        {partners.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center">
            <p className="text-sm font-medium text-[#0d519b]/65 max-w-lg mx-auto">
              Estamos sumando ferreterías y comercios de la ciudad como referencias para tus materiales.
              Los logos aparecerán aquí en cuanto cerramos cada acuerdo.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 list-none p-0 m-0">
            {partners.map((p) => (
              <li key={`${p.name}-${p.logoSrc}`}>
                <PartnerLogo name={p.name} logoSrc={p.logoSrc} href={p.href} />
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 text-xs text-[#0d519b]/45 font-medium max-w-3xl">
          miservicio no vende insumos: los comercios mostrados son referencias locales para tu compra de materiales.
        </p>
      </div>
    </section>
  )
}
