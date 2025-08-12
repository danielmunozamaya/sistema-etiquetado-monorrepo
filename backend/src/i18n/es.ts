export const es = {
  common: {},
  errors: {
    asociacionYaExiste: (idCabezal: string, idLlenadora: string) =>
      `Ya existe una asociación de producto creada para el cabezal ${idCabezal} de la llenadora ${idLlenadora}`,
    cabezalNoExiste: (idCabezal: string, idLlenadora: string) =>
      `No existe el cabezal ${idCabezal} para la llenadora ${idLlenadora}`,
    eanNoAsociadoProducto: (codigoEan: string, idProducto: string) =>
      `El EAN ${codigoEan} no está asociado al producto ${idProducto}`,
    productoSinEan: () => `No se puede asociar un producto sin código EAN`,
    eanSinProducto: () => `No se puede asociar un código EAN sin un producto`,
    rutaEtiquetaNoOk: (ruta: string) =>
      `Error al asociar la producción: la ruta ${ruta} no es una ruta de etiqueta válida`,
    asociacionNoEncontrada: (term: string) =>
      `Asociación ${term} no encontrada`,
    actualizarSoloIdProducto: () =>
      `No se puede actualizar una Asociación sólo con el id_producto sin conocer el código_ean`,
    eanNoPerteneceProducto: (codigoEan: string, idProducto: string) =>
      `El EAN ${codigoEan} no pertenece al producto ${idProducto}`,
    bartenderConfigYaExiste: () => 'Ya existe una configuración de Bartender',
    bartenderConfigNoExiste: () => 'No existe configuración de Bartender',
    bartenderConfigNoExisteParaActualizar: () =>
      'No existe configuración para actualizar',
    llenadoraNoExiste: (idLlenadora: string) =>
      `No existe una llenadora con id ${idLlenadora}`,
    cabezalYaExiste: (idCabezal: string, nombreCabezal: string) =>
      `Ya existe un cabezal con id ${idCabezal} para esta llenadora o con nombre ${nombreCabezal}`,
    cabezalNoEncontrado: (term: string) => `Cabezal ${term} no encontrado`,
    ean_productoNoExiste: (idProducto: string) =>
      `No existe el producto ${idProducto} en base de datos`,
    ean_presentacionNoExiste: (idPresentacion: string) =>
      `No existe la presentación ${idPresentacion} en base de datos`,
    ean_yaExiste: (codigoEan: string, idPresentacion: string) =>
      `Ya existe un EAN con código ${codigoEan} o asociado a la presentación ${idPresentacion}`,
    ean_noEncontrado: (term: string) => `Código EAN ${term} no encontrado`,
    ean_noSePuedeEliminarAsociadoLlenadora: (
      codigoEan: string,
      nombreLlenadora: string
    ) =>
      `No se puede eliminar el EAN ${codigoEan} porque está asociado a ${nombreLlenadora}`,
    ean_noSePuedeEliminarAsociado: (codigoEan: string) =>
      `No se puede eliminar el EAN ${codigoEan} porque está asociado a una llenadora`,
    llenadora_yaExiste: () => 'Ya existe una llenadora con ese nombre o id.',
    llenadora_cabezalesCantidadIncorrecta: () =>
      'Cabezales debe ser un array compuesto de 2 o 3 objetos de tipo Cabezal',
    llenadora_idYaExiste: (id: string) =>
      `Ya existe una llenadora con id ${id} en base de datos`,
    llenadora_nombreYaExiste: (nombre: string) =>
      `Ya existe una llenadora con nombre ${nombre} en base de datos`,
    llenadora_idCabezalNoCoincide: () =>
      'El id_llenadora del Cabezal y el id_llenadora de la Llenadora deben coincidir',
    llenadora_cabezalYaExiste: (idCabezal: string, idLlenadora: string) =>
      `Ya existe un cabezal ${idCabezal} en llenadora ${idLlenadora}`,
    llenadora_nombreCabezalYaExiste: (nombreCabezal: string) =>
      `Ya existe un cabezal ${nombreCabezal}`,
    llenadora_rutaCabezalYaExiste: (ruta: string) =>
      `Ya existe un cabezal con ruta de impresión ${ruta}`,
    llenadora_asociacionYaExiste: (idLlenadora: string, idCabezal: string) =>
      `Ya existe una asociación para la llenadora ${idLlenadora} y cabezal ${idCabezal}`,
    llenadora_noEncontrada: (term: string) => `Llenadora ${term} no encontrada`,
    llenadora_nombreYaEnUso: (nombre: string) =>
      `La llenadora que intenta actualizar ya tiene ${nombre} por nombre`,
    llenadora_yaEliminada: (id: string) =>
      `La llenadora ${id} ya ha sido eliminada`,
    llenadora_noSePuedeEliminarAuto: (id: string) =>
      `La llenadora ${id} es una llenadora automática. Las llenadoras automáticas no pueden ser eliminadas`,
    motivoBaja_yaExiste: (codigo: string, nombre: string) =>
      `Ya existe un motivo de baja con código ${codigo} o nombre ${nombre}`,
    motivoBaja_noEncontrado: (term: string) =>
      `Motivo de baja ${term} no encontrado`,
    numeroBidon_llenadoraNoEncontrada: (idLlenadora: string) =>
      `Llenadora ${idLlenadora} no encontrada o llenadora sin cabezales`,
    numeroBidon_registrosBloqueados: () =>
      'Los registros siguen bloqueados tras varios intentos. Intente nuevamente.',
    numeroBidon_noEncontrado: () =>
      'No se encontró el registro de Número de Bidón con los datos proporcionados',
    peso_yaExiste: (idCabezal: string, idLlenadora: string) =>
      `Ya existe un registro de peso en base de datos para el cabezal ${idCabezal} de la llenadora ${idLlenadora}`,
    peso_noEncontrado: () =>
      'No se encontró ningún peso con los datos proporcionados',
    presentacion_yaExiste: (idPresentacion: string) =>
      `Ya existe una presentación con id ${idPresentacion}`,
    presentacion_noEncontrada: (term: string) =>
      `Presentación ${term} no encontrada`,
    presentacion_noSePuedeEliminarAsociadaLlenadora: (
      nombrePresentacion: string,
      nombreLlenadora: string
    ) =>
      `No se puede eliminar la presentación ${nombrePresentacion} porque está asociada a ${nombreLlenadora}`,
    presentacion_noSePuedeEliminarAsociada: (nombrePresentacion: string) =>
      `No se puede eliminar la presentación ${nombrePresentacion} porque está asociada a una llenadora`,
    produccion_cabezalNoPerteneceLlenadora: (
      idCabezal: string,
      idLlenadora: string
    ) => `El cabezal ${idCabezal} no pertenece a la llenadora ${idLlenadora}`,
    produccion_tituloValorAdicional: () =>
      'Cada título adicional debe venir acompañado de su valor correspondiente, y viceversa',
    produccion_asociacionDatosIncompletos: () =>
      'El producto, la Ruta de Etiqueta y el código EAN deben estar correctamente asignados al cabezal antes de poder crear un registro de producción',
    produccion_rutaEtiquetaNoAsignada: () =>
      'La Ruta de Etiqueta debe estar correctamente asignada al cabezal antes de poder crear un registro de producción',
    produccion_noEncontrada: (id: string) =>
      `Producción con ID ${id} no encontrada`,
    produccion_motivoBajaNoEncontrado: (codigo: string) =>
      `Motivo de baja ${codigo} no encontrado`,
    produccion_fechaInicialPosteriorFinal: () =>
      'La fecha inicial no puede ser posterior a la final',
    produccion_horaInicialPosteriorFinal: () =>
      'La hora inicial no puede ser posterior a la final',
    producto_yaExiste: (idProducto: string, nombreProducto: string) =>
      `Ya existe un producto con el id ${idProducto} o con el nombre ${nombreProducto}`,
    producto_noEncontrado: (term: string) => `Producto ${term} no encontrado`,
    producto_noSePuedeEliminarAsociadoLlenadora: (
      nombreProducto: string,
      nombreLlenadora: string
    ) =>
      `No se puede eliminar el producto ${nombreProducto} porque está asociado a ${nombreLlenadora}`,
    producto_noSePuedeEliminarAsociado: (nombreProducto: string) =>
      `No se puede eliminar el producto ${nombreProducto} porque está asociado a una llenadora`,
    rol_yaExiste: (rol: string) => `El rol '${rol}' ya existe.`,
    rol_noEncontrado: (term: string) => `Rol ${term} no encontrado`,
    usuario_yaExiste: (nombre: string) =>
      `Ya existe un usuario con nombre ${nombre}`,
    usuario_rolNoExiste: (rol: string) => `El rol '${rol}' no existe`,
    usuario_noEncontrado: (term: string) => `Usuario ${term} no encontrado`,
    usuario_bdNoProvisionada: () => 'Base de datos no provisionada',
    usuario_credencialesIncorrectas: () => 'Credenciales incorrectas',
  },
} as const;
