import { useEffect } from "react";

const ETIQUETA_WIDTH_PX = 1280;
const ETIQUETA_HEIGHT_PX = 720;

const baseFontSize = 18;
const barsFontSize = 17;
const PRODUCT_OFFSET_FONT_SIZE = Math.ceil(baseFontSize * 0.057);
const NO_LOTE_OFFSET_FONT_SIZE = Math.ceil(baseFontSize * 0.5);
const NO_MATRICULA_OFFSET_FONT_SIZE = Math.ceil(baseFontSize * 0.74);
const DATES_OFFSET_FONT_SIZE = Math.ceil(baseFontSize * 0.25);
const ROW_11_OFFSET_FONT_SIZE = Math.ceil(baseFontSize * 0.15);
const BARS_NUMBER_OFFSET_FONT_SIZE = Math.ceil(barsFontSize * 0.057);

const Y_OFFSET = 140;
const DEFAULT_KEY_VALUE_Y_OFFSET = 28;
const DEFAULT_Y_OFFSET_BETWEEN_FIELDS = 32;
const Y_OFFSET_ROW_1 = Y_OFFSET;
const Y_OFFSET_ROW_2 = Y_OFFSET_ROW_1 + DEFAULT_KEY_VALUE_Y_OFFSET;
const Y_OFFSET_ROW_3 = Y_OFFSET_ROW_2 + DEFAULT_Y_OFFSET_BETWEEN_FIELDS;
const Y_OFFSET_ROW_4 = Y_OFFSET_ROW_3 + DEFAULT_KEY_VALUE_Y_OFFSET;
const Y_OFFSET_ROW_5 = Y_OFFSET_ROW_4 + DEFAULT_Y_OFFSET_BETWEEN_FIELDS;
const Y_OFFSET_ROW_6 = Y_OFFSET_ROW_5 + 42;
const Y_OFFSET_ROW_7 = Y_OFFSET_ROW_6 + 37;
const Y_OFFSET_ROW_8 = Y_OFFSET_ROW_7 + 35;
const Y_OFFSET_ROW_9 = Y_OFFSET_ROW_8 + 30;
const Y_OFFSET_ROW_10 = Y_OFFSET_ROW_9 + DEFAULT_Y_OFFSET_BETWEEN_FIELDS;
const Y_OFFSET_ROW_11 = Y_OFFSET_ROW_10 + 22;
const Y_OFFSET_ROW_12 = Y_OFFSET_ROW_11 + 122;
const Y_OFFSET_ROW_13 = Y_OFFSET_ROW_12 + 16;

const X_OFFSET = 0;
const X_OFFSET_ROW_1 = X_OFFSET;
const X_OFFSET_ROW_1_COL_1 = X_OFFSET_ROW_1;
const X_OFFSET_ROW_1_COL_2 = X_OFFSET_ROW_1_COL_1 + 145;
const X_OFFSET_ROW_1_COL_3 = X_OFFSET_ROW_1_COL_2 + 105;
const X_OFFSET_ROW_1_COL_4 = X_OFFSET_ROW_1_COL_3 + 105;
const X_OFFSET_ROW_2_COL_1 = X_OFFSET_ROW_1_COL_1;
const X_OFFSET_ROW_2_COL_2 = X_OFFSET_ROW_1_COL_2;
const X_OFFSET_ROW_2_COL_3 = X_OFFSET_ROW_1_COL_3;
const X_OFFSET_ROW_2_COL_4 = X_OFFSET_ROW_1_COL_4;
const X_OFFSET_ROW_3 = X_OFFSET;
const X_OFFSET_ROW_4 = X_OFFSET;
const X_OFFSET_ROW_5 = X_OFFSET;
const X_OFFSET_ROW_6 = X_OFFSET;
const X_OFFSET_ROW_7 = X_OFFSET;
const X_OFFSET_ROW_8 = X_OFFSET;
const X_OFFSET_ROW_8_COL_1 = X_OFFSET_ROW_8;
const X_OFFSET_ROW_8_COL_2 = X_OFFSET_ROW_8_COL_1 + 265;
const X_OFFSET_ROW_9_COL_1 = X_OFFSET_ROW_8_COL_1;
const X_OFFSET_ROW_9_COL_2 = X_OFFSET_ROW_8_COL_2;
const X_OFFSET_ROW_10 = X_OFFSET;
const X_OFFSET_ROW_10_COL_1 = X_OFFSET_ROW_10;
const X_OFFSET_ROW_10_COL_2 = X_OFFSET_ROW_10_COL_1 + 110;
const X_OFFSET_ROW_10_COL_3 = X_OFFSET_ROW_10_COL_2 + 170;
const X_OFFSET_ROW_11_COL_1 = X_OFFSET_ROW_10_COL_1;
const X_OFFSET_ROW_11_COL_2 = X_OFFSET_ROW_10_COL_2;
const X_OFFSET_ROW_11_COL_3 = X_OFFSET_ROW_10_COL_3;
const X_OFFSET_ROW_12 = X_OFFSET;
const X_OFFSET_ROW_13 = X_OFFSET;

