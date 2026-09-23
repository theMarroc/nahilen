import type { Metadata } from "next";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";

import {
  agregarFotoGaleria,
  alternarFaq,
  borrarBeneficio,
  borrarFaq,
  borrarFotoGaleria,
  guardarAjustes,
  guardarBeneficio,
  guardarFaq,
} from "@/actions/admin/contenido";
import { FormularioAdmin } from "@/components/admin/formulario-admin";
import { FormularioConfirmado } from "@/components/admin/formulario-confirmado";
import { Interruptor } from "@/components/admin/interruptor";
import { PanelAdmin, SinDatos, TituloAdmin } from "@/components/admin/piezas";
import { SubidorImagen } from "@/components/admin/subidor";
import {
  AreaTexto,
  Campo,
  CampoConEtiqueta,
  Selector,
} from "@/components/ui/campos";
import { IconoBeneficio, NOMBRES_ICONO } from "@/components/ui/marca";
import { getAjustes, getBeneficios, getFaqs, getGaleria } from "@/lib/db";
import { ajuste, ajusteCrudo } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Textos y fotos",
  robots: { index: false, follow: false },
};

export default async function ContenidoAdmin() {
  const [ajustes, beneficios, preguntas, galeria] = await Promise.all([
    getAjustes(),
    getBeneficios(true),
    getFaqs(true),
    getGaleria(true),
  ]);

  return (
    <>
      <TituloAdmin
        titulo="Textos y fotos"
        texto="Todo lo que se lee en la página se edita desde acá."
      />

      <div className="flex flex-col gap-6">
        {/* --------------------------------------------------------------- */}
        <PanelAdmin
          titulo="Portada"
          texto="El título grande se parte en dos: la primera parte va derecha y la segunda en cursiva de color."
        >
          <FormularioAdmin accion={guardarAjustes}>
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoConEtiqueta etiqueta="Título (primera parte)">
                <Campo
                  name="ajuste_hero_titulo"
                  defaultValue={ajuste(ajustes, "hero_titulo")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Título (parte en cursiva)">
                <Campo
                  name="ajuste_hero_titulo_cursiva"
                  defaultValue={ajuste(ajustes, "hero_titulo_cursiva")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Texto de abajo" className="sm:col-span-2">
                <AreaTexto
                  name="ajuste_hero_texto"
                  rows={2}
                  defaultValue={ajuste(ajustes, "hero_texto")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Texto del botón">
                <Campo
                  name="ajuste_hero_cta_texto"
                  defaultValue={ajuste(ajustes, "hero_cta_texto")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta
                etiqueta="A dónde lleva el botón"
                ayuda="/tienda, /combos, /contacto..."
              >
                <Campo
                  name="ajuste_hero_cta_link"
                  defaultValue={ajuste(ajustes, "hero_cta_link")}
                />
              </CampoConEtiqueta>

              <div className="sm:col-span-2">
                <SubidorImagen
                  nombre="ajuste_hero_imagen"
                  carpeta="portada"
                  etiqueta="Foto de portada"
                  ayuda="Se ve a la derecha del título. Conviene una foto horizontal y luminosa."
                  valorInicial={ajusteCrudo(ajustes, "hero_imagen")}
                />
              </div>

              <CampoConEtiqueta
                etiqueta="Frase de la franja amarilla"
                className="sm:col-span-2"
              >
                <Campo
                  name="ajuste_frase_destacada"
                  defaultValue={ajuste(ajustes, "frase_destacada")}
                />
              </CampoConEtiqueta>
            </div>
          </FormularioAdmin>
        </PanelAdmin>

        {/* --------------------------------------------------------------- */}
        <PanelAdmin
          titulo="Títulos de las secciones"
          texto="Cada título se arma igual: una parte derecha y otra en cursiva."
        >
          <FormularioAdmin accion={guardarAjustes}>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["Categorías", "categorias_titulo", "categorias_titulo_cursiva"],
                  ["Destacados", "destacados_titulo", "destacados_titulo_cursiva"],
                  ["Ofertas", "ofertas_titulo", "ofertas_titulo_cursiva"],
                  ["Combos", "combos_titulo", "combos_titulo_cursiva"],
                  ["Carrusel", "carrusel_titulo", "carrusel_titulo_cursiva"],
                  ["Preguntas frecuentes", "faq_titulo", "faq_titulo_cursiva"],
                ] as const
              ).map(([etiqueta, clave, claveCursiva]) => (
                <div key={clave} className="grid grid-cols-2 gap-2 sm:col-span-1">
                  <CampoConEtiqueta etiqueta={etiqueta}>
                    <Campo
                      name={`ajuste_${clave}`}
                      defaultValue={ajuste(ajustes, clave)}
                    />
                  </CampoConEtiqueta>
                  <CampoConEtiqueta etiqueta="En cursiva">
                    <Campo
                      name={`ajuste_${claveCursiva}`}
                      defaultValue={ajuste(ajustes, claveCursiva)}
                    />
                  </CampoConEtiqueta>
                </div>
              ))}

              <CampoConEtiqueta
                etiqueta="Texto debajo de Categorías"
                className="sm:col-span-2"
              >
                <AreaTexto
                  name="ajuste_categorias_texto"
                  rows={2}
                  defaultValue={ajuste(ajustes, "categorias_texto")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Título del newsletter">
                <Campo
                  name="ajuste_newsletter_titulo"
                  defaultValue={ajuste(ajustes, "newsletter_titulo")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Texto del newsletter">
                <Campo
                  name="ajuste_newsletter_texto"
                  defaultValue={ajuste(ajustes, "newsletter_texto")}
                />
              </CampoConEtiqueta>
            </div>
          </FormularioAdmin>
        </PanelAdmin>

        {/* --------------------------------------------------------------- */}
        <PanelAdmin titulo="Página Nosotros">
          <FormularioAdmin accion={guardarAjustes}>
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoConEtiqueta etiqueta="Título">
                <Campo
                  name="ajuste_nosotros_titulo"
                  defaultValue={ajuste(ajustes, "nosotros_titulo")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Título en cursiva">
                <Campo
                  name="ajuste_nosotros_titulo_cursiva"
                  defaultValue={ajuste(ajustes, "nosotros_titulo_cursiva")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta
                etiqueta="La historia"
                className="sm:col-span-2"
                ayuda="Dejá un renglón vacío entre párrafos"
              >
                <AreaTexto
                  name="ajuste_nosotros_texto"
                  rows={7}
                  defaultValue={ajuste(ajustes, "nosotros_texto")}
                />
              </CampoConEtiqueta>
            </div>
          </FormularioAdmin>
        </PanelAdmin>

        {/* --------------------------------------------------------------- */}
        <PanelAdmin
          titulo="Barra de beneficios"
          texto="La tira que va debajo de la portada."
        >
          <div className="flex flex-col gap-3">
            {beneficios.map((beneficio) => (
              <div
                key={beneficio.id}
                className="flex flex-wrap items-end gap-3 rounded-marca border border-arena/25 bg-crema/40 p-3"
              >
                <IconoBeneficio nombre={beneficio.icon} className="mb-1.5 h-8 w-8" />

                <FormularioAdmin
                  accion={guardarBeneficio}
                  textoBoton="Guardar"
                  tamano="sm"
                  variante="secundario"
                  className="flex flex-1 flex-wrap items-end gap-3"
                >
                  <input type="hidden" name="id" value={beneficio.id} />

                  <CampoConEtiqueta etiqueta="Ícono" className="w-32">
                    <Selector name="icon" defaultValue={beneficio.icon}>
                      {NOMBRES_ICONO.map((nombre) => (
                        <option key={nombre} value={nombre}>
                          {nombre}
                        </option>
                      ))}
                    </Selector>
                  </CampoConEtiqueta>

                  <CampoConEtiqueta etiqueta="Título" className="min-w-36 flex-1">
                    <Campo name="title" defaultValue={beneficio.title} />
                  </CampoConEtiqueta>

                  <CampoConEtiqueta etiqueta="Debajo" className="min-w-36 flex-1">
                    <Campo name="subtitle" defaultValue={beneficio.subtitle ?? ""} />
                  </CampoConEtiqueta>

                  <CampoConEtiqueta etiqueta="Orden" className="w-20">
                    <Campo
                      name="sort_order"
                      type="number"
                      defaultValue={String(beneficio.sort_order)}
                    />
                  </CampoConEtiqueta>
                </FormularioAdmin>

                <FormularioConfirmado
                  accion={borrarBeneficio}
                  mensaje={`¿Sacar "${beneficio.title}" de la barra de beneficios?`}
                  className="mb-1"
                >
                  <input type="hidden" name="id" value={beneficio.id} />
                  <button
                    type="submit"
                    title="Borrar"
                    className="rounded-marca p-2 text-arena transition-colors hover:bg-terracota/10 hover:text-terracota"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </FormularioConfirmado>
              </div>
            ))}

            <FormularioAdmin
              accion={guardarBeneficio}
              textoBoton="Agregar beneficio"
              tamano="sm"
              className="flex flex-wrap items-end gap-3 rounded-marca border border-dashed border-arena/50 p-3"
            >
              <CampoConEtiqueta etiqueta="Ícono" className="w-32">
                <Selector name="icon" defaultValue="hoja">
                  {NOMBRES_ICONO.map((nombre) => (
                    <option key={nombre} value={nombre}>
                      {nombre}
                    </option>
                  ))}
                </Selector>
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Título" className="min-w-36 flex-1">
                <Campo name="title" placeholder="Hecho a mano" />
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Debajo" className="min-w-36 flex-1">
                <Campo name="subtitle" placeholder="con amor" />
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Orden" className="w-20">
                <Campo
                  name="sort_order"
                  type="number"
                  defaultValue={String(beneficios.length + 1)}
                />
              </CampoConEtiqueta>
            </FormularioAdmin>
          </div>
        </PanelAdmin>

        {/* --------------------------------------------------------------- */}
        <PanelAdmin titulo="Preguntas frecuentes">
          <div className="flex flex-col gap-3">
            {preguntas.map((pregunta) => (
              <div
                key={pregunta.id}
                className="rounded-marca border border-arena/25 bg-crema/40 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <Interruptor
                    accion={alternarFaq}
                    campos={{ id: pregunta.id }}
                    activo={pregunta.is_active}
                    etiqueta={`Mostrar la pregunta ${pregunta.question}`}
                  />
                  <FormularioConfirmado
                    accion={borrarFaq}
                    mensaje={`¿Borrar la pregunta "${pregunta.question}"? Si solo querés ocultarla, apagala con el interruptor.`}
                  >
                    <input type="hidden" name="id" value={pregunta.id} />
                    <button
                      type="submit"
                      title="Borrar"
                      className="rounded-marca p-2 text-arena transition-colors hover:bg-terracota/10 hover:text-terracota"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </FormularioConfirmado>
                </div>

                <FormularioAdmin
                  accion={guardarFaq}
                  textoBoton="Guardar"
                  tamano="sm"
                  variante="secundario"
                  className="flex flex-col gap-3"
                >
                  <input type="hidden" name="id" value={pregunta.id} />
                  <input
                    type="hidden"
                    name="sort_order"
                    value={String(pregunta.sort_order)}
                  />

                  <CampoConEtiqueta etiqueta="Pregunta">
                    <Campo name="question" defaultValue={pregunta.question} />
                  </CampoConEtiqueta>

                  <CampoConEtiqueta etiqueta="Respuesta">
                    <AreaTexto name="answer" rows={3} defaultValue={pregunta.answer} />
                  </CampoConEtiqueta>
                </FormularioAdmin>
              </div>
            ))}

            <FormularioAdmin
              accion={guardarFaq}
              textoBoton="Agregar pregunta"
              tamano="sm"
              className="flex flex-col gap-3 rounded-marca border border-dashed border-arena/50 p-3"
            >
              <input
                type="hidden"
                name="sort_order"
                value={String(preguntas.length + 1)}
              />
              <CampoConEtiqueta etiqueta="Pregunta">
                <Campo name="question" placeholder="¿Hacen envíos los sábados?" />
              </CampoConEtiqueta>
              <CampoConEtiqueta etiqueta="Respuesta">
                <AreaTexto name="answer" rows={3} />
              </CampoConEtiqueta>
            </FormularioAdmin>
          </div>
        </PanelAdmin>

        {/* --------------------------------------------------------------- */}
        <PanelAdmin
          titulo="Carrusel de fotos"
          texto="Las fotos que se deslizan solas en la portada. Si no cargás ninguna, se usan las fotos de los productos."
        >
          {galeria.length > 0 ? (
            <ul className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {galeria.map((foto) => (
                <li
                  key={foto.id}
                  className="overflow-hidden rounded-marca border border-arena/30"
                >
                  <div className="relative aspect-4/5 bg-beige/30">
                    <Image
                      src={foto.url}
                      alt=""
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2">
                    <span className="min-w-0 truncate text-xs text-carbon/70">
                      {foto.caption || "Sin texto"}
                    </span>
                    <FormularioConfirmado
                      accion={borrarFotoGaleria}
                      mensaje="¿Sacar esta foto del carrusel?"
                    >
                      <input type="hidden" name="id" value={foto.id} />
                      <button
                        type="submit"
                        title="Borrar"
                        className="rounded-marca p-1.5 text-arena transition-colors hover:bg-terracota/10 hover:text-terracota"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </FormularioConfirmado>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mb-5">
              <SinDatos mensaje="Todavía no hay fotos en el carrusel." />
            </div>
          )}

          <FormularioAdmin
            accion={agregarFotoGaleria}
            textoBoton="Agregar al carrusel"
            tamano="sm"
            className="flex flex-col gap-4 rounded-marca border border-dashed border-arena/50 p-4"
          >
            <SubidorImagen nombre="url" carpeta="galeria" etiqueta="Foto" />
            <CampoConEtiqueta etiqueta="Texto sobre la foto" ayuda="Opcional">
              <Campo name="caption" placeholder="Cocinando la mermelada de higo" />
            </CampoConEtiqueta>
          </FormularioAdmin>

          <p className="mt-4 flex items-center gap-1.5 text-xs text-arena">
            <Plus className="h-3.5 w-3.5" />
            Podés agregar todas las fotos que quieras, se van turnando solas.
          </p>
        </PanelAdmin>
      </div>
    </>
  );
}
