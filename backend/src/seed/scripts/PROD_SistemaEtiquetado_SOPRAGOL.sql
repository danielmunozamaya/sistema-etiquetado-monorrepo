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
    [ruta_impresion] varchar(50),
    [visible] bit DEFAULT ((1)),
    CONSTRAINT [FK_a41ae2cff9249f157c1cd868920] FOREIGN KEY ([id_llenadora]) REFERENCES [dbo].[llenadoras]([id_llenadora]),
    PRIMARY KEY ([id])
);

CREATE TABLE [dbo].[productos] (
    [id] uniqueidentifier DEFAULT (newsequentialid()),
    [id_producto] varchar(30) UNIQUE,
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
    [id_producto] varchar(30),
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
    [id_producto] varchar(30),
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
    [ruta_impresion_manual] varchar(50),
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
    [id_producto] varchar(30),
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

INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('19f52a0c-22a2-40d9-85b1-e71d4cfb1220', '51', 'MACROPACK 1', '51', 1, 1);
INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('07b433c8-9e7e-4539-b8d6-6b13d02c54d5', '52', 'MACROPACK 2', '52', 1, 1);
INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('a1af4d1d-14ff-40b4-90ad-54b5ee728bae', '53', 'MACROPACK 3', '53', 1, 1);
INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('cca4b22d-9cb0-4085-a959-793e5ff2cd5c', '54', 'LATAS STRINI', '54', 0, 1);
INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('90c23e3c-7cb8-4df2-8f0b-d7d72cd0a5eb', '56', 'LATAS TEYCOMUR', '56', 0, 1);
INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('1fa6abf5-2f44-4bcb-84ea-75e0f09a9d8d', '57', 'LATAS NAVATTA', '57', 0, 1);
INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('c0cc97a4-7bff-4176-b138-b4ecd2b7a3d5', '58', 'MACROPACK C', '58', 0, 1);
INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('4ae93326-449a-40e3-9bee-414c1bb1bc0e', '59', 'MACROPACK 4', '59', 1, 1);

INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('2bc36edf-f21f-4de9-be7e-49b473ded50f','51','A','MACROPACK 1 - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('663aa384-d826-4e95-b7d1-341aa2430c50','51','B','MACROPACK 1 - B','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('866f8d65-1aed-4ad9-96ee-60912c267a16','52','A','MACROPACK 2 - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('3a85e232-a245-4854-8dad-580fd61fdb31','52','B','MACROPACK 2 - B','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('a03b7aa7-f3d3-4e52-a8f0-d72d0a84d2c9','53','A','MACROPACK 3 - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('0d74be8e-cdb2-4263-bf8f-3a438b4e15fc','53','B','MACROPACK 3 - B','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('d5c0572d-3f37-4b6a-99cc-eb648964e102','54','A','LATAS STRINI - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('4a6c2b53-94b7-41ef-812d-0b3c37c4d86d','56','A','LATAS TEYCOMUR - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('38d6db29-1cd4-46e0-a39b-94254d758818','57','A','LATAS NAVATTA - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('b0f10c70-a864-4f62-9cd2-989034dbfdc2','58','A','MACROPACK C - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('e22db7bd-134d-45cb-b66c-2b406ff5a028','59','A','MACROPACK 4 - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('4e5c6f56-61a5-4381-8508-4d04a31389c6','59','B','MACROPACK 4 - B','192.168.5.43',1);

INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('977dde5f-8a4a-4b79-ad55-dbd75a67dfe6','0701.SAL/BIDON','Tomato Paste 6/8 Brix - Passata con sal / Triturado / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('579dd387-f08f-49c7-9ee8-43a267ff94fb','0701/BIDON','Tomato Paste 6/8 Brix - Passata / Triturado / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('7310294a-426f-44bd-8358-74dd0f533979','0702/BIDON','TP 6/8 Brix Extruded Tomatoes - Tomato Crushed / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('1072b375-6e14-43f4-a7d6-a5c4a0a42bea','0901/BIDON','Tomato Paste 8/10 Brix - Passata / Triturado / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('91912ede-0ac6-46e5-a92a-404b8ca23fc7','0901/COMBO','Tomato Paste 8/10 Brix - Passata / Triturado / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('adabbfd1-70de-46b2-a6e0-5ec22db87d10','0902/BIDON','Tomato Paste 8/10 brix - Pizza Sauce / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('28cde041-5f0b-4355-be6a-3192817fbd31','0902/DIRECTO','Tomato Paste 8/10 Brix - Pizza / DIRECTO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('de574034-0654-4601-90f7-489dc783664b','1101.SAL/BIDON','Tomato Paste 10/12 Brix - Passata con sal   / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('dda8cd87-1667-4a17-b858-f88ceb53ba1c','1101.SAL/COMBO','Tomato Paste 10/12 Brix - Passata con sal   / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('2f48814d-1205-4a1f-bd30-9293d691696b','1101/BIDON','Tomato Paste 10/12 birx - Passata  / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('04d242b3-a677-4ff8-8c17-1f3131fe624e','1101/COMBO','Tomato Paste 10/12 birx - Passata  / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('30e32586-7ca5-4ead-b458-c763fe94a186','1101/LA9','Tomato Paste 10/12 birx - Passata  / LATA A9','LATA CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('cd6429e7-9dc3-4463-9ed6-816fcca5207f','1102.SAL/LA9','Tomato Paste 10/12 Brix - Pizza Sauce con sal / LATA A9','LATA CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('ef9921ea-ef74-43f4-bc3f-fb63dfc7c308','1102/BIDON','Tomato Paste 10/12 Brix - Pizza Sauce / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('89245946-9ddb-4646-92fa-a460b7184fde','1102/COMBO','Tomato Paste 10/12 Brix - Pizza Sauce / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('3049a291-159a-4aa5-806d-c3bb5bfdfdc5','1301/BIDON','Tomato Paste 12/14 Brix - Passata / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('e14f9710-7d74-41c6-ad44-ebee817fff41','1301/COMBO','Tomato Paste 12/14 Brix - Passata / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('ddfb5ca6-03d8-4d49-8cd9-03d8862470e4','1302.SAL/LA15','Tomato Paste 12/14 Brix - Pizza Sauce con sal / LATA A15','LATA CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('327b9a54-f514-4d8f-87ff-79c090b8a407','1302/BIDON','Tomato Paste 12/14 Brix - Pizza Sauce / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('f9c404b6-1697-4472-bbed-60dca04517df','1501/BIDON','Tomato Paste 14/16 Brix - Passata / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('254bd4c1-10a3-434d-92b3-4eeb148cef46','1502.SAL/LA10','Tomato Paste 14/16 Brix - Pizza Sauce con sal / LATA A10','LATA CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('5415bd8e-87d8-41a1-b4b1-29526bc35fef','1502.SAL/LA15','Tomato Paste 14/16 Brix - Pizza Sauce con sal / LATA A15','LATA CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('66a7998a-8edf-4488-81c6-64d1e81a4717','1502/BIDON','Tomato Paste 14/16 Brix - Crushed Tomatoes / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('8fa318b8-5438-4ce3-bb3b-d63f435961fe','1502/DIRECTO','Tomato Paste 14/16 Brix - Crushed Tomatoes / DIRECTO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('8f2fd655-d5be-467f-a631-0605c8c7c3cd','1702/BIDON','Tomato Paste 16/18 Brix - Pizza Sauce / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('d1e5480d-ebd3-4cdb-b6bd-411bfa71075d','28SHB/BIDON','Tomato paste 28 Brix SHB  / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('b0c86e15-6219-4004-8f3f-40f0783c261c','28SHB/COMBO','Tomato paste 28 Brix SHB  / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('d25f8387-1f64-4ba7-837f-34fc9a0bc12a','28SHB/FRUCTUS','Tomato paste 28 Brix SHB  / FRUCTUS','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('3ed9f64f-bc2c-41c4-9d56-ac43fe9d51c6','2901.SAL/L400','Tomato Paste 28/30 Brix - Cold Break con sal / LATA 400G','LATA CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('a153d78f-d351-41c5-b8b3-5983e45ee161','2901.SAL/L800','Tomato Paste 28/30 Brix - Cold Break con sal / LATA 800G','LATA CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('c981a93c-2eea-47b5-b174-a962bd97f62e','2901/BIDON','Tomato Paste 28/30 Brix - Cold Break / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('b7475451-7adf-4433-bfd0-68f7ea2e07a3','2901/COMBO','Tomato Paste 28/30 Brix - Cold Break / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('df2cc6fa-6667-430d-aa9d-0768d64391c3','2901/L400','Tomato Paste 28/30 Brix - Cold Break / LATA 400G','LATA CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('ec33fe26-370a-4b1a-a046-90629b357904','2901/L800','Tomato Paste 28/30 Brix - Cold Break / LATA 800G','LATA CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('f890d9d1-9d7e-4d10-8635-3e337a6c9f0c','2901/LA15','Tomato Paste 28/30 Brix - Cold Break / LATA A15','LATA CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('69ae6bac-3556-4555-b0ff-3850d1d77f66','2901/LA9','Tomato Paste 28/30 Brix - Cold Break / LATA A9','LATA CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('5974b400-0e8f-4890-9b84-43246e0fb17d','2902.3M/BIDON','Tomato Paste 28/30 Brix - Hot  Break 3MM / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('ea55e723-284d-44bd-b665-7fb362df47a8','2902/BIDON','Tomato Paste 28/30 Brix - Hot  Break / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('a29d24ff-316b-4ca3-86d1-f36f561e2841','3101/BIDON','Tomato Paste 30/32 Brix - Cold Break / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('aad5c1df-0ae5-48e0-87a4-73500de05f5d','3102/BIDON','Tomato Paste 30/32 Brix - Hot Break / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('eb054068-ffe7-43c9-bf2a-0bf9c287b4f3','3701/BIDON','Tomato Paste 36/38 Brix - Cold Break / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('7d15e0c4-cbd9-464a-910e-36ef25bfe122','3701/COMBO','Tomato Paste 36/38 Brix - Cold Break / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('c856fedb-9e2f-417e-a231-4d4d89379eff','DADO.CG/BIDON','Tomato Dices (C-G)  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('2050dff9-9d67-429d-97d2-8533fd31ba17','DADO.CG/LA10','Tomato Dices (C-G)  / LATA A10','LATA DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('9eb46c89-4830-4b30-b855-f8da9951c862','DADO.CM/BIDON','Tomato Dices (C-M)  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('b2568113-2934-41bb-ba44-337125e6896f','DADO.CM/COMBO','Tomato Dices (C-M)  / COMBO','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('4d171e11-b017-4414-827b-709891e6fed3','DADO.CM/GPS','Tomato Dices (C-M)  / GPS','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('f9dfde05-b28c-4755-bd7c-21b63f027717','DADO.CM/LA15','Tomato Dices (C-M)  / LATA A15','LATA DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('a008c039-0d05-496f-aac2-bb0746b2ad0b','DADO.CM/LA9','Tomato Dices (C-M)  / LATA A9','LATA DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('2bed53dc-fca9-4087-a3d7-1a1897a6ea61','DADO.CP/BIDON','Tomato Dices (C-P)  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('b36451be-2be6-4941-ad4c-24a573e23b33','DADO.CP/COMBO','Tomato Dices (C-P)  / COMBO','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('57de236d-3dbc-46d9-a867-0ce5142488b0','DADO.SM.LEMON/BIDON','Tomato Dices (S-M) Lemon juice  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('1c724fd9-ec10-49ac-814b-e1b1a3b0980e','DADO.SM.LEMON/COMBO','Tomato Dices (S-M) Lemon juice / COMBO','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('c458f213-20f5-47d3-aabf-a37617f74f30','DADO.SM/BIDON','Tomato Dices (S-M)  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('4e6d364f-902d-45c0-ab77-b8fe7aefd684','DADO.SM/COMBO','Tomato Dices (S-M)  / COMBO','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('58522333-e7f9-4139-91be-f5165bc2b81e','DADO.SP/BIDON','Tomato Dices (S-P) - Concas  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('675d7918-8e68-4cf8-bcbb-2ef61c524cdb','DADO.SP/COMBO','Tomato Dices (S-P) - Concas  / COMBO','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('413b4997-f59a-44d7-ae39-3d3d27f6a423','DADO.SXP/BIDON','Tomato Dices (S-XP)  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('6702a8ef-54f3-4b23-b32e-183a1936e716','PDPS/LA15','Passata di Pomodoro Sauce / LATA A15','LATA SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('dd9fec66-322b-412a-bb1d-365955b7cba7','PELADO/LA9','Whole Peeled Tomatoes / LATA A9','LATA DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('16521c7d-e007-4742-b6a0-b378ff4907ab','POLPA/BIDON','Polpa tomatoes  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('a40ced2a-e5e6-4dc6-9c14-1f818756d493','POMACE/BIGBAG','Tomato Pomace  / BIGBAG','SECADERO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('4497ed10-037d-4df8-ac7c-39365d541a59','SALILTEM/L850','Salsa de Tomate Il Tempietto / LATA 850G','LATA SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('46cfcea0-de43-4ac9-965a-cc6a748354f6','TEMFAM.12/LA10','Temperado Famosa 12/14 / LATA A10','LATA SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('55b98543-a975-4676-9982-c7202bbe06c5','TEMFAM.12/LA15','Temperado Famosa 12/14 / LATA A15','LATA SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('6b296b4b-4af2-4111-b0f1-1422743481a8','TEMFAM.12/LA9','Temperado Famosa 12/14 / LATA A9','LATA SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('1fbbfcc1-052c-4b31-88f3-bc95d10ca2f4','TEMPJN/LA10','Spiced Pizza Sauce PAPA JOHNS / LATA A10','LATA SALSA','1');

INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('7da5debf-adaa-47ac-b92f-a96ae983e214','1','Producto en directo 1000 Kg',1000.00,1000.00,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('76e5d916-6f35-4c43-9100-1d749bd6f804','2','Pallet con 84 cartones de 12 latas 800 gr MENU - 2901',806.40,937.32,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('93421be0-fb30-49c8-933b-6f2039ad9cc3','3','Pallet con 78 cartones de 24 latas 400 gr - 2901',748.80,891.31,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('27c59eb5-2f3c-40c7-8f24-3e8c1b5164a1','4','Pallet con 72 cartones de 24 latas 400 gr S - 2901',691.20,822.75,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('3f0b7b34-a736-4bf7-aa73-cf8e7ee4f6cc','5','Pallet con 72 cartones de 12 latas 850 gr',734.40,777.86,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('a6b8965d-84d7-4a74-8f78-2dd0e241407c','6','Pallet con 72 cartones de 12 latas 800 gr S - 2901',691.20,812.02,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('702b8809-6014-4dbd-b3b5-966644717ce9','7','Pallet con 72 cartones de 12 latas 800 gr - 2901',691.20,812.02,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('8eb313cd-19e3-4836-a9f7-737a48200a87','8','Pallet con 336 latas A9 - TEMFAM',856.80,959.38,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('55323cc5-bd75-480a-96ba-5d5aff7e3702','9','Pallet con 336 latas A9 - PELADO',856.80,974.83,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('c2cde56f-6df2-4a3e-9d52-b87ef8b47d09','10','Pallet con 336 latas A9 - DADO',856.80,974.83,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('1adb1e01-0aa1-4d58-a694-5251938d18f7','11','Pallet con 336 latas A9 - 2901',940.80,1046.06,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('e805483b-f8cc-41ad-b615-6f9815c05e57','12','Pallet con 336 latas A9 - 1102',856.80,959.38,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('27ede3e1-09a2-40fa-b6a0-cb1418c0ee9e','13','Pallet con 336 latas A9 - 1101',856.80,959.38,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('876c26d9-00a0-4a9d-91f8-0db9063651fe','14','Pallet con 336 latas A10 - TEMPJN',1018.08,1126.70,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('50601d83-f44f-4d90-8d1e-1d7952fd98ab','15','Pallet con 336 latas A10 - TEMFAM',991.20,1099.82,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('a0585a28-654e-4add-849c-399269e455a7','16','Pallet con 336 latas A10 - DADO',1008.00,1132.08,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('4e77e776-82b2-4afc-9698-bfbcf949a507','17','Pallet con 336 latas A10 - 1502',1008.00,1116.62,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('3e134397-6512-4bfe-914b-8e129562255f','18','Pallet con 240 latas A15 - TEMFAM',984.00,1095.60,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('1920b9f6-72a1-43c6-a141-f9c5b4635872','19','Pallet con 240 latas A15 - PDPS',984.00,1095.60,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('fb08a19d-5015-4a4d-81b2-fdf354a91124','20','Pallet con 240 latas A15 - DADO',984.00,1102.30,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('c5f45789-a87b-4059-802d-6c9896ed1768','21','Pallet con 240 latas A15 - 2901',1089.60,1201.20,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('4726d58e-1a9b-49c3-98bd-a732f346b73f','22','Pallet con 240 latas A15 - 1502',1008.00,1119.60,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('9bd6ad96-8c4b-4ff7-a568-37182d60c01c','23','Pallet con 240 latas A15 - 1302',1008.00,1119.60,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('a49bf859-0ab7-460a-9962-6ad27464c743','24','Pallet con 2080 latas 800 gr - 2901',832.00,964.38,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('4443c4f9-ecd8-4fd1-996f-0fd8ae2a99c6','25','Pallet con 175 latas A15 (Europallet) - DADO',717.50,806.55,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('d09150ad-d00c-4b36-9ca4-64a42f072c01','26','Pallet con 1200 latas 800 gr - 2901',960.00,1100.86,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('c32c21dc-7042-408f-b69f-c2ff8e55ac85','27','Granel 1820 cajas de 24 latas 400 gr DT - 2901',17472.00,20027.28,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('5dfd4a02-c851-46f6-911e-30b615490e3f','28','Granel 1820 cajas de 12 latas 800 gr DT - 2901',17472.00,19756.10,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('3176516e-efd8-4ab8-acb2-cac1d27d5347','29','GPS con bolsa de 1350 Kg',1350.00,1475.00,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('13dad414-3be3-4652-b6e6-bff113839894','30','Fructus con bolsa de 1250 Kg',1250.00,1358.00,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('130efc56-a4ca-4fea-8bf6-546552db542d','31','Combo con bolsa de 1200 Kg',1200.00,1280.00,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('139da5db-f77c-404f-b018-95fc193a9ad9','32','Combo con bolsa de 1250 Kg',1250.00,1330.00,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('0560b752-51ae-4872-9324-266caa72e166','33','Combo con bolsa de 1200 Kg',1200.00,1280.00,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('5d01a4d3-f80e-4722-b2bf-b56375720aa9','34','Combo con bolsa de 1000 Kg',1000.00,1080.00,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('7ef8fc9d-8ca1-4309-b0f8-780f558d23b3','35','Big Bag de 850 Kg',850.00,870.00,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('5d6dd685-ab1a-4d04-8c5a-1e6d052888bc','36','Bidón con bolsa de 245 Kg',245.00,255.00,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('05284f71-dda0-44bb-800b-6b3a0a5945f0','37','Bidón con bolsa de 240 Kg',240.00,250.00,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('d5d434a0-63d4-4c9c-98df-9295b238fb59','38','Bidón con bolsa de 220 Kg',220.00,230.00,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('8122e1ac-1690-4949-8619-55f00357d9b9','39','Bidón con bolsa de 220 Kg',220.00,231.00,1);
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('e12b3146-c307-4216-befd-1617fb6e527e','40','Bidón con bolsa de 215 Kg',215.00,225.00,1);

INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('d3a4ceab-923d-4055-96e6-fc5c36c5db2e','5603318000011','2901/LA9','11',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('73b78f4f-acc8-4bb5-b823-cbb34f877226','5603318000066','2901/LA15','21',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('3fb92ab5-3cda-4ca9-b35e-4717023bac27','5603318000158','2901/BIDON','37',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('216cfd8c-763d-4a45-b5df-8efab8dcdc63','5603318000202','2901/L400','3',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('53ce482a-a5f4-47e0-927f-92e1ef9c9777','5603318000219','2901/L800','7',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('e0d7b9b0-cc63-482f-a5ba-1870103d0882','5603318000226','2901.SAL/L400','4',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('fae74097-acaa-49a2-9c0c-7a1ddb35fd95','5603318000233','2901.SAL/L800','6',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('71552377-998b-43d5-9203-33381fff18af','5603318000257','2902/BIDON','37',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('31e03e7e-ef72-4baf-99e7-5facedb6604c','5603318000264','2901.SAL/L400','27',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('eef21f73-0192-4366-be71-33c14166596d','5603318000271','28SHB/BIDON','37',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('d259750e-0deb-4bea-bb35-455d4a98224a','5603318000301','28SHB/COMBO','31',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a6882f57-2948-490b-a1dd-94b2e3e13548','5603318000356','2902.3M/BIDON','37',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('17fc1cc5-098a-4185-ae4c-ddf6c1605f25','5603318000370','3101/BIDON','37',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('16dc98b6-c52e-4628-b6d1-50fdfe0ea207','5603318000448','2901.SAL/L800','28',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('f68bef37-15ed-4d4c-a8fb-fb351c514d88','5603318000455','PELADO/LA9','9',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('b8c66a2a-77b5-42ed-a135-7c88e7670b5e','5603318000516','3701/BIDON','36',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('2ec52b53-6f31-485b-8878-b1c5cce32d7a','5603318000523','3701/COMBO','32',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('77c182ca-3cb4-4bf5-afc3-6fb94ba98c6c','5603318000547','28SHB/FRUCTUS','30',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('603bbd8d-98f5-40e5-a175-1ae21aa2d7f8','5603318000585','1302.SAL/LA15','23',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('b84ec984-7166-423d-a21a-e96acc174d1e','5603318000615','2901/L800','2',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('e9e09ee8-c5d1-4187-aa1e-98dfb8bdf34d','5603318000622','2901.SAL/L800','26',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('42d274dc-3914-4941-94c0-c844532feaed','5603318000684','1502.SAL/LA10','17',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('fd30d274-1151-4145-a805-b0e001b05c14','5603318000691','1502.SAL/LA15','22',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('e5d5507a-797e-4513-a963-c94d3b63c4ac','5603318000745','1302/BIDON','39',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('dbd300f6-b91a-473c-aef5-0b8647b29b7a','5603318000875','1102.SAL/LA9','12',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('256a3228-9516-467b-9356-be8cedbc4f18','5603318000943','1301/BIDON','39',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('5218d5c7-8b5b-47b7-b4d2-7880479c85e4','5603318000950','1301/COMBO','34',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('9d4c3df5-a768-43fb-8130-75cf88067959','5603318001094','1102/BIDON','39',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('36d34c2a-35cd-4389-9bc5-0b9d61249cd5','5603318001148','1101/BIDON','39',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('56b69c6c-d55f-41c7-be8a-8c371bba9558','5603318001155','1501/BIDON','39',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('6ccc6024-7248-4d3c-b406-8ac827d13ca1','5603318001162','1101/COMBO','34',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('8ca6c805-a106-41cd-b992-6808177f2ee7','5603318001179','1101/LA9','13',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('b1d29cf5-fc5c-4973-ab4c-f7dc45a3a7ee','5603318001209','0902/DIRECTO','1',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('6afbc5a4-ebed-4936-8899-8d60c8b5bbc0','5603318001278','1101.SAL/BIDON','39',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('6632385a-7afa-43c1-a06f-14acb37cef64','5603318001292','1101.SAL/COMBO','34',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('d82a234f-d376-4dd9-8715-c1fc9715af95','5603318001315','DADO.SM/BIDON','40',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('1b67df1b-3f3d-4b6d-9330-1820129b304a','5603318001322','DADO.SM/COMBO','34',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('b5179c4f-2256-44c2-9669-26d96a851fd8','5603318001414','DADO.CM/BIDON','40',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('d6d97da0-1c7e-47fe-8ae7-481535e620d1','5603318001421','DADO.CM/COMBO','34',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('0fff3ec2-af51-42ee-87e2-39fa84ffae89','5603318001469','1102/COMBO','34',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('9c7d2f5e-c5a5-48ab-a96a-9c8c676bcab6','5603318001513','DADO.SP/BIDON','40',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('b3d91dc1-4a62-4237-a754-04b5890541ba','5603318001537','DADO.SP/COMBO','34',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('44aa49b6-2ec6-4b9d-9d77-ef49ef28e5de','5603318001674','DADO.CG/BIDON','40',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('8a03091b-caf4-4591-b1b8-bee16f1bb160','5603318002060','1502/BIDON','39',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('84eb632b-2a26-4ea3-a7ee-1ed5f43d4975','5603318002077','TEMFAM.12/LA10','15',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('90ba737a-ec0a-4d65-9b41-d315d2a4bbe4','5603318002183','TEMFAM.12/LA9','8',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('b0ece406-c88a-4a31-b65d-e0089e675a27','5603318002213','DADO.CP/BIDON','40',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('ec78baf8-d0ff-461b-a627-38bb1afd1c29','5603318002220','DADO.CP/COMBO','34',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('f5bc3082-ceef-4098-9452-12eb06c0abc9','5603318002503','DADO.CG/LA10','16',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('f40be881-ca99-4d46-887b-9d35574b6fbd','5603318002602','3102/BIDON','37',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('15ac158a-c56e-4f70-972d-d3d8b1736b8b','5603318002664','TEMPJN/LA10','14',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('fe0d6c4a-099a-486e-ab61-d6bbaf607d38','5603318002671','0702/BIDON','40',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('e078ffc1-2fb0-4062-b696-5c494e04ade3','5603318002688','0901/BIDON','39',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('e1cfad0b-986b-4267-b452-7fea71732138','5603318002695','0901/COMBO','34',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('d05f7a7b-b273-4460-924c-bcf9f0788bff','5603318002701','0701/BIDON','40',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('166ff3a5-e046-481b-8019-181690fba89d','5603318002886','SALILTEM/L850','5',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('bde92d64-cf89-4af6-9293-2d9bd7d55fa3','5603318003074','DADO.CM/LA9','10',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('649e509e-4836-453b-bff4-d0804152ba0d','5603318003098','DADO.CM/LA15','20',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('cda96b0a-12c2-4490-a6a8-961af3a36916','5603318003199','DADO.CM/LA15','25',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('76bb53e3-c8e4-4c46-b8de-894d671d05a7','5603318003265','0701.SAL/BIDON','40',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('444a4fd5-21ca-4562-8dd8-472b027a8d55','5603318003500','1702/BIDON','39',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('97cc0c1c-1d82-4ab7-b111-e64d3b4832b8','5603318003685','2901/COMBO','33',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('e4697cc8-e233-40be-827e-c79a36cf085a','5603318003937','2901.SAL/L400','24',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('9eadb495-7bf9-41b7-af08-a1bad72cc9ce','5603318004002','POMACE/BIGBAG','35',540,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('8b88f2a0-7b61-42b4-8acf-feaba5eb46e5','5603318004026','TEMFAM.12/LA15','18',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('20fc064a-fa95-491b-be93-bf7e27bbd7aa','5603318004125','DADO.CM/GPS','29',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('bbac37fc-12d1-47c0-b47a-e41fa8931d55','5603318004170','PDPS/LA15','19',1200,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('bc89791f-d2dd-40ca-b55a-0421c8f9aefe','5603318004194','DADO.SXP/BIDON','40',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('79a3ca1b-f1f0-4c00-ab88-981a093396be','5603318004224','DADO.SM.LEMON/COMBO','34',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('5a57162a-a72d-4e8d-8001-2ace78732935','5603318004279','0902/BIDON','39',730,1);
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('6f7c42d6-011f-4b8f-bc92-1f2790232a68','5603318004484','POLPA/BIDON','40',730,1);

INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('6874803a-de0f-4be2-87e1-34bfeecad835','51','A','2bc36edf-f21f-4de9-be7e-49b473ded50f',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('294ace1b-2ec7-4a60-9dfe-e7e283b549b1','51','B','663aa384-d826-4e95-b7d1-341aa2430c50',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('e6e028d0-789c-43b9-b2e9-1ff3e28af71c','52','A','866f8d65-1aed-4ad9-96ee-60912c267a16',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('193a3931-fd5d-4926-8a6b-7b12303030fd','52','B','3a85e232-a245-4854-8dad-580fd61fdb31',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('d50491c0-8c54-44db-807a-50243c3cf18a','53','A','a03b7aa7-f3d3-4e52-a8f0-d72d0a84d2c9',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('58383682-b219-4563-9c60-164f010f2fce','53','B','0d74be8e-cdb2-4263-bf8f-3a438b4e15fc',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('c1b5a2e1-4dda-43f7-b79b-3ee76ada3f9a','54','A','d5c0572d-3f37-4b6a-99cc-eb648964e102',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('88b99075-cc33-4333-8c1f-32fffd87fcab','56','A','4a6c2b53-94b7-41ef-812d-0b3c37c4d86d',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('73052e86-1326-423b-8af8-404dabfe4813','57','A','38d6db29-1cd4-46e0-a39b-94254d758818',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('1ae9c476-8442-4ebf-829c-275f5be67314','58','A','b0f10c70-a864-4f62-9cd2-989034dbfdc2',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('946ff17d-a3e0-4235-ab1f-9dab36a9c8b4','59','A','e22db7bd-134d-45cb-b66c-2b406ff5a028',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('4a91c816-1a09-4d58-b325-eca860d39fd4','59','B','4e5c6f56-61a5-4381-8508-4d04a31389c6',NULL,NULL,NULL,3,NULL);

INSERT INTO [dbo].[motivo_bajas] ([id],[codigo_baja],[nombre_baja],[descripcion_baja],[visible]) VALUES ('5313443e-f36b-1410-8cd9-00af0c2de9b7','M1','Fallo mecánico',NULL,'1');
INSERT INTO [dbo].[motivo_bajas] ([id],[codigo_baja],[nombre_baja],[descripcion_baja],[visible]) VALUES ('5b13443e-f36b-1410-8cd9-00af0c2de9b7','M2','Error de etiquetado',NULL,'1');
INSERT INTO [dbo].[motivo_bajas] ([id],[codigo_baja],[nombre_baja],[descripcion_baja],[visible]) VALUES ('5f13443e-f36b-1410-8cd9-00af0c2de9b7','M3','Contaminación cruzada',NULL,'1');
INSERT INTO [dbo].[motivo_bajas] ([id],[codigo_baja],[nombre_baja],[descripcion_baja],[visible]) VALUES ('6313443e-f36b-1410-8cd9-00af0c2de9b7','M4','Fallo de llenado',NULL,'1');
INSERT INTO [dbo].[motivo_bajas] ([id],[codigo_baja],[nombre_baja],[descripcion_baja],[visible]) VALUES ('6713443e-f36b-1410-8cd9-00af0c2de9b7','M5','Producto caducado',NULL,'1');
INSERT INTO [dbo].[motivo_bajas] ([id],[codigo_baja],[nombre_baja],[descripcion_baja],[visible]) VALUES ('7013443e-f36b-1410-8cd9-00af0c2de9b7','M6','Error de operador',NULL,'1');
INSERT INTO [dbo].[motivo_bajas] ([id],[codigo_baja],[nombre_baja],[descripcion_baja],[visible]) VALUES ('7e13443e-f36b-1410-8cd9-00af0c2de9b7','M7','Falta de materia prima',NULL,'1');
INSERT INTO [dbo].[motivo_bajas] ([id],[codigo_baja],[nombre_baja],[descripcion_baja],[visible]) VALUES ('8c13443e-f36b-1410-8cd9-00af0c2de9b7','M8','Fallo eléctrico',NULL,'1');
INSERT INTO [dbo].[motivo_bajas] ([id],[codigo_baja],[nombre_baja],[descripcion_baja],[visible]) VALUES ('9a13443e-f36b-1410-8cd9-00af0c2de9b7','M9','Error en peso',NULL,'1');
INSERT INTO [dbo].[motivo_bajas] ([id],[codigo_baja],[nombre_baja],[descripcion_baja],[visible]) VALUES ('a413443e-f36b-1410-8cd9-00af0c2de9b7','M10','Problema de presión',NULL,'1');
INSERT INTO [dbo].[motivo_bajas] ([id],[codigo_baja],[nombre_baja],[descripcion_baja],[visible]) VALUES ('ae13443e-f36b-1410-8cd9-00af0c2de9b7','M11','Error de mezcla',NULL,'1');
INSERT INTO [dbo].[motivo_bajas] ([id],[codigo_baja],[nombre_baja],[descripcion_baja],[visible]) VALUES ('b813443e-f36b-1410-8cd9-00af0c2de9b7','M12','Mantenimiento urgente',NULL,'1');
INSERT INTO [dbo].[motivo_bajas] ([id],[codigo_baja],[nombre_baja],[descripcion_baja],[visible]) VALUES ('c213443e-f36b-1410-8cd9-00af0c2de9b7','M13','Control de calidad fallido',NULL,'1');
INSERT INTO [dbo].[motivo_bajas] ([id],[codigo_baja],[nombre_baja],[descripcion_baja],[visible]) VALUES ('d013443e-f36b-1410-8cd9-00af0c2de9b7','M14','Retrabajo necesario',NULL,'1');
INSERT INTO [dbo].[motivo_bajas] ([id],[codigo_baja],[nombre_baja],[descripcion_baja],[visible]) VALUES ('de13443e-f36b-1410-8cd9-00af0c2de9b7','M15','Contenedor defectuoso',NULL,'1');

INSERT INTO [dbo].[roles] ([id], [rol], [llenadoras_permitidas]) VALUES('facd6f60-d96b-4e4a-8346-aee934a2704d', 'ADMINISTRADOR', 'TODAS');
INSERT INTO [dbo].[roles] ([id], [rol], [llenadoras_permitidas]) VALUES('ae074788-f2b6-4a7b-83eb-5c5ec94ec2a4', 'ENCARGADO_ASEPTICOS', 'TODAS');
INSERT INTO [dbo].[roles] ([id], [rol], [llenadoras_permitidas]) VALUES('38f00e04-d5e6-44e2-b1a5-39d98325dc2f', 'ETIQUETADO', 'TODAS');

INSERT INTO [dbo].[usuarios] ([id], [nombre], [password], [uuid_rol], [ruta_impresion_manual], [visible]) VALUES ('7e65433e-f36b-1410-8ce2-00af0c2de9b7', 'admin.auser', '$2b$10$OFIlYbUXTgLjEPLDD8vnaeDEkz3QNp43UxrLZxDpikEFLG.HnDq9W', 'facd6f60-d96b-4e4a-8346-aee934a2704d', '192.168.1.15', '1');
INSERT INTO [dbo].[usuarios] ([id], [nombre], [password], [uuid_rol], [ruta_impresion_manual], [visible]) VALUES ('8365433e-f36b-1410-8ce2-00af0c2de9b7', 'david.macias', '$2b$10$k5goICAYFI4xv3wOE15pZO.dMqAGz1yjyGh.NlSh0DrRxVz38dPFO', 'facd6f60-d96b-4e4a-8346-aee934a2704d', '192.168.1.15', '1');

INSERT INTO [dbo].[bartender_config] ([id], [protocolo_api], [host], [puerto], [ruta_api], [nombre_integracion], [comando]) VALUES ('c47301f4-220b-4a90-b4b0-32657ab31150', 'http', 'localhost', '80', 'Integration', 'IntegraciónServicioweb', 'Execute');
