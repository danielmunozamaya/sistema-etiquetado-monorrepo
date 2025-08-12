import "./LlenadorasAuto.css";
import LlenadoraAuto from "../../components/LlenadoraAuto/LlenadoraAuto";
import LlenadoraTriple from "../../components/LlenadoraTriple/LlenadoraTriple";
import { useEffect, useState, useRef } from "react";
import {
  getAsociaciones,
  queryNumeroBidon,
  queryPesos,
} from "./services/LlenadorasAuto";
import Spinner from "../../components/Spinner/Spinner";
import { useFailoverSocket } from "../../common/hooks/useFailoverSocket";
import { i18n } from "../../i18n";

function LlenadorasAuto() {
  const [datosLlenadoraCompleto, setDatosLlenadoraCompleto] = useState([]);
  const [datosLlenadora, setDatosLlenadora] = useState([]);
  const [datosLlenadoraTriple, setDatosLlenadoraTriple] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const startLoadingTime = useRef(new Date());
  const datosRef = useRef(null);

  const cargarAsociaciones = async (callback, mantenerPesos = false) => {
    try {
      const asociaciones = await getAsociaciones();

      const asociacionesAutomaticas = asociaciones.filter(
        (a) => a.llenadora?.etiquetado_auto === true
      );

      const agrupadasPorLlenadora = asociacionesAutomaticas.reduce((acc, a) => {
        const nombre = a.llenadora?.nombre_llenadora;
        if (!acc[nombre]) acc[nombre] = [];
        acc[nombre].push(a);
        return acc;
      }, {});

      // Protección defensiva: no continuar si queremos mantener pesos pero aún no hay datos cargados
      if (
        mantenerPesos &&
        (!Array.isArray(datosRef.current) || datosRef.current.length === 0)
      ) {
        console.warn("No se puede mantener pesos: datosRef.current está vacío");
        return;
      }

      const nuevasDatos = Object.entries(agrupadasPorLlenadora).map(
        ([nombreLlenadora, asociacionesDeLlenadora]) => {
          const idLlenadora = asociacionesDeLlenadora[0].id_llenadora;

          const llenadoraExistente =
            mantenerPesos &&
            Array.isArray(datosRef.current) &&
            datosRef.current.find((l) => l.id_llenadora === idLlenadora);

          const cabezales = asociacionesDeLlenadora.map((a) => {
            const idCabezal = a.cabezal?.id_cabezal ?? "";

            const cabezalExistente =
              mantenerPesos &&
              llenadoraExistente?.cabezales?.find(
                (c) => c.id_cabezal === idCabezal
              );

            return {
              id_cabezal: idCabezal,
              nombre_cabezal: a.cabezal?.nombre_cabezal ?? "",
              peso: mantenerPesos
                ? cabezalExistente?.peso ?? null
                : a.cabezal?.peso?.peso_plc ?? null,
              numero_bidon: mantenerPesos
                ? cabezalExistente?.numero_bidon ?? null
                : a.cabezal?.numero_bidon?.numero_bidon ?? null,
              comunicacion: mantenerPesos
                ? cabezalExistente?.comunicacion ?? 0
                : a.cabezal?.peso?.comunicacion ?? 0,
              producto: a.producto?.nombre_producto ?? "",
              presentacion: a.ean?.presentacion?.nombre_presentacion ?? "",
              codigo_ean: a.codigo_ean ?? "",
            };
          });

          return {
            nombre_llenadora: nombreLlenadora,
            id_llenadora: idLlenadora,
            cabezales,
          };
        }
      );

      datosRef.current = nuevasDatos;
      setDatosLlenadoraCompleto(nuevasDatos);

      const tiempoPasado = new Date() - startLoadingTime.current;
      const tiempoRestante = 600 - tiempoPasado;

      if (tiempoRestante > 0) {
        setTimeout(() => setIsLoading(false), tiempoRestante);
      } else {
        setIsLoading(false);
      }

      if (callback) callback();
    } catch (error) {
      console.error("Error al cargar asociaciones:", error);
    }
  };

  const cargarPesos = async () => {
    let pesosArray = [];

    try {
      pesosArray = await queryPesos();
    } catch (error) {
      console.error("Error al cargar pesos:", error);
      return;
    }

    const pesosSorted = {};

    pesosArray.forEach(
      ({ id_llenadora, id_cabezal_llenadora, peso_plc, comunicacion }) => {
        if (!pesosSorted[id_llenadora]) {
          pesosSorted[id_llenadora] = {};
        }
        pesosSorted[id_llenadora][id_cabezal_llenadora] = {
          peso_plc,
          comunicacion,
        };
      }
    );

    // Si aún no se han cargado las asociaciones, no hacemos nada
    if (!datosRef.current.some((d) => d.id_llenadora)) return;

    const actualizado = datosRef.current.map((llenadora) => {
      const nuevosCabezales = llenadora.cabezales.map((cabezal) => {
        if (pesosSorted[llenadora.id_llenadora]?.[cabezal.id_cabezal]) {
          return {
            ...cabezal,
            peso: pesosSorted[llenadora.id_llenadora][cabezal.id_cabezal]
              .peso_plc,
            comunicacion:
              pesosSorted[llenadora.id_llenadora][cabezal.id_cabezal]
                .comunicacion,
          };
        }

        return cabezal;
      });

      return {
        ...llenadora,
        cabezales: nuevosCabezales,
      };
    });

    datosRef.current = actualizado;
    setDatosLlenadoraCompleto(actualizado);
  };

  const cargarNumeroBidon = async () => {
    let numeroBidonArray = [];

    try {
      numeroBidonArray = await queryNumeroBidon();
    } catch (error) {
      console.error("Error al cargar los números de bidón:", error);
      return;
    }

    const numeroBidonSorted = {};

    numeroBidonArray.forEach(
      ({ id_llenadora, id_cabezal_llenadora, numero_bidon }) => {
        if (!numeroBidonSorted[id_llenadora]) {
          numeroBidonSorted[id_llenadora] = {};
        }
        numeroBidonSorted[id_llenadora][id_cabezal_llenadora] = numero_bidon;
      }
    );

    // Si aún no se han cargado las asociaciones, no hacemos nada
    if (!datosRef.current.some((d) => d.id_llenadora)) return;

    const actualizado = datosRef.current.map((llenadora) => {
      const nuevosCabezales = llenadora.cabezales.map((cabezal) => {
        const nuevoNumero =
          numeroBidonSorted[llenadora.id_llenadora]?.[cabezal.id_cabezal] ??
          cabezal.numero_bidon;

        return {
          ...cabezal,
          numero_bidon: nuevoNumero,
        };
      });

      return {
        ...llenadora,
        cabezales: nuevosCabezales,
      };
    });

    datosRef.current = actualizado;
    setDatosLlenadoraCompleto(actualizado);
  };

  useEffect(() => {
    startLoadingTime.current = new Date();
    cargarAsociaciones(() => {
      cargarNumeroBidon();
      cargarPesos();
    }, false);
  }, []);

  useEffect(() => {
    const normales = datosLlenadoraCompleto.filter(
      (l) => l.cabezales.length === 2
    );
    const triples = datosLlenadoraCompleto.filter(
      (l) => l.cabezales.length === 3
    );

    setDatosLlenadora(normales);
    setDatosLlenadoraTriple(triples);
  }, [datosLlenadoraCompleto]);

  useFailoverSocket("home.service.js", {
    getAsociaciones: () => cargarAsociaciones(null, true),
    getNumeroBidon: () => cargarNumeroBidon(),
    getPesos: () => cargarPesos(),
  });

  return (
    <>
      {isLoading && <Spinner />}

      {!isLoading && (
        <>
          {datosLlenadora.length === 0 && datosLlenadoraTriple.length === 0 ? (
            <div className="mensaje-sin-llenadoras">
              {i18n.llenadorasAuto.noLlenadoras}
            </div>
          ) : (
            <div className="home-scroll-wrapper">
              {/* Llenadoras simples agrupadas de 3 en 3 */}
              {Array.from({ length: Math.ceil(datosLlenadora.length / 3) }).map(
                (_, rowIdx) => {
                  const group = datosLlenadora.slice(
                    rowIdx * 3,
                    rowIdx * 3 + 3
                  );
                  return (
                    <div key={`row-simple-${rowIdx}`} className="home-row">
                      {group.map((llenadora, idx) => (
                        <div key={idx} className="grid-cell">
                          <LlenadoraAuto data={llenadora} />
                        </div>
                      ))}
                    </div>
                  );
                }
              )}

              {/* Llenadoras triples, una por fila */}
              {datosLlenadoraTriple.map((llenadora, idx) => (
                <div key={`row-triple-${idx}`} className="home-row">
                  <div className="grid-cell-triple">
                    <LlenadoraTriple data={llenadora} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

export default LlenadorasAuto;
