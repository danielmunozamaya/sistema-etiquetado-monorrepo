export interface Cabezal {
  id_cabezal: string;
  nombre_cabezal: string;
  peso: number;
  numero_bidon: number;
  comunicacion: number | boolean;
  producto: string;
  presentacion: string;
  codigo_ean: string;
}

export interface Llenadora {
  nombre_llenadora: string;
  id_llenadora: string;
  cabezales: Cabezal[];
}
