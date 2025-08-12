// import "./LlenadorasSemiauto.css";
import "../LlenadorasAuto/LlenadorasAuto.css";
import LlenadoraCustom from "../../components/LlenadoraCustom/LlenadoraCustom";
import { useEffect, useState, useRef } from "react";
import { getAsociaciones } from "./services/LlenadorasSemiauto";
import Spinner from "../../components/Spinner/Spinner";
import { useFailoverSocket } from "../../common/hooks/useFailoverSocket";

function LlenadorasSemiauto() {
  const [datosLlenadora, setDatosLlenadora] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const startLoadingTime = useRef(new Date());
  const datosRef = useRef([]);

  const cargarAsociaciones = async () => {
    try {
      const asociaciones = await getAsociaciones();

      const llenadorasMap = new Map();

      asociaciones.forEach((a) => {
        const nombre = a.llenadora?.nombre_llenadora;
        if (!nombre) return;

        if (!llenadorasMap.has(nombre)) {
          llenadorasMap.set(nombre, {
            nombre_llenadora: nombre,
            id_llenadora: a.id_llenadora,
            comunicacion: true,
            cabezales: [],
          });
        }

        const cabezal = {
          id_cabezal: a.id_cabezal_llenadora ?? "",
          nombre_cabezal: a.cabezal?.nombre_cabezal ?? "",
          peso: a.cabezal?.peso?.peso_plc ?? null,
          numero_bidon: a.cabezal?.numero_bidon?.numero_bidon ?? null,
          producto: a.producto?.nombre_producto ?? "",
          presentacion: a.ean?.presentacion?.nombre_presentacion ?? "",
          codigo_ean: a.codigo_ean ?? "",
        };

        llenadorasMap.get(nombre).cabezales.push(cabezal);
      });

      const nuevasDatos = Array.from(llenadorasMap.values());

      setDatosLlenadora(nuevasDatos);
      datosRef.current = nuevasDatos;

      const elapsed = new Date() - startLoadingTime.current;
      const remaining = 600 - elapsed;
      if (remaining > 0) {
        setTimeout(() => setIsLoading(false), remaining);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error al cargar asociaciones:", error);
    }
  };

  useEffect(() => {
    startLoadingTime.current = new Date();

    cargarAsociaciones();
  }, []);

  useFailoverSocket("home.service.js", {
    getAsociaciones: () => cargarAsociaciones(),
  });

  return (
    <>
      {isLoading && <Spinner />}

      {!isLoading && (
        <>
          {datosLlenadora.length === 0 ? (
            <div className="mensaje-sin-llenadoras">
              {i18n.llenadorasSemiauto.noLlenadoras}
            </div>
          ) : (
            <div className="home-scroll-wrapper">
              {Array.from({ length: Math.ceil(datosLlenadora.length / 3) }).map(
                (_, rowIdx) => {
                  const grupo = datosLlenadora.slice(
                    rowIdx * 3,
                    rowIdx * 3 + 3
                  );
                  return (
                    <div key={`row-manual-${rowIdx}`} className="home-row">
                      {grupo.map((llenadora, index) => (
                        <div className="grid-cell" key={index}>
                          <LlenadoraCustom
                            nombre_llenadora={llenadora.nombre_llenadora}
                            id_llenadora={llenadora.id_llenadora}
                            cabezales={llenadora.cabezales}
                            title_class_name={"C-LC1-row-1-ETSEM-style"}
                            tipo_etiqueta={2}
                          />
                        </div>
                      ))}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}

export default LlenadorasSemiauto;
