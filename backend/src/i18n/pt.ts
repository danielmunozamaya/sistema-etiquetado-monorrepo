export const pt = {
  common: {},
  errors: {
    asociacionYaExiste: (idCabezal: string, idLlenadora: string) =>
      `Já existe uma associação de produto criada para o cabeçote ${idCabezal} da enchedora ${idLlenadora}`,
    cabezalNoExiste: (idCabezal: string, idLlenadora: string) =>
      `Não existe o cabeçote ${idCabezal} para a enchedora ${idLlenadora}`,
    eanNoAsociadoProducto: (codigoEan: string, idProduto: string) =>
      `O EAN ${codigoEan} não está associado ao produto ${idProduto}`,
    productoSinEan: () => `Não é possível associar um produto sem código EAN`,
    eanSinProducto: () =>
      `Não é possível associar um código EAN sem um produto`,
    rutaEtiquetaNoOk: (ruta: string) =>
      `Erro ao associar a produção: o diretório ${ruta} não é um caminho de etiqueta válido`,
    asociacionNoEncontrada: (term: string) =>
      `Associação ${term} não encontrada`,
    actualizarSoloIdProducto: () =>
      `Não é possível atualizar uma associação apenas com o id_produto sem informar o código_ean`,
    eanNoPerteneceProducto: (codigoEan: string, idProduto: string) =>
      `O EAN ${codigoEan} não pertence ao produto ${idProduto}`,
    bartenderConfigYaExiste: () => 'Já existe uma configuração do Bartender',
    bartenderConfigNoExiste: () => 'Não existe configuração do Bartender',
    bartenderConfigNoExisteParaActualizar: () =>
      'Não existe configuração para atualizar',
    llenadoraNoExiste: (idLlenadora: string) =>
      `Não existe uma enchedora com id ${idLlenadora}`,
    cabezalYaExiste: (idCabezal: string, nomeCabezal: string) =>
      `Já existe um cabeçote com id ${idCabezal} para esta enchedora ou com nome ${nomeCabezal}`,
    cabezalNoEncontrado: (term: string) => `Cabeçote ${term} não encontrado`,
    ean_productoNoExiste: (idProduto: string) =>
      `Não existe o produto ${idProduto} na base de dados`,
    ean_presentacionNoExiste: (idPresentacion: string) =>
      `Não existe a apresentação ${idPresentacion} na base de dados`,
    ean_yaExiste: (codigoEan: string, idPresentacion: string) =>
      `Já existe um EAN com código ${codigoEan} ou associado à apresentação ${idPresentacion}`,
    ean_noEncontrado: (term: string) => `Código EAN ${term} não encontrado`,
    ean_noSePuedeEliminarAsociadoLlenadora: (
      codigoEan: string,
      nomeLlenadora: string
    ) =>
      `Não é possível eliminar o EAN ${codigoEan} porque está associado à ${nomeLlenadora}`,
    ean_noSePuedeEliminarAsociado: (codigoEan: string) =>
      `Não é possível eliminar o EAN ${codigoEan} porque está associado a uma enchedora`,
    llenadora_yaExiste: () => 'Já existe uma enchedora com esse nome ou id.',
    llenadora_cabezalesCantidadIncorrecta: () =>
      'Cabeçotes deve ser um array composto por 2 ou 3 objetos do tipo Cabeçote',
    llenadora_idYaExiste: (id: string) =>
      `Já existe uma enchedora com id ${id} na base de dados`,
    llenadora_nombreYaExiste: (nome: string) =>
      `Já existe uma enchedora com nome ${nome} na base de dados`,
    llenadora_idCabezalNoCoincide: () =>
      'O id_enchedora do Cabeçote e o id_enchedora da Enchedora devem coincidir',
    llenadora_cabezalYaExiste: (idCabezal: string, idLlenadora: string) =>
      `Já existe um cabeçote ${idCabezal} na enchedora ${idLlenadora}`,
    llenadora_nombreCabezalYaExiste: (nomeCabezal: string) =>
      `Já existe um cabeçote ${nomeCabezal}`,
    llenadora_rutaCabezalYaExiste: (ruta: string) =>
      `Já existe um cabeçote com caminho de impressão ${ruta}`,
    llenadora_asociacionYaExiste: (idLlenadora: string, idCabezal: string) =>
      `Já existe uma associação para a enchedora ${idLlenadora} e cabeçote ${idCabezal}`,
    llenadora_noEncontrada: (term: string) =>
      `Enchedora ${term} não encontrada`,
    llenadora_nombreYaEnUso: (nome: string) =>
      `A enchedora que está tentando atualizar já tem ${nome} como nome`,
    llenadora_yaEliminada: (id: string) => `A enchedora ${id} já foi eliminada`,
    llenadora_noSePuedeEliminarAuto: (id: string) =>
      `A enchedora ${id} é automática. Enchedoras automáticas não podem ser eliminadas`,
    motivoBaja_yaExiste: (codigo: string, nome: string) =>
      `Já existe um motivo de baixa com código ${codigo} ou nome ${nome}`,
    motivoBaja_noEncontrado: (term: string) =>
      `Motivo de baixa ${term} não encontrado`,
    numeroBidon_llenadoraNoEncontrada: (idLlenadora: string) =>
      `Enchedora ${idLlenadora} não encontrada ou enchedora sem cabeçotes`,
    numeroBidon_registrosBloqueados: () =>
      'Os registros continuam bloqueados após várias tentativas. Tente novamente.',
    numeroBidon_noEncontrado: () =>
      'Não foi encontrado o registro de Número de Bidão com os dados fornecidos',
    peso_yaExiste: (idCabezal: string, idLlenadora: string) =>
      `Já existe um registro de peso na base de dados para o cabeçote ${idCabezal} da enchedora ${idLlenadora}`,
    peso_noEncontrado: () =>
      'Não foi encontrado nenhum peso com os dados fornecidos',
    presentacion_yaExiste: (idPresentacion: string) =>
      `Já existe uma apresentação com id ${idPresentacion}`,
    presentacion_noEncontrada: (term: string) =>
      `Apresentação ${term} não encontrada`,
    presentacion_noSePuedeEliminarAsociadaLlenadora: (
      nomePresentacion: string,
      nomeLlenadora: string
    ) =>
      `Não é possível eliminar a apresentação ${nomePresentacion} porque está associada à ${nomeLlenadora}`,
    presentacion_noSePuedeEliminarAsociada: (nomePresentacion: string) =>
      `Não é possível eliminar a apresentação ${nomePresentacion} porque está associada a uma enchedora`,
    produccion_cabezalNoPerteneceLlenadora: (
      idCabezal: string,
      idLlenadora: string
    ) => `O cabeçote ${idCabezal} não pertence à enchedora ${idLlenadora}`,
    produccion_tituloValorAdicional: () =>
      'Cada título adicional deve vir acompanhado de seu valor correspondente, e vice-versa',
    produccion_asociacionDatosIncompletos: () =>
      'O produto, o caminho da etiqueta e o código EAN devem estar corretamente atribuídos ao cabeçote antes de criar um registro de produção',
    produccion_rutaEtiquetaNoAsignada: () =>
      'O caminho da etiqueta deve estar corretamente atribuído ao cabeçote antes de criar um registro de produção',
    produccion_noEncontrada: (id: string) =>
      `Produção com ID ${id} não encontrada`,
    produccion_motivoBajaNoEncontrado: (codigo: string) =>
      `Motivo de baixa ${codigo} não encontrado`,
    produccion_fechaInicialPosteriorFinal: () =>
      'A data inicial não pode ser posterior à final',
    produccion_horaInicialPosteriorFinal: () =>
      'A hora inicial não pode ser posterior à final',
    producto_yaExiste: (idProduto: string, nomeProduto: string) =>
      `Já existe um produto com o id ${idProduto} ou com o nome ${nomeProduto}`,
    producto_noEncontrado: (term: string) => `Produto ${term} não encontrado`,
    producto_noSePuedeEliminarAsociadoLlenadora: (
      nomeProduto: string,
      nomeLlenadora: string
    ) =>
      `Não é possível eliminar o produto ${nomeProduto} porque está associado à ${nomeLlenadora}`,
    producto_noSePuedeEliminarAsociado: (nomeProduto: string) =>
      `Não é possível eliminar o produto ${nomeProduto} porque está associado a uma enchedora`,
    rol_yaExiste: (rol: string) => `O papel '${rol}' já existe.`,
    rol_noEncontrado: (term: string) => `Papel ${term} não encontrado`,
    usuario_yaExiste: (nome: string) => `Já existe um usuário com nome ${nome}`,
    usuario_rolNoExiste: (rol: string) => `O papel '${rol}' não existe`,
    usuario_noEncontrado: (term: string) => `Usuário ${term} não encontrado`,
    usuario_bdNoProvisionada: () => 'Base de dados não provisionada',
    usuario_credencialesIncorrectas: () => 'Credenciais incorretas',
  },
} as const;
