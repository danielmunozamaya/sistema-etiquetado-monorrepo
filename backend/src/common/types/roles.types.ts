export type LlenadorasPermitidas =
  | 'TODAS'
  | `TODAS_MENOS:${string}` // ejemplo: "TODAS_MENOS:01,02"
  | 'NINGUNA'
  | `NINGUNA_MENOS:${string}`; // ejemplo: "NINGUNA_MENOS:01,02"

export enum LlenadorasPermitidasCabecera {
  TODAS = 'TODAS',
  TODAS_MENOS = 'TODAS_MENOS:',
  NINGUNA = 'NINGUNA',
  NINGUNA_MENOS = 'NINGUNA_MENOS:',
}
