DECLARE @sql NVARCHAR(MAX) = N'';

SELECT @sql += 'ALTER TABLE [' + s.name + '].[' + t.name + '] DROP CONSTRAINT [' + fk.name + '];'
FROM sys.foreign_keys fk
INNER JOIN sys.tables t ON fk.parent_object_id = t.object_id
INNER JOIN sys.schemas s ON t.schema_id = s.schema_id;

EXEC sp_executesql @sql;

SET @sql = N'';

SELECT @sql += 'DROP TABLE [' + s.name + '].[' + t.name + '];'
FROM sys.tables t
INNER JOIN sys.schemas s ON t.schema_id = s.schema_id;

EXEC sp_executesql @sql;

CREATE TABLE [dbo].[llenadoras] (
    [id] uniqueidentifier DEFAULT (newsequentialid()),
    [id_llenadora] varchar(2) UNIQUE,
    [nombre_llenadora] varchar(50),
    [observaciones] text,
    [etiquetado_auto] bit DEFAULT ((0)),
    [visible] bit DEFAULT ((1)),
    PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[cabezales] (
    [id] uniqueidentifier DEFAULT (newsequentialid()),
    [id_llenadora] varchar(2),
    [id_cabezal] varchar(1),
    [nombre_cabezal] varchar(50),
    [ruta_impresion] varchar(15),
    [visible] bit DEFAULT ((1)),
    CONSTRAINT [FK_a41ae2cff9249f157c1cd868920] FOREIGN KEY ([id_llenadora]) REFERENCES [dbo].[llenadoras]([id_llenadora]),
    PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[productos] (
    [id] uniqueidentifier DEFAULT (newsequentialid()),
    [id_producto] varchar(15) UNIQUE,
    [nombre_producto] varchar(200),
    [familia_producto] varchar(200),
    [visible] bit DEFAULT ((1)),
    PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[presentaciones] (
    [id] uniqueidentifier DEFAULT (newsequentialid()),
    [id_presentacion] varchar(15) UNIQUE,
    [nombre_presentacion] varchar(200),
    [peso_neto] decimal(7,2),
    [peso_bruto] decimal(7,2),
    [visible] bit DEFAULT ((1)),
    PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[ean] (
    [id] uniqueidentifier DEFAULT (newsequentialid()),
    [codigo_ean] varchar(30) UNIQUE,
    [id_producto] varchar(15),
    [id_presentacion] varchar(15),
    [dias_best_before] numeric(5,0),
    [visible] bit DEFAULT ((1)),
    CONSTRAINT [FK_494e18914dd199b1d63460bf878] FOREIGN KEY ([id_producto]) REFERENCES [dbo].[productos]([id_producto]),
    CONSTRAINT [FK_4b46790d6c81a059771525b87a3] FOREIGN KEY ([id_presentacion]) REFERENCES [dbo].[presentaciones]([id_presentacion]),
    PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[asociacion_produccion] (
    [id] uniqueidentifier DEFAULT (newsequentialid()),
    [id_llenadora] varchar(2),
    [id_cabezal_llenadora] varchar(1),
    [uuid_cabezal] uniqueidentifier,
    [familia_producto] varchar(30),
    [id_producto] varchar(15),
    [codigo_ean] varchar(30),
    [limite_llenado] numeric(3,0) DEFAULT ((3)),
    [ruta_etiqueta] varchar(500),
    CONSTRAINT [FK_4ef04302f54813016d84a77ce58] FOREIGN KEY ([id_llenadora]) REFERENCES [dbo].[llenadoras]([id_llenadora]),
    CONSTRAINT [FK_0ba03c9eec50aacdbddcfc88a19] FOREIGN KEY ([uuid_cabezal]) REFERENCES [dbo].[cabezales]([id]),
    CONSTRAINT [FK_fbae143e376a4146752f099cfe3] FOREIGN KEY ([id_producto]) REFERENCES [dbo].[productos]([id_producto]),
    CONSTRAINT [FK_fc9fbd0337aa8b2fdfceff19693] FOREIGN KEY ([codigo_ean]) REFERENCES [dbo].[ean]([codigo_ean]),
    PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[pesos] (
    [id_llenadora] varchar(2),
    [id_cabezal_llenadora] varchar(1),
    [peso_plc] decimal(9,2),
    [orden_impresion] numeric(1,0),
    [comunicacion] numeric(1,0) DEFAULT ((0)),
    [fecha_registro] datetime,
    [registro_produccion] uniqueidentifier,
    [id] uniqueidentifier DEFAULT (newsequentialid()),
    PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[bartender_config] (
    [id] uniqueidentifier DEFAULT (newsequentialid()),
    [protocolo_api] varchar(10),
    [host] varchar(100),
    [puerto] varchar(10),
    [ruta_api] varchar(150),
    [nombre_integracion] varchar(150),
    [comando] varchar(50),
    PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[motivo_bajas] (
    [id] uniqueidentifier DEFAULT (newsequentialid()),
    [codigo_baja] varchar(5),
    [nombre_baja] varchar(200),
    [descripcion_baja] text,
    [visible] bit DEFAULT ((1)),
    PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[roles] (
    [id] uniqueidentifier DEFAULT (newsequentialid()),
    [rol] varchar(30),
    [llenadoras_permitidas] varchar(100) NOT NULL DEFAULT 'NINGUNA',
    PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[usuarios] (
    [id] uniqueidentifier DEFAULT (newsequentialid()),
    [nombre] varchar(40),
    [password] varchar(100),
    [uuid_rol] uniqueidentifier,
    [visible] bit DEFAULT ((1)),
    CONSTRAINT [FK_df0cfc9970cdee82258e13fd8ee] FOREIGN KEY ([uuid_rol]) REFERENCES [dbo].[roles]([id]),
    PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[numero_bidon] (
    [id] uniqueidentifier DEFAULT (newsequentialid()),
    [id_llenadora] varchar(2),
    [id_cabezal_llenadora] varchar(1),
    [numero_bidon] numeric(10,0) DEFAULT ((1)),
    [anio] numeric(4,0),
    [registro_bloqueado] numeric(1,0) DEFAULT ((0)),
    PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[produccion] (
    [id] uniqueidentifier DEFAULT (newsequentialid()),
    [tipo_etiqueta] numeric(1,0),
    [no_bidon] numeric(10,0),
    [digito_control] numeric(1,0),
    [no_matricula] varchar(18),
    [no_lote] varchar(9),
    [sscc] text,
    [id_llenadora] varchar(2),
    [id_cabezal_llenadora] varchar(1),
    [uuid_cabezal] uniqueidentifier,
    [familia_producto] varchar(30),
    [id_producto] varchar(15),
    [codigo_ean] varchar(30),
    [fecha_produccion] date,
    [hora_produccion] time(7),
    [fecha_caducidad] date,
    [code] numeric(3,0),
    [peso_neto_real] decimal(9,2),
    [peso_neto_etiqueta] decimal(9,2),
    [peso_bruto_etiqueta] decimal(9,2),
    [titulo_1] varchar(100),
    [valor_1] varchar(200),
    [titulo_2] varchar(100),
    [valor_2] varchar(200),
    [estado] numeric(1,0) DEFAULT ((1)),
    [motivo_baja] uniqueidentifier,
    [baja_fecha] datetime,
    [baja_usuario] uniqueidentifier,
    [registrado] numeric(1,0) DEFAULT ((0)),
    [registrado_fecha] datetime,
    CONSTRAINT [FK_fd9822621038926aa2459b6a7c3] FOREIGN KEY ([id_llenadora]) REFERENCES [dbo].[llenadoras]([id_llenadora]),
    CONSTRAINT [FK_d73924324c7f4e7b6db9a91333b] FOREIGN KEY ([uuid_cabezal]) REFERENCES [dbo].[cabezales]([id]),
    CONSTRAINT [FK_f32f0f9cec42dc9d04fa9212e81] FOREIGN KEY ([id_producto]) REFERENCES [dbo].[productos]([id_producto]),
    CONSTRAINT [FK_dd02fab5e0662b16f0de9d0539f] FOREIGN KEY ([codigo_ean]) REFERENCES [dbo].[ean]([codigo_ean]),
    CONSTRAINT [FK_41719c83fa3ea2caddbbe0bf2d1] FOREIGN KEY ([motivo_baja]) REFERENCES [dbo].[motivo_bajas]([id]),
    CONSTRAINT [FK_e649d7f2be570f1996566110699] FOREIGN KEY ([baja_usuario]) REFERENCES [dbo].[usuarios]([id]),
    PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[sincronismo] (
    [id] uniqueidentifier DEFAULT (newsequentialid()),
    [operacion] varchar(10),
    [tabla] varchar(40),
    [registro] text,
    [fecha] datetime,
    [estado] varchar(15) DEFAULT ('pendiente'),
    [intentos] decimal(1,0) DEFAULT ((0)),
    PRIMARY KEY ([id])
);

INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('2c10443e-f36b-1410-8cd9-00af0c2de9b7','01','Llenadora Alfa',NULL,'1','1'),('3210443e-f36b-1410-8cd9-00af0c2de9b7','02','Llenadora Beta',NULL,'1','1'),('3810443e-f36b-1410-8cd9-00af0c2de9b7','03','Llenadora Gamma',NULL,'1','1'),('3e10443e-f36b-1410-8cd9-00af0c2de9b7','04','Llenadora Delta',NULL,'1','1'),('4410443e-f36b-1410-8cd9-00af0c2de9b7','05','Llenadora Épsilon',NULL,'1','1'),('4e10443e-f36b-1410-8cd9-00af0c2de9b7','06','Llenadora Zeta',NULL,'1','1'),('5810443e-f36b-1410-8cd9-00af0c2de9b7','07','Llenadora Doble-X',NULL,'0','1'),('6210443e-f36b-1410-8cd9-00af0c2de9b7','08','Llenadora Omega',NULL,'1','1'),('6c10443e-f36b-1410-8cd9-00af0c2de9b7','09','Llenadora Sigma',NULL,'0','1'),('7810443e-f36b-1410-8cd9-00af0c2de9b7','10','Llenadora Lambda',NULL,'0','1'),('8410443e-f36b-1410-8cd9-00af0c2de9b7','11','Llenadora Iota',NULL,'0','1'),('9010443e-f36b-1410-8cd9-00af0c2de9b7','12','Llenadora Rho',NULL,'0','1'),('9a10443e-f36b-1410-8cd9-00af0c2de9b7','13','Llenadora Tau',NULL,'0','1'),('a210443e-f36b-1410-8cd9-00af0c2de9b7','14','Llenadora Kappa',NULL,'0','1'),('aa10443e-f36b-1410-8cd9-00af0c2de9b7','15','Llenadora Uno',NULL,'0','1'),('b210443e-f36b-1410-8cd9-00af0c2de9b7','16','Llenadora Dos',NULL,'0','1'),('b810443e-f36b-1410-8cd9-00af0c2de9b7','17','Llenadora Tres',NULL,'0','1'),('bc10443e-f36b-1410-8cd9-00af0c2de9b7','18','Llenadora Cuatro',NULL,'0','1'),('c010443e-f36b-1410-8cd9-00af0c2de9b7','19','Llenadora Cinco',NULL,'0','1'),('c410443e-f36b-1410-8cd9-00af0c2de9b7','20','Llenadora Seis',NULL,'0','1');
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('cd10443e-f36b-1410-8cd9-00af0c2de9b7','01','A','Cabezal Alfa A','192.168.1.1','1'),('db10443e-f36b-1410-8cd9-00af0c2de9b7','01','B','Cabezal Alfa B','192.168.1.2','1'),('e410443e-f36b-1410-8cd9-00af0c2de9b7','02','A','Cabezal Beta A','192.168.1.3','1'),('e810443e-f36b-1410-8cd9-00af0c2de9b7','02','B','Cabezal Beta B','192.168.1.4','1'),('ec10443e-f36b-1410-8cd9-00af0c2de9b7','03','A','Cabezal Gamma A','192.168.1.5','1'),('f010443e-f36b-1410-8cd9-00af0c2de9b7','03','B','Cabezal Gamma B','192.168.1.6','1'),('f610443e-f36b-1410-8cd9-00af0c2de9b7','03','C','Cabezal Gamma C','192.168.1.65','1'),('fe10443e-f36b-1410-8cd9-00af0c2de9b7','04','A','Cabezal Delta A','192.168.1.7','1'),('0611443e-f36b-1410-8cd9-00af0c2de9b7','04','B','Cabezal Delta B','192.168.1.8','1'),('0e11443e-f36b-1410-8cd9-00af0c2de9b7','05','A','Cabezal Épsilon A','192.168.1.9','1'),('1511443e-f36b-1410-8cd9-00af0c2de9b7','05','B','Cabezal Épsilon B','192.168.1.10','1'),('1b11443e-f36b-1410-8cd9-00af0c2de9b7','06','A','Cabezal Zeta A','192.168.1.11','1'),('2111443e-f36b-1410-8cd9-00af0c2de9b7','06','B','Cabezal Zeta B','192.168.1.12','1'),('2711443e-f36b-1410-8cd9-00af0c2de9b7','07','A','Cabezal Doble-X A','192.168.1.19','1'),('3011443e-f36b-1410-8cd9-00af0c2de9b7','07','B','Cabezal Doble-X B','192.168.1.20','1'),('3c11443e-f36b-1410-8cd9-00af0c2de9b7','08','A','Cabezal Omega A','192.168.1.15','1'),('4811443e-f36b-1410-8cd9-00af0c2de9b7','08','B','Cabezal Omega B','192.168.1.16','1'),('5411443e-f36b-1410-8cd9-00af0c2de9b7','09','A','Cabezal Sigma A','192.168.1.17','1'),('5f11443e-f36b-1410-8cd9-00af0c2de9b7','09','B','Cabezal Sigma B','192.168.1.18','1'),('6911443e-f36b-1410-8cd9-00af0c2de9b7','10','A','Cabezal Lambda A','192.168.1.19','1'),('7311443e-f36b-1410-8cd9-00af0c2de9b7','10','B','Cabezal Lambda B','192.168.1.20','1'),('7d11443e-f36b-1410-8cd9-00af0c2de9b7','11','A','Cabezal Iota A','192.168.1.21','1'),('8511443e-f36b-1410-8cd9-00af0c2de9b7','11','B','Cabezal Iota B','192.168.1.22','1'),('8b11443e-f36b-1410-8cd9-00af0c2de9b7','12','A','Cabezal Rho A','192.168.1.23','1'),('9111443e-f36b-1410-8cd9-00af0c2de9b7','12','B','Cabezal Rho B','192.168.1.24','1'),('9711443e-f36b-1410-8cd9-00af0c2de9b7','13','A','Cabezal Tau A','192.168.1.25','1'),('9f11443e-f36b-1410-8cd9-00af0c2de9b7','13','B','Cabezal Tau B','192.168.1.26','1'),('a911443e-f36b-1410-8cd9-00af0c2de9b7','14','A','Cabezal Kappa A','192.168.1.27','1'),('b311443e-f36b-1410-8cd9-00af0c2de9b7','14','B','Cabezal Kappa B','192.168.1.28','1'),('bd11443e-f36b-1410-8cd9-00af0c2de9b7','15','A','Cabezal Uno A','192.168.1.29','1'),('c511443e-f36b-1410-8cd9-00af0c2de9b7','15','B','Cabezal Uno B','192.168.1.30','1'),('cb11443e-f36b-1410-8cd9-00af0c2de9b7','16','A','Cabezal Dos A','192.168.1.31','1'),('d111443e-f36b-1410-8cd9-00af0c2de9b7','16','B','Cabezal Dos B','192.168.1.32','1'),('d711443e-f36b-1410-8cd9-00af0c2de9b7','17','A','Cabezal Tres A','192.168.1.33','1'),('dd11443e-f36b-1410-8cd9-00af0c2de9b7','17','B','Cabezal Tres B','192.168.1.34','1'),('e311443e-f36b-1410-8cd9-00af0c2de9b7','18','A','Cabezal Cuatro A','192.168.1.35','1'),('e911443e-f36b-1410-8cd9-00af0c2de9b7','18','B','Cabezal Cuatro B','192.168.1.36','1'),('ef11443e-f36b-1410-8cd9-00af0c2de9b7','19','A','Cabezal Cinco A','192.168.1.37','1'),('f511443e-f36b-1410-8cd9-00af0c2de9b7','19','B','Cabezal Cinco B','192.168.1.38','1'),('0112443e-f36b-1410-8cd9-00af0c2de9b7','20','A','Cabezal Seis A','192.168.1.39','1'),('0d12443e-f36b-1410-8cd9-00af0c2de9b7','20','B','Cabezal Seis B','192.168.1.40','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('1912443e-f36b-1410-8cd9-00af0c2de9b7','TOM1','Tomate Variante 1','Tomate','1'),('2512443e-f36b-1410-8cd9-00af0c2de9b7','TOM2','Tomate Variante 2','Tomate','1'),('2d12443e-f36b-1410-8cd9-00af0c2de9b7','TOM3','Tomate Variante 3','Tomate','1'),('3512443e-f36b-1410-8cd9-00af0c2de9b7','TOM4','Tomate Variante 4','Tomate','1'),('3d12443e-f36b-1410-8cd9-00af0c2de9b7','TOM5','Tomate Variante 5','Tomate','1'),('4512443e-f36b-1410-8cd9-00af0c2de9b7','TOM6','Tomate Variante 6','Tomate','1'),('4a12443e-f36b-1410-8cd9-00af0c2de9b7','TOM7','Tomate Variante 7','Tomate','1'),('4c12443e-f36b-1410-8cd9-00af0c2de9b7','TOM8','Tomate Variante 8','Tomate','1'),('4e12443e-f36b-1410-8cd9-00af0c2de9b7','TOM9','Tomate Variante 9','Tomate','1'),('5012443e-f36b-1410-8cd9-00af0c2de9b7','TOM10','Tomate Variante 10','Tomate','1'),('5212443e-f36b-1410-8cd9-00af0c2de9b7','TOM11','Tomate Variante 11','Tomate','1'),('5612443e-f36b-1410-8cd9-00af0c2de9b7','TOM12','Tomate Variante 12','Tomate','1'),('5c12443e-f36b-1410-8cd9-00af0c2de9b7','TOM13','Tomate Variante 13','Tomate','1'),('6212443e-f36b-1410-8cd9-00af0c2de9b7','TOM14','Tomate Variante 14','Tomate','1'),('6812443e-f36b-1410-8cd9-00af0c2de9b7','TOM15','Tomate Variante 15','Tomate','1'),('7212443e-f36b-1410-8cd9-00af0c2de9b7','TOM16','Tomate Variante 16','Tomate','1'),('8012443e-f36b-1410-8cd9-00af0c2de9b7','TOM17','Tomate Variante 17','Tomate','1'),('8e12443e-f36b-1410-8cd9-00af0c2de9b7','TOM18','Tomate Variante 18','Tomate','1'),('9c12443e-f36b-1410-8cd9-00af0c2de9b7','TOM19','Tomate Variante 19','Tomate','1'),('aa12443e-f36b-1410-8cd9-00af0c2de9b7','TOM20','Tomate Variante 20','Tomate','1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('b012443e-f36b-1410-8cd9-00af0c2de9b7','PRES1','Palet 1 - 4 bidones de 200kg',800.00,850.00,'1'),('b612443e-f36b-1410-8cd9-00af0c2de9b7','PRES2','Palet 2 - 4 bidones de 200kg',800.00,850.00,'1'),('bc12443e-f36b-1410-8cd9-00af0c2de9b7','PRES3','Palet 3 - 4 bidones de 200kg',800.00,850.00,'1'),('c212443e-f36b-1410-8cd9-00af0c2de9b7','PRES4','Palet 4 - 4 bidones de 200kg',800.00,850.00,'1'),('c812443e-f36b-1410-8cd9-00af0c2de9b7','PRES5','Palet 5 - 4 bidones de 200kg',800.00,850.00,'1'),('ce12443e-f36b-1410-8cd9-00af0c2de9b7','PRES6','Palet 6 - 4 bidones de 200kg',800.00,850.00,'1'),('d412443e-f36b-1410-8cd9-00af0c2de9b7','PRES7','Palet 7 - 4 bidones de 200kg',800.00,850.00,'1'),('d812443e-f36b-1410-8cd9-00af0c2de9b7','PRES8','Palet 8 - 4 bidones de 200kg',800.00,850.00,'1'),('dc12443e-f36b-1410-8cd9-00af0c2de9b7','PRES9','Palet 9 - 4 bidones de 200kg',800.00,850.00,'1'),('e012443e-f36b-1410-8cd9-00af0c2de9b7','PRES10','Palet 10 - 4 bidones de 200kg',800.00,850.00,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('e912443e-f36b-1410-8cd9-00af0c2de9b7','842000001001','TOM1','PRES1',365,'1'),('f712443e-f36b-1410-8cd9-00af0c2de9b7','842000001002','TOM2','PRES2',365,'1'),('0513443e-f36b-1410-8cd9-00af0c2de9b7','842000001003','TOM3','PRES3',365,'1'),('0713443e-f36b-1410-8cd9-00af0c2de9b7','842000001004','TOM4','PRES4',365,'1'),('0913443e-f36b-1410-8cd9-00af0c2de9b7','842000001005','TOM5','PRES5',365,'1'),('1113443e-f36b-1410-8cd9-00af0c2de9b7','842000001006','TOM6','PRES6',365,'1'),('1f13443e-f36b-1410-8cd9-00af0c2de9b7','842000001007','TOM7','PRES7',365,'1'),('2d13443e-f36b-1410-8cd9-00af0c2de9b7','842000001008','TOM8','PRES8',365,'1'),('3b13443e-f36b-1410-8cd9-00af0c2de9b7','842000001009','TOM9','PRES9',365,'1'),('4713443e-f36b-1410-8cd9-00af0c2de9b7','842000001010','TOM10','PRES10',365,'1');
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('1f2b433e-f36b-1410-8ce0-00af0c2de9b7','01','A','cd10443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('212b433e-f36b-1410-8ce0-00af0c2de9b7','01','B','db10443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('252b433e-f36b-1410-8ce0-00af0c2de9b7','02','A','e410443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('2b2b433e-f36b-1410-8ce0-00af0c2de9b7','02','B','e810443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('312b433e-f36b-1410-8ce0-00af0c2de9b7','03','A','ec10443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('372b433e-f36b-1410-8ce0-00af0c2de9b7','03','B','f010443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('452b433e-f36b-1410-8ce0-00af0c2de9b7','03','C','f610443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('532b433e-f36b-1410-8ce0-00af0c2de9b7','04','A','fe10443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('612b433e-f36b-1410-8ce0-00af0c2de9b7','04','B','0611443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('692b433e-f36b-1410-8ce0-00af0c2de9b7','05','A','0e11443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('6b2b433e-f36b-1410-8ce0-00af0c2de9b7','05','B','1511443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('6d2b433e-f36b-1410-8ce0-00af0c2de9b7','06','A','1b11443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('6f2b433e-f36b-1410-8ce0-00af0c2de9b7','06','B','2111443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('752b433e-f36b-1410-8ce0-00af0c2de9b7','07','A','2711443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('7b2b433e-f36b-1410-8ce0-00af0c2de9b7','07','B','3011443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('812b433e-f36b-1410-8ce0-00af0c2de9b7','08','A','3c11443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('8b2b433e-f36b-1410-8ce0-00af0c2de9b7','08','B','4811443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('992b433e-f36b-1410-8ce0-00af0c2de9b7','09','A','5411443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('a72b433e-f36b-1410-8ce0-00af0c2de9b7','09','B','5f11443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('b52b433e-f36b-1410-8ce0-00af0c2de9b7','10','A','6911443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('b92b433e-f36b-1410-8ce0-00af0c2de9b7','10','B','7311443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('bd2b433e-f36b-1410-8ce0-00af0c2de9b7','11','A','7d11443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('c12b433e-f36b-1410-8ce0-00af0c2de9b7','11','B','8511443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('c52b433e-f36b-1410-8ce0-00af0c2de9b7','12','A','8b11443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('d12b433e-f36b-1410-8ce0-00af0c2de9b7','12','B','9111443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('dd2b433e-f36b-1410-8ce0-00af0c2de9b7','13','A','9711443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('e92b433e-f36b-1410-8ce0-00af0c2de9b7','13','B','9f11443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('f52b433e-f36b-1410-8ce0-00af0c2de9b7','14','A','a911443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('fd2b433e-f36b-1410-8ce0-00af0c2de9b7','14','B','b311443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('052c433e-f36b-1410-8ce0-00af0c2de9b7','15','A','bd11443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('0d2c433e-f36b-1410-8ce0-00af0c2de9b7','15','B','c511443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('152c433e-f36b-1410-8ce0-00af0c2de9b7','16','A','cb11443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('1b2c433e-f36b-1410-8ce0-00af0c2de9b7','16','B','d111443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('212c433e-f36b-1410-8ce0-00af0c2de9b7','17','A','d711443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('272c433e-f36b-1410-8ce0-00af0c2de9b7','17','B','dd11443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('2d2c433e-f36b-1410-8ce0-00af0c2de9b7','18','A','e311443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('2f2c433e-f36b-1410-8ce0-00af0c2de9b7','18','B','e911443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('312c433e-f36b-1410-8ce0-00af0c2de9b7','19','A','ef11443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('332c433e-f36b-1410-8ce0-00af0c2de9b7','19','B','f511443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('352c433e-f36b-1410-8ce0-00af0c2de9b7','20','A','0112443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL),('3b2c433e-f36b-1410-8ce0-00af0c2de9b7','20','B','0d12443e-f36b-1410-8cd9-00af0c2de9b7',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[motivo_bajas] ([id],[codigo_baja],[nombre_baja],[descripcion_baja],[visible]) VALUES ('5313443e-f36b-1410-8cd9-00af0c2de9b7','M1','Fallo mecánico',NULL,'1'),('5b13443e-f36b-1410-8cd9-00af0c2de9b7','M2','Error de etiquetado',NULL,'1'),('5f13443e-f36b-1410-8cd9-00af0c2de9b7','M3','Contaminación cruzada',NULL,'1'),('6313443e-f36b-1410-8cd9-00af0c2de9b7','M4','Fallo de llenado',NULL,'1'),('6713443e-f36b-1410-8cd9-00af0c2de9b7','M5','Producto caducado',NULL,'1'),('7013443e-f36b-1410-8cd9-00af0c2de9b7','M6','Error de operador',NULL,'1'),('7e13443e-f36b-1410-8cd9-00af0c2de9b7','M7','Falta de materia prima',NULL,'1'),('8c13443e-f36b-1410-8cd9-00af0c2de9b7','M8','Fallo eléctrico',NULL,'1'),('9a13443e-f36b-1410-8cd9-00af0c2de9b7','M9','Error en peso',NULL,'1'),('a413443e-f36b-1410-8cd9-00af0c2de9b7','M10','Problema de presión',NULL,'1'),('ae13443e-f36b-1410-8cd9-00af0c2de9b7','M11','Error de mezcla',NULL,'1'),('b813443e-f36b-1410-8cd9-00af0c2de9b7','M12','Mantenimiento urgente',NULL,'1'),('c213443e-f36b-1410-8cd9-00af0c2de9b7','M13','Control de calidad fallido',NULL,'1'),('d013443e-f36b-1410-8cd9-00af0c2de9b7','M14','Retrabajo necesario',NULL,'1'),('de13443e-f36b-1410-8cd9-00af0c2de9b7','M15','Contenedor defectuoso',NULL,'1');
INSERT INTO [dbo].[roles] ([id], [rol], [llenadoras_permitidas]) VALUES('ec13443e-f36b-1410-8cd9-00af0c2de9b7', 'ADMINISTRADOR', 'TODAS'),('fd13443e-f36b-1410-8cd9-00af0c2de9b7', 'CALIDAD', 'NINGUNA'),('0114443e-f36b-1410-8cd9-00af0c2de9b7', 'MANTENIMIENTO', 'TODAS_MENOS:01,02,03'),('f913443e-f36b-1410-8cd9-00af0c2de9b7', 'SUPERVISOR', 'TODAS'),('f513443e-f36b-1410-8cd9-00af0c2de9b7', 'USUARIO', 'NINGUNA_MENOS:01,02,03');
INSERT INTO [dbo].[usuarios] ([id], [nombre], [password], [uuid_rol], [visible]) VALUES ('0914443e-f36b-1410-8cd9-00af0c2de9b7', 'DANIELADMIN', '$2b$10$Ezxh242kwuUEWd6IziyHI.HRjEZhht6nkDAp.jYZfXwUgPON4/EYS', 'ec13443e-f36b-1410-8cd9-00af0c2de9b7', '1'),('1014443e-f36b-1410-8cd9-00af0c2de9b7', 'DANIELUSUARIO', '$2b$10$vXAdqzXkFdjLkmVMk3tl6eHyJQ54DZjqAxmftc7VoQ4rb//9tK1Rm', 'f513443e-f36b-1410-8cd9-00af0c2de9b7', '1'),('1214443e-f36b-1410-8cd9-00af0c2de9b7', 'DANIELMANTENIMIENTO', '$2b$10$Ezxh242kwuUEWd6IziyHI.HRjEZhht6nkDAp.jYZfXwUgPON4/EYS', '0114443e-f36b-1410-8cd9-00af0c2de9b7', '1'),('1314443e-f36b-1410-8cd9-00af0c2de9b7', 'DANIELCALIDAD', '$2b$10$Ezxh242kwuUEWd6IziyHI.HRjEZhht6nkDAp.jYZfXwUgPON4/EYS', 'fd13443e-f36b-1410-8cd9-00af0c2de9b7', '1'),('1414443e-f36b-1410-8cd9-00af0c2de9b7', 'DANIELSUPERVISOR', '$2b$10$Ezxh242kwuUEWd6IziyHI.HRjEZhht6nkDAp.jYZfXwUgPON4/EYS', 'f913443e-f36b-1410-8cd9-00af0c2de9b7', '1');