const NO_LOTE_X_OFFSET = 180;
const NO_LOTE_Y_OFFSET = 12;

const NO_MATRICULA_X_OFFSET = 30;

const GROSS_WEIGHT_X_OFFSET = 65;
const NET_WEIGHT_X_OFFSET = 65;

const loadCustomFont = async () => {
  const font = new FontFace(
    "IDAutomationC128XXL",
    "url(/fonts/IDAutomationC128XXL.ttf)"
  );
  await font.load();
  document.fonts.add(font);
};

export interface EtiquetaData {
  ID_LLENADORA?: string;
  CODE?: string;
  HORA_PRODUCCION?: string;
  ID_CABEZAL?: string;
  PRODUCTO?: string;
  NO_LOTE?: string;
  NO_MATRICULA?: string;
  FECHA_PRODUCCION?: string;
  FECHA_CADUCIDAD?: string;
  CODIGO_EAN?: string;
  PESO_BRUTO_ETIQUETA?: string;
  PESO_NETO_ETIQUETA?: string;
  JEJE?: string;
  [key: string]: any;
}

interface EtiquetaCanvasProps {
  data?: EtiquetaData[];
  onFinish?: () => void;
}

const EtiquetaCanvas: React.FC<EtiquetaCanvasProps> = ({
  data = [],
  onFinish,
}) => {
  useEffect(() => {
    const generarEtiquetas = async () => {
      await loadCustomFont();

      const dataUrls = await Promise.all(
        data.map(async (etiqueta) => {
          const canvas = document.createElement("canvas");
          const scale = 2;
          canvas.width = ETIQUETA_WIDTH_PX * scale;
          canvas.height = ETIQUETA_HEIGHT_PX * scale;

          canvas.style.width = `${ETIQUETA_WIDTH_PX}px`;
          canvas.style.height = `${ETIQUETA_HEIGHT_PX}px`;
          const ctx = canvas.getContext("2d");
          if (!ctx) return "";

          ctx.scale(scale, scale);

          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#000000";

          ctx.font = `bold ${String(baseFontSize)}px Arial`;
          ctx.fillText("FILLER:", X_OFFSET_ROW_1_COL_1, Y_OFFSET_ROW_1);
          ctx.fillText("CODE:", X_OFFSET_ROW_1_COL_2, Y_OFFSET_ROW_1);
          ctx.fillText("HOUR:", X_OFFSET_ROW_1_COL_3, Y_OFFSET_ROW_1);
          ctx.fillText("HEAD:", X_OFFSET_ROW_1_COL_4, Y_OFFSET_ROW_1);

          ctx.font = `bold ${String(baseFontSize)}px Arial`;
          ctx.fillText(
            etiqueta.ID_LLENADORA || "",
            X_OFFSET_ROW_2_COL_1,
            Y_OFFSET_ROW_2
          );
          ctx.fillText(
            etiqueta.CODE || "",
            X_OFFSET_ROW_2_COL_2,
            Y_OFFSET_ROW_2
          );
          ctx.fillText(
            etiqueta.HORA_PRODUCCION || "",
            X_OFFSET_ROW_2_COL_3,
            Y_OFFSET_ROW_2
          );
          ctx.fillText(
            etiqueta.ID_CABEZAL || "",
            X_OFFSET_ROW_2_COL_4,
            Y_OFFSET_ROW_2
          );

          ctx.font = `bold ${String(baseFontSize)}px Arial`;
          ctx.fillText("PRODUCT:", X_OFFSET_ROW_3, Y_OFFSET_ROW_3);
          ctx.font = `bold ${String(
            baseFontSize + PRODUCT_OFFSET_FONT_SIZE
          )}px Arial`;
          ctx.fillText(etiqueta.PRODUCTO || "", X_OFFSET_ROW_4, Y_OFFSET_ROW_4);

          ctx.font = `bold ${String(baseFontSize)}px Arial`;
          ctx.fillText("LOT Nº / BATCH Nº", X_OFFSET_ROW_5, Y_OFFSET_ROW_5);
          ctx.fillText("PACKAGING UNIT Nº", X_OFFSET_ROW_6, Y_OFFSET_ROW_6);

          ctx.font = `bold ${String(
            baseFontSize + NO_LOTE_OFFSET_FONT_SIZE
          )}px Arial`;
          ctx.fillText(
            etiqueta.NO_LOTE || "",
            X_OFFSET_ROW_5 + NO_LOTE_X_OFFSET,
            Y_OFFSET_ROW_5 + NO_LOTE_Y_OFFSET
          );
          ctx.font = `bold ${String(
            baseFontSize + NO_MATRICULA_OFFSET_FONT_SIZE
          )}px Arial`;
          ctx.fillText(
            etiqueta.NO_MATRICULA || "",
            X_OFFSET_ROW_7 + NO_MATRICULA_X_OFFSET,
            Y_OFFSET_ROW_7
          );

          ctx.font = `bold ${String(baseFontSize)}px Arial`;
          ctx.fillText(
            "PRODUCTION DATE:",
            X_OFFSET_ROW_8_COL_1,
            Y_OFFSET_ROW_8
          );
          ctx.fillText("BEST BEFORE:", X_OFFSET_ROW_8_COL_2, Y_OFFSET_ROW_8);
          ctx.font = `bold ${String(
            baseFontSize + DATES_OFFSET_FONT_SIZE
          )}px Arial`;
          ctx.fillText(
            (etiqueta.FECHA_PRODUCCION || "29/07/2024")
              .split("-")
              .reverse()
              .join("/"),
            X_OFFSET_ROW_9_COL_1,
            Y_OFFSET_ROW_9
          );
          ctx.fillText(
            (etiqueta.FECHA_CADUCIDAD || "29/07/2025")
              .split("-")
              .reverse()
              .join("/"),
            X_OFFSET_ROW_9_COL_2,
            Y_OFFSET_ROW_9
          );

          ctx.font = `bold ${String(baseFontSize)}px Arial`;
          ctx.fillText("EAN Nº:", X_OFFSET_ROW_10_COL_1, Y_OFFSET_ROW_10);
          ctx.fillText("GROSS WEIGHT:", X_OFFSET_ROW_10_COL_2, Y_OFFSET_ROW_10);
          ctx.fillText(
            "NET WEIGHT(KG):",
            X_OFFSET_ROW_10_COL_3,
            Y_OFFSET_ROW_10
          );

          ctx.font = `bold ${String(
            baseFontSize - ROW_11_OFFSET_FONT_SIZE
          )}px Arial`;
          ctx.fillText(
            etiqueta.CODIGO_EAN || "",
            X_OFFSET_ROW_11_COL_1,
            Y_OFFSET_ROW_11
          );
          ctx.fillText(
            etiqueta.PESO_BRUTO_ETIQUETA || "",
            X_OFFSET_ROW_11_COL_2 + GROSS_WEIGHT_X_OFFSET,
            Y_OFFSET_ROW_11
          );
          ctx.fillText(
            etiqueta.PESO_NETO_ETIQUETA || "",
            X_OFFSET_ROW_11_COL_3 + NET_WEIGHT_X_OFFSET,
            Y_OFFSET_ROW_11
          );

          ctx.font = `${String(barsFontSize)}px IDAutomationC128XXL`;
          ctx.fillText(
            etiqueta.JEJE || `84246840037512250729137521000795047885`,
            X_OFFSET_ROW_12,
            Y_OFFSET_ROW_12
          );
          ctx.font = `bold ${String(
            barsFontSize - BARS_NUMBER_OFFSET_FONT_SIZE
          )}px Arial`;
          ctx.fillText(
            etiqueta.JEJE ||
              `(01)84246840037512(15)250729(10)137521000795047885`,
            X_OFFSET_ROW_13,
            Y_OFFSET_ROW_13
          );

          return canvas.toDataURL("image/png");
        })
      );

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Etiquetas</title>
            <style>
              body {
                margin: 0;
                padding: 0;
              }
              img {
                display: block;
                margin: 0 auto 20px auto;
                width: ${ETIQUETA_WIDTH_PX}px;
                height: auto;
                page-break-after: always;
              }
            </style>
          </head>
          <body>
            ${dataUrls.map((url) => `<img src="${url}" />`).join("")}
            <script>
              window.onload = () => {
                window.print();
                window.onafterprint = () => window.close();
              };
            </script>
          </body>
        </html>
      `;

      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      if (onFinish) onFinish();
    };

    if (Array.isArray(data) && data.length > 0) {
      generarEtiquetas();
    }
  }, [data, onFinish]);

  return null;
};

export default EtiquetaCanvas;
