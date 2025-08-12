export type WsCustomEvent =
  | {
      type: ServiceType.ASIGNACION;
      payload: { method: AsignacionServiceMethod };
    }
  | { type: ServiceType.EANS; payload: { method: EansServiceMethod } }
  | { type: ServiceType.HOME; payload: { method: HomeServiceMethod } }
  | {
      type: ServiceType.LLENADORAS;
      payload: { method: LlenadoraserviceMethod };
    }
  | {
      type: ServiceType.MODAL_LIMITES;
      payload: { method: ModalLimitesServiceMethod };
    }
  | {
      type: ServiceType.PRESENTACIONES;
      payload: { method: PresentacionesServiceMethod };
    }
  | {
      type: ServiceType.PRODUCCION;
      payload: { method: ProduccionServiceMethod };
    }
  | {
      type: ServiceType.PRODUCTOS;
      payload: { method: ProductosServiceMethod };
    };

export enum ServiceType {
  ASIGNACION = 'asignacion.service.js',
  EANS = 'eans.service.js',
  HOME = 'home.service.js',
  LLENADORAS = 'llenadoras.service.js',
  MODAL_LIMITES = 'modalLimites.service.js',
  PRESENTACIONES = 'presentaciones.service.js',
  PRODUCCION = 'produccion.service.js',
  PRODUCTOS = 'productos.service.js',
}

export enum AsignacionServiceMethod {
  FETCH_LLENADORAS = 'fetchLlenadoras',
  FETCH_CABEZALES = 'fetchCabezales',
  FETCH_FAMILIAS = 'fetchFamilias',
  FETCH_PRODUCTOS = 'fetchProductos',
  FETCH_EANS = 'fetchEans',
  FETCH_RUTAS = 'fetchRutas',
  FETCH_ASOCIACIONES_PRODUCCION = 'fetchAsociacionesProduccion',
}

export enum EansServiceMethod {
  QUERY_EANS = 'queryEans',
}

export enum HomeServiceMethod {
  GET_ASOCIACIONES = 'getAsociaciones',
  GET_NUMERO_BIDON = 'getNumeroBidon',
  GET_PESOS = 'getPesos',
}

export enum LlenadoraserviceMethod {
  GET_LLENADORAS = 'getLlenadoras',
}

export enum ModalLimitesServiceMethod {
  FETCH_ASOCIACIONES_PRODUCCION = 'fetchAsociacionesProduccion',
}

export enum PresentacionesServiceMethod {
  QUERY_PRESENTACIONES = 'queryPresentaciones',
}

export enum ProduccionServiceMethod {
  FILTER_PRODUCCION = 'filtrarProduccion',
  FETCH_LLENADORAS = 'fetchLlenadoras',
  FETCH_MOTIVO_BAJAS = 'fetchMotivoBajas',
  UPDATE_PRODUCCION = 'actualizarProduccion',
}

export enum ProductosServiceMethod {
  QUERY_PRODUCTOS = 'queryProductos',
  FETCH_FAMILIAS = 'fetchFamilias',
}
