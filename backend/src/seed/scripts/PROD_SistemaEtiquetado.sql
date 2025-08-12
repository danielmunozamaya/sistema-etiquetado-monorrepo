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

INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('63b5c072-5a80-4615-b922-70508cd26f7d','01','HORIZONTAL','HORIZONTAL',1,1);
INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('aa386ac7-6861-42f2-a8ab-5823ada78f95','02','MANZINI','MANZINI',1,1);
INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('07e997a5-01de-4ad6-b332-40c3d6d13271','03','MIAJADAS 1','MIAJADAS 1',1,1);
INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('3575e26b-8a87-4d00-a4df-7b70f41b1884','04','VERTICAL','VERTICAL',1,1);
INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('ed797b89-de4f-48b1-90bd-93e7ab826d17','05','MIAJADAS 2','MIAJADAS 2',1,1);
INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('2f36d0be-fb8b-4f64-aa71-a1a36f26128b','06','DADOS 1','DADOS 1',1,1);
INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('e68e7ffa-fea9-4435-8d5b-4fa2b0ade666','07','DADOS 2','DADOS 2',1,1);
INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('258f7db5-2b21-45dc-beda-0680da6d3930','08','ELPO','ELPO',0,1);
INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('5fc1e87d-3d34-4e63-85d5-d838c6af6956','09','POLVO 1','POLVO 1',0,1);
INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('805fe2a1-1969-484b-9095-3100026db329','10','GENOVASTERIL','GENOVASTERIL',0,1);
INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('ee0ca430-1390-4bfa-b30a-af6bb0e64e36','11','ASTEPO','ASTEPO',0,1);
INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('dc4c77b1-9ff0-4266-8dec-e8f5e09b466d','12','SECADERO - C3','SECADERO - C3',0,1);
INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('87f73073-5c12-41d5-a598-54c93a8fce43','13','POLVO 2','POLVO 2',0,1);
INSERT INTO [dbo].[llenadoras] ([id], [id_llenadora], [nombre_llenadora], [observaciones], [etiquetado_auto], [visible]) VALUES ('dd584b3c-4bf6-40a1-959a-e5d3982de25b','14','CONCENTRADO DIRECTO POLVO','CONCENTRADO DIRECTO POLVO',0,1);

INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('fa9722af-1798-47e8-baae-18a0bfe552a1','01','A','HORIZONTAL - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('caf8e716-783d-4611-9632-8ef5394d0cea','01','B','HORIZONTAL - B','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('c51e8042-7711-4bbf-8da2-6496c98ae775','02','A','MANZINI - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('1f5e5ddc-36f3-4caf-9f50-56d6aca6369b','02','B','MANZINI - B','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('d44acec9-621d-4c3d-9b24-82816f3472a6','03','A','MIAJADAS 1 - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('a82c3273-abcc-4472-bd6d-1ed72f04380c','03','B','MIAJADAS 1 - B','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('774d2144-c789-4e80-b150-54edd6552113','03','C','MIAJADAS 1 - C','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('5d34e91b-fd3f-4135-a2ae-4fbc4edf8aa3','04','A','VERTICAL - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('2461000f-5bb4-4015-8f22-eb60b0a659f2','04','B','VERTICAL - B','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('c5f6ec17-7f35-4332-b78c-b4d38432985c','05','A','MIAJADAS 2 - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('40c4e601-3408-47c0-90ff-cead554bd961','05','B','MIAJADAS 2 - B','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('fa810548-933b-40a5-b226-595e43d978a8','06','A','DADOS 1 - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('8964ed48-25bb-4030-819e-4d9b14d506ed','06','B','DADOS 1 - B','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('3636bb0a-17b8-4e98-a20a-b02a4ba19dcb','07','A','DADOS 2 - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('27286f4b-d476-426c-a4fe-cc6cf6c42c06','07','B','DADOS 2 - B','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('d59ff702-8fc4-487f-b829-d800c95c84b2','08','A','ELPO - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('2df4d194-549d-4eef-b67b-5204390dcf3f','09','A','POLVO 1 - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('d5b87a88-f993-4838-a52b-49313e547fa6','10','A','GENOVASTERIL - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('ae821f8b-8797-4415-8afe-9528e9667895','11','A','ASTEPO - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('9183542d-a8ba-45ac-8ce1-8cd54011d53f','12','A','SECADERO - C3 - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('2c683596-dd04-4dd3-9676-db587bf10ee6','13','A','POLVO 2 - A','192.168.5.43',1);
INSERT INTO [dbo].[cabezales] ([id],[id_llenadora],[id_cabezal],[nombre_cabezal],[ruta_impresion],[visible]) VALUES ('293a9425-c438-4aae-a559-2c74a438c733','14','A','CONCENTRADO DIRECTO POLVO - A','192.168.5.43',1);

INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('1564ed99-bf31-4a32-9e01-ab0b927b78c6','0501/BIB05','Tomato Paste 4/6 Brix - Passata / Triturado / BIB05','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('292e437c-689d-4b0f-8ce7-c82b86243f89','0701/BIB05','Tomato Paste 6/8 Brix - Passata / Triturado / BIB05','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('28506832-9484-4136-81ee-9fc329f6b343','0701/BIB10','Tomato Paste 6/8 Brix - Passata / Triturado / BIB10','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('87c591b3-5718-430b-9ca1-e5226ab3b4f0','0701/BIB20','Tomato Paste 6/8 Brix - Passata / Triturado / BIB20','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('ea82ce5c-9480-4dd8-aa33-20f7475794aa','0701/BIDON','Tomato Paste 6/8 Brix - Passata / Triturado / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('4984d356-1cd9-4a2d-ba0b-8de33f16aac3','0701/COMBO','Tomato Paste 6/8 Brix - Passata / Triturado / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('7bbe9ddf-6736-4a3b-b786-7a2c6ed3470f','0701/DIRECTO','Tomato Paste 6/8 Brix - Passata / Triturado / DIRECTO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('5e971839-235b-4b89-9082-67cfcfd5412c','0702/BIB20','TP 6/8 Brix Extruded Tomatoes - Tomato Crushed / BIB20','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('17406180-6022-455c-a0aa-82246695d2f9','0702/BIDON','TP 6/8 Brix Extruded Tomatoes - Tomato Crushed / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('66e796e9-08d8-4f6d-a1f5-2578c4496572','0901.BF/BIDON','Tomato Paste 8/10 Brix - Passata BABY FOOD / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('fbc770c4-551f-48e7-baa9-5235450a8e95','0901.BIO/BIB20','Tomato Paste 8/10 Brix - Passata BIO / BIB20','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('e174a067-c75e-4c75-9d58-d5ac1278b241','0901.BIO/BIDON','Tomato Paste 8/10 Brix - Passata BIO / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('1d43b0ba-b274-4569-90f6-66845085224d','0901/BIB10','Tomato Paste 8/10 Brix - Passata / Triturado / BIB10','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('ee03462e-2d77-48db-b1f4-19ecfb770c9f','0901/BIB20','Tomato Paste 8/10 Brix - Passata / Triturado / BIB20','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('b3bf1016-6e0d-40fc-bb50-affbd93e214b','0901/BIDON','Tomato Paste 8/10 Brix - Passata / Triturado / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('d73f4a9d-13d7-4bce-bef2-b75affca487c','0901/COMBO','Tomato Paste 8/10 Brix - Passata / Triturado / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('db5f6316-dc45-4c98-83bc-d39711ffaa86','0901/DIRECTO','Tomato Paste 8/10 Brix - Passata / Triturado / DIRECTO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('0c2395b3-69fe-461c-ab1b-c0f29f4859aa','0902/BIDON','Tomato Paste 8/10 brix - Pizza Sauce / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('d2af3ee1-d9e3-496d-a5a5-8c3157a1770f','0902/DIRECTO','Tomato Paste 8/10 Brix - Pizza / DIRECTO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('7ecb9cda-7ea6-41cb-8058-bcf6a3ce7ce0','1101.BF/BIDON','Tomato Paste 10/12 Brix - Passata BABY FOOD / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('a95cd36d-8158-4780-9892-df35656f7246','1101.BIO/BIDON','Tomato Paste 10/12 Brix - Passata BIO / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('4e382307-bef2-4cd4-a89b-0fafe1c4d83d','1101.SAL/BIDON','Tomato Paste 10/12 Brix - Passata con sal   / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('7c7c378f-5510-4ddb-9c1e-d529c43de919','1101.SAL/CISTERNA','Tomato Paste 10/12 Brix - Passata con sal / CISTERNA','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('ddca284d-3467-479b-9113-8a391f214c74','1101.SAL/COMBO','Tomato Paste 10/12 Brix - Passata con sal   / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('66fe9855-8959-4433-ad3f-05f27a23da09','1101.SAL/DIRECTO','Tomato Paste 10/12 Brix - Passata con sal   / DIRECTO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('7af7815e-5f84-47c0-9fbf-27352f2c3194','1101/BIB10','Tomato Paste 10/12 birx - Passata  / BIB10','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('34f6cbc3-68c5-4546-b417-4e1ec091e0df','1101/BIB20','Tomato Paste 10/12 birx - Passata  / BIB20','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('c63efcfc-ac98-40fd-82e3-8660295ed5a8','1101/BIDON','Tomato Paste 10/12 birx - Passata  / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('eeb1e755-8107-43c4-9979-a01746fe0d76','1101/CISTERNA','Tomato Paste 10/12 Brix - Passata / CISTERNA','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('5854cd51-640f-4554-8986-12b90aacccc7','1101/COMBO','Tomato Paste 10/12 birx - Passata  / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('e59a8567-d6ed-45a3-9b37-478eebfcba47','1101/DIRECTO','Tomato Paste 10/12 birx - Passata  / DIRECTO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('5c20247c-2808-404c-9289-eb53a2f4b643','1102/BIB10','Tomato Paste 10/12 Brix - Pizza Sauce / BIB10','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('abc0b34b-85b9-4ad6-a47f-c90c47c20b73','1102/BIDON','Tomato Paste 10/12 Brix - Pizza Sauce / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('4395ff49-fd78-4399-941b-3da9926db7d4','1102/COMBO','Tomato Paste 10/12 Brix - Pizza Sauce / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('fcb13539-e474-4952-9807-9b51e4d8872d','1301.BIO/BIDON','Tomato Paste 12/14 Brix - Passata BIO / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('24eb54c7-92e9-4d80-a884-2cd0f03a8ee3','1301.SAL/BIDON','Tomato Paste 12/14 Brix - Passata con sal   / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('a24b57fb-98db-48c6-a205-7735079f23d1','1301/BIB10','Tomato Paste 12/14 Brix - Passata / BIB10','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('9503b728-6bbd-41a4-9bfb-bda766aeb961','1301/BIB20','Tomato Paste 12/14 Brix - Passata / BIB20','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('4b16bda1-df3e-4fae-8b7a-d2afe42c7e76','1301/BIDON','Tomato Paste 12/14 Brix - Passata / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('0dd1d8d0-12f3-4776-8b84-6cfb923ee93a','1301/CISTERNA','Tomato Paste 12/14 Brix - Passata / CISTERNA','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('73e59fd2-838e-4792-b306-56c6904b00a2','1301/COMBO','Tomato Paste 12/14 Brix - Passata / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('9f903ade-6610-43cc-8682-6c5be2c34452','1301/DIRECTO','Tomato Paste 12/14 Brix - Passata / DIRECTO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('c5192bc2-5bb2-4066-bdaf-ba3152322f56','1302/BIB10','Tomato Paste 12/14 Brix - Pizza Sauce / BIB10','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('60cc2cac-5714-4e67-93f2-7af8cf63dd4b','1302/BIDON','Tomato Paste 12/14 Brix - Pizza Sauce / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('cdfd0571-4c07-4390-9c61-1d54b5798cf7','1501/BIB10','Tomato Paste 14/16 Brix - Passata / BIB10','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('6f21b618-39a0-47c5-b0dc-efcc9510f6bd','1501/BIB20','Tomato Paste 14/16 Brix - Passata / BIB20','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('be38ca49-78f1-4f2e-86a5-e11c648a6235','1501/BIDON','Tomato Paste 14/16 Brix - Passata / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('4edd704e-b7d5-423b-bd36-4bcc420d525b','1502/BIB20','Tomato Paste 14/16 Brix - Crushed Tomatoes / BIB20','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('bc3c6ba2-893f-4362-bcb5-5303e9f28cf0','1502/BIDON','Tomato Paste 14/16 Brix - Crushed Tomatoes / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('6bba5b47-11f1-4d3b-90a2-01a4b552ead0','1802/BIB03','Tomato Paste 17/19 Brix - Hot  Break / BIB03','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('51f03d44-2e3b-4705-81a0-5d6331f1aa4c','2302/BIDON','Tomato Paste 22/24 Brix - Hot  Break / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('e16a094c-1f9f-493f-b3d1-18e7b0083e27','2801.BIO/BIB10','Tomato Paste 28/30 Brix - Cold Break BIO/ORGANIC / BIB10','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('155d30da-1b85-48c9-9dc6-c1e4bdf397ea','2801.BIO/BIB20','Tomato Paste 28/30 Brix - Cold Break BIO/ORGANIC / BIB20','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('26900767-349b-461e-a15b-490328ba6f73','2801.BIO/BIDON','Tomato Paste 28/30 Brix - Cold Break BIO/ORGANIC / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('cd422fbb-6ce1-4752-99ac-89a868e1d7d5','2801.BIO/COMBO','Tomato Paste 28/30 Brix - Cold Break BIO/ORGANIC / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('3a08d849-ded3-439c-a4aa-fbd82696c79e','2802.BIO/BIDON','Tomato Paste 28/30 Brix - Hot Break BIO/ORGANIC / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('88d5fdcd-6a8a-4f87-bb49-845e5a698408','2802.BIO/COMBO','Tomato Paste 28/30 Brix - Hot Break BIO/ORGANIC / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('0de06282-e7ed-4f5a-9b50-9fb28c74ee2f','28SHB/BIDON','Tomato paste 28 Brix SHB  / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('e9c64191-7ebe-4023-b492-a46ec0237945','28SHB/COMBO','Tomato paste 28 Brix SHB  / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('0f002815-679a-4559-8ff2-763185c90f3a','28SHB/FRUCTUS','Tomato paste 28 Brix SHB  / FRUCTUS','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('175e0da5-0c15-4e6a-b1f0-cacb5ec20ebc','2901.BF/BIDON','Tomato Paste 28/30 Brix - Cold Break BABY FOOD / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('4c357924-5958-47ee-9f96-4b461dc41cbb','2901.HL/BIDON','Tomato Paste 28/30 Brix - Cold Break HL / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('2646e3b9-993d-4b34-a152-4386f4a6096e','2901.INT/BIDON','Tomato Paste 28/30 Brix - Cold Break INTEGRADA / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('ec5ade87-edd0-40e8-854a-cba34e93682f','2901/BIB05','Tomato Paste 28/30 Brix - Cold Break / BIB05','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('1369cf64-18e8-46cb-897f-80e51cf235c4','2901/BIB10','Tomato Paste 28/30 Brix - Cold Break / BIB10','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('4f542cef-fa6d-4a4a-aa1c-aeb125165641','2901/BIB20','Tomato Paste 28/30 Brix - Cold Break / BIB20','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('a412e723-9eae-4e58-8d75-7d3f07a7202e','2901/BIDON','Tomato Paste 28/30 Brix - Cold Break / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('d6918748-6b8c-43de-a48a-1d1963c9a732','2901/COMBO','Tomato Paste 28/30 Brix - Cold Break / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('8fa6eb38-3206-4e39-9b60-1210b1bb4331','2901/DIRECTO','Tomato Paste 28/30 Brix - Cold Break / DIRECTO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('1bbd1ac2-7c5a-472c-9238-7df95cbd0d75','2902.3M/BIDON','Tomato Paste 28/30 Brix - Hot  Break 3MM / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('abcb7ff1-8a0f-458b-a433-67d0a09783a5','2902.INT/BIDON','Tomato Paste 28/30 Brix - Hot  Break INTEGRADA / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('8001f7dd-9ea3-4698-b613-97b3829c745b','2902/BIB05','Tomato Paste 28/30 Brix - Hot  Break / BIB05','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('b0517d02-7116-4825-bf81-11e5bc2204ad','2902/BIB10','Tomato Paste 28/30 Brix - Hot  Break / BIB10','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('d4acfcf8-52da-40e7-931f-cbb11f8575fa','2902/BIB20','Tomato Paste 28/30 Brix - Hot  Break / BIB20','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('bb318d7c-45d8-41d0-8bec-76e73dd0a859','2902/BIDON','Tomato Paste 28/30 Brix - Hot  Break / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('1e1295e4-94aa-45a2-b736-e6b29b149a65','2902/COMBO','Tomato Paste 28/30 Brix - Hot  Break / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('ba012b2d-3524-40de-8714-e1a8fc893629','2902/DIRECTO','Tomato Paste 28/30 Brix - Hot  Break / DIRECTO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('bc7ff232-1be7-471e-92b5-b22aced386b5','2902/GOODPACK','Tomato Paste 28/30 Brix - Hot Break / GOODPACK','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('282b1c44-0418-443a-bd93-9c894ddc9a6d','2903/BIDON','Tomato Paste 28/30 Brix - Warm Break / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('c44406c6-99e9-4ed9-a35f-d8c4015622c3','3101.BIO/BIDON','Tomato Paste 30/32 Brix - Cold Break BIO/ORGANIC / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('5258fd98-9285-4951-946d-b05696a09a46','3101/BIDON','Tomato Paste 30/32 Brix - Cold Break / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('dd77d0b9-84f8-4817-9669-52d2cab9c0ec','3101/DIRECTO','Tomato Paste 30/32 Brix - Cold Break / DIRECTO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('df187a91-bf39-44fb-895d-3305e8e74f46','3102.BIO/BIDON','Tomato Paste 30/32 Brix - Hot Break BIO/ORGANIC / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('83321fdb-4627-464e-8d46-c5e65f503173','3102/BIDON','Tomato Paste 30/32 Brix - Hot Break / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('272fe19d-749c-4ebf-8e22-945ef6b2d0a0','3102/COMBO','Tomato Paste 30/32 Brix - Hot Break / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('ebe17b16-2c9a-44d6-9f56-e475dd484afd','3202/BIDON','Tomato Paste 31/33 Brix - Hot Break / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('22b6ccaf-8c02-4d7a-a37f-baf7c7b8352d','3701.BF/BIDON','Tomato Paste 36/38 Brix - Cold Break BABY FOOD / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('f920c9d9-4594-4004-8273-453fe1ae9194','3701.BIO/BIDON','Tomato Paste 36/38 Brix - Cold Break BIO/ORGANIC / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('e774ee9c-6d49-47a9-a850-614b5f814df9','3701/BIB20','Tomato Paste 36/38 Brix - Cold Break / BIB20','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('5c823682-83e2-451d-83a1-a54486ce5191','3701/BIDON','Tomato Paste 36/38 Brix - Cold Break / BIDON','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('7d6e7a06-5aac-4a5a-8d9c-cf2d594e65b5','3701/COMBO','Tomato Paste 36/38 Brix - Cold Break / COMBO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('6b81e0bc-09d3-4980-a633-2e7beab1c9a5','3701/DIRECTO','Tomato Paste 36/38 Brix - Cold Break / DIRECTO','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('6b425333-8dcb-40ae-9e26-0d329e225259','3701/FRUCTUS','Tomato Paste 36/38 Brix - Cold Break / FRUCTUS','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('7b81980c-1765-41ca-94b0-366fceb6ed1b','CTC45/BIB20','TOMATO JUICE CONCENTRATE 45 ºBRIX','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('a8b41ea5-6454-466f-bf4c-bd006a37d8ac','CTC60/BIDON','TOMATO JUICE CONCENTRATE 60 ºBRIX','CONCENTRADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('0283949b-8c79-4f3d-ad33-222b4905bed0','DADO.CG/BIDON','Tomato Dices (C-G)  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('e7e202b0-54c7-4c93-af11-f527df52e946','DADO.CG/COMBO','Tomato Dices (C-G)  / COMBO','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('b7a59705-4fd3-4a30-912c-ad992fd08398','DADO.CM/BIB05','Tomato Dices (C-M)  / BIB05','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('80da3cce-6c06-4f03-bfa4-25039fc48a75','DADO.CM/BIB10','Tomato Dices (C-M)  / BIB10','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('cde2d7a5-41a8-45ae-93bc-c222435447a1','DADO.CM/BIB20','Tomato Dices (C-M)  / BIB20','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('83988593-2f04-43ad-a642-42dddc9c7ca5','DADO.CM/BIDON','Tomato Dices (C-M)  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('95a76970-4b6a-4259-beee-cefbbab04f0a','DADO.CM/COMBO','Tomato Dices (C-M)  / COMBO','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('2958b09f-cc17-4f73-8628-4d4e3d119d89','DADO.CM/GOODPACK','Tomato Dices (C-M) / GOODPACK','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('2117f22a-e325-4eae-ae40-f061014ee0d5','DADO.CP/BIB10','Tomato Dices (C-P)  / BIB10','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('2b0ffae0-7d28-415c-837f-2d487584fd60','DADO.CP/BIB20','Tomato Dices (C-P)  / BIB20','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('2584d127-ec21-40c0-8c65-094fc7a95dcc','DADO.CP/BIDON','Tomato Dices (C-P)  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('4bc81347-26ee-4431-bb53-cb101d661258','DADO.CP/COMBO','Tomato Dices (C-P)  / COMBO','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('2de9b45f-82ff-4333-9c11-44b51bf1c041','DADO.CXP/BIB10','Tomato Dices (C-XP)  / BIB10','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('23aa04fd-cf1a-417d-a9f6-c7aa963e9f23','DADO.CXP/BIDON','Tomato Dices (C-XP)  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('8ba7b27d-b09f-4504-8cde-c6d61191bef9','DADO.SG/BIDON','Tomato Dices (S-G)  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('215ba928-9d57-4ed6-bb60-8078cc2ff731','DADO.SM.LEMON/BIDON','Tomato Dices (S-M) Lemon juice  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('a6c7560d-cafc-4fbf-adc3-17ad8c26ee37','DADO.SM/BIB10','Tomato Dices (S-M)  / BIB10','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('170972aa-b58a-4c28-adc5-3a056d0a53c9','DADO.SM/BIB20','Tomato Dices (S-M)  / BIB20','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('28de6307-09ba-47f0-9bdc-49f9148cf667','DADO.SM/BIDON','Tomato Dices (S-M)  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('9826f6c6-ecc6-46b0-bb33-7c007e7b9d2a','DADO.SM/COMBO','Tomato Dices (S-M)  / COMBO','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('3d033247-3667-4920-8854-21471847ac6a','DADO.SP/BIB10','Tomato Dices (S-P) - Concas  / BIB10','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('b42716a3-ff1b-4ca0-bde7-e2a838d6f69a','DADO.SP/BIB20','Tomato Dices (S-P) - Concas  / BIB20','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('716c42cf-7866-4033-a22a-36c4b8516ffb','DADO.SP/BIDON','Tomato Dices (S-P) - Concas  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('91ab7d2c-7319-4084-bcaa-0abadeb90681','DADO.SP/COMBO','Tomato Dices (S-P) - Concas  / COMBO','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('0ec01846-8dab-484e-8487-88ada29854cd','DADO.SXP/BIB03','Tomato Dices (S-XP)  / BIB03','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('6ecf71f1-34b7-4c76-8c1d-9847b17bed0f','DADO.SXP/BIB10','Tomato Dices (S-XP)  / BIB10','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('0dc48518-94f9-4b4e-ad5e-e179bb8d1884','DADO.SXP/BIB20','Tomato Dices (S-XP)  / BIB20','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('fbb172b4-07f7-4df9-9b1c-f83eb2190447','DADO.SXP/BIDON','Tomato Dices (S-XP)  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('afbc32a0-e814-4152-9c27-6726c2880b36','DBF.SG/BIDON','Tomato Dices (S-G) BABY FOOD','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('919bfa71-4c9f-468f-8f9c-19d2beb3b58e','DBF.SM/BIDON','Tomate Dices (S-M) BABY FOOD','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('08d92c15-d808-4105-b3ad-ed18d0148e80','DBF.SP/BIDON','Tomato Dices (S-P) BABY FOOD','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('e2b08547-14d5-4fa6-af6b-326c65cf0d20','DBIO.CM/BIDON','Tomato Dices (C-M) BIO/ORGANIC / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('0852e2af-2e6e-4212-9a6e-ae197dfba3a1','DBIO.SG/BIDON','Tomato Dices (S-G) BIO/ORGANIC / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('10c3085d-4233-4d88-a378-1a237876679b','DBIO.SM/BIB10','Tomato Dices (S-M) BIO/ORGANIC / BIB10','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('46163010-c3ff-4792-b51f-598e6c7826b0','DBIO.SM/BIDON','Tomato Dices (S-M) BIO/ORGANIC / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('5c524e6b-e37c-4e0a-a82e-f11a1eac2bea','DBIO.SP/BIDON','Tomato Dices (S-P) BIO/ORGANIC  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('24c841e5-ee13-48ff-91e9-034d7849d1ff','DBIO.SXP/BIDON','Tomato Dices (S-XP) BIO/ORGANIC  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('831d0049-bb81-4d7e-8538-fa4b8a088dc6','DINT.CM/BIDON','Tomato Dices (C-M) - INTEGRADA  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('0697124b-0b58-4c78-8ade-51d1087f1a6c','DINT.CP/BIDON','Tomato Dices (C-P) - INTEGRADA  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('43b9e892-ddea-4aba-9d5a-4cfb61f1998b','DINT.CXP/BIDON','Tomato Dices (C-XP) - INTEGRADA  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('2d5809a1-5b2f-4218-83b0-3773b7959f05','DINT.SM/BIDON','Tomato Dices (S-M) - INTEGRADA  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('e794833a-3541-4e64-8b3d-29d66a358ce8','DINT.SP/BIDON','Tomato Dices (S-P) - INTEGRADA  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('569879fc-de3d-4959-b1fb-351dabd22f77','DINT.SXP/BIDON','Tomato Dices (S-XP) - INTEGRADA  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('74e9cef6-c1db-47c5-880c-354cf15a3932','FIBRA/CAJA20K','Fibra - Tomato Fibre  / CAJA20K','SECADERO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('09357512-23e7-4ec1-839e-11bf601da275','KETCHUP.060/BIB20','KETCHUP 060 / BIB20','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('5ded081c-fff3-4fd1-9d27-5154df83b4d7','KETCHUP/BIB03','Ketchup  / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('9e6da13c-3f1a-49bd-ae43-d28a477b324d','KETCHUP/BIB10','Ketchup  / BIB10','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('e37c9c8f-9942-4abb-98e5-1f05a2e0874f','KETCHUP/BIB20','Ketchup  / BIB20','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('25e22114-c2ed-44ba-a2f3-299c08381afa','KETCHUP/COMBO','Ketchup  / COMBO','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('0afc94a8-5f66-4269-ba8b-dc26343e9ead','NT300.BF/BIGBAG','Tomato Powder NT-300 - Cold Break BABY FOOD / BIGBAG','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('30f855ba-61bd-453f-bed3-b49e6ba4fe2a','NT300.BF/CAJA25K','Tomato Powder NT-300 - Cold Break BABY FOOD / CAJA25K','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('7af8e310-8a13-4cd0-a980-f49c062c32d4','NT300.BIO/BIGBAG','Tomato Powder NT-300 - Cold Break BIO/ORGANIC / BIGBAG','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('5d78e79e-acc4-476c-a05a-7e25faefdbd0','NT300.BIO/CAJA25K','Tomato Powder NT-300 - Cold Break BIO/ORGANIC / CAJA25K','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('35305416-723a-49c2-b23b-bd40c0812a7a','NT300.BIO/SP3000GR','Tomato Powder NT-300 - Cold Break BIO/ORGANIC / SP3000GR','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('c09a60b2-987a-4caf-b884-1fc675e28223','NT300/BIGBAG','Tomato Powder NT-300 - Cold Break / BIGBAG','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('4e985ced-5114-425d-96f5-e45271d0b692','NT300/CAJA20K','Tomato Powder NT-300 - Cold Break / CAJA20K','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('874af24b-f601-4ccc-a121-21a6c23b2afc','NT300/CAJA25K','Tomato Powder NT-300 - Cold Break / CAJA25K','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('1b4c6138-6347-4773-8943-9d14d7f5f405','NT300/SP125GR','Tomato Powder NT-300 - Cold Break / SP125GR','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('74b45611-4417-4e12-b409-b249fe1eaa59','NT300/SP3000GR','Tomato Powder NT-300 - Cold Break / SP3000GR','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('51f3788b-9a55-4f86-a58e-19449f08f757','NT300/SP750GR','Tomato Powder NT-300 - Cold Break / SP750GR','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('549e6281-641a-48b8-9ab9-c41fff03dbb1','NT310.F/CAJA25K','Tomato Powder NT-310 - Cold Break FINE / CAJA25K','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('d3e7efc9-22a7-4bc2-9af3-6ae64c2bd028','NT350.30A/CAJA25K','Tomato Powder NT-350 (30A) / CAJA25K','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('c62dedab-1dbb-42b3-980d-e2761888fd17','NT350.SEMI/BIGBAG','Tomato Powder NT-350 - SEMI  / BIGBAG','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('ab3828c4-ed87-467d-ae27-1581d6bc8815','NT350.SEMI/CAJA25K','Tomato Powder NT-350 - SEMI  / CAJA25K','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('ffed6010-638c-4292-8be9-13b4439badc6','NT3500/CAJA20K','Tomato Powder NT-3500 - Cold Break (GR) / CAJA20K','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('64486792-0b80-4146-9187-d204c9583a23','NT3500/CAJA25K','Tomato Powder NT-3500 - Cold Break (GR) / CAJA25K','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('01ce676d-d7ba-4332-8e80-bdd9b249a16a','NT400.BIO/CAJA25K','Tomato Powder NT-400 - Hot Break BIO/ORGANIC / CAJA25K','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('c6a43572-65ec-4516-aef4-949feb16ef33','NT400/BIGBAG','Tomato Powder NT-400 - Hot Break / BIGBAG','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('1f2e94eb-0833-43c1-b4c6-2e86593537a2','NT400/CAJA25K','Tomato Powder NT-400 - Hot Break / CAJA25K','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('2ac282ff-7aaa-45bb-8dd3-1d57dcf3e665','NT4500/CAJA25K','Tomato Powder NT4500 - Hot Break / CAJA25K','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('7746b155-810c-49e3-b317-bdeb8e2c78d5','NT600/CAJA25K','Tomato Powder NT-600 - Cold Break / CAJA25K','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('9563d94a-5232-4916-94a6-dbd8265fd12a','PISTO/BIB10','Pisto "CONESA"  / BIB10','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('9a8a4215-2880-43d4-b386-335257346e7e','PISTO/BIB20','Pisto "CONESA"  / BIB20','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('9e6192e0-bf8b-4a30-9e6e-19dfc3c21460','PISTO/BIDON','Pisto "CONESA"  / BIDON','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('e574d14d-305c-4300-9d25-2e95f490b472','POLPA/BIB05','Polpa tomatoes  / BIB05','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('2d3b0d65-718a-4ecf-a133-c6b300b54321','POLPA/BIDON','Polpa tomatoes  / BIDON','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('9d86eee2-2b4d-41b7-a1ca-fb5a9953abcb','POLPA/GOODPACK','Polpa Tomatoes / GOODPACK','DADO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('5aed5520-8baf-4200-95fd-b01d81a0d796','POMACE/BIGBAG','Tomato Pomace  / BIGBAG','SECADERO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('03e754d9-edc8-4147-b338-01d6e6c1f87e','POMACE/CAJA15K','Tomato Pomace  / CAJA15K','SECADERO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('94187545-3b11-4a6b-9ee3-67e1b8f61980','POMACE/CAJA17K','Tomato Pomace  / CAJA17K','SECADERO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('9c5e4bb3-5734-443e-860f-9ccb00638017','POMACE/CAJA20K','TOMATO POMACE / CAJA20K','SECADERO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('f44f8a32-eaea-48ad-9dff-ecac031ca284','SALBAR.017/BIB03','Salsa Barbacoa 017  / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('120e340a-700c-4501-a0a9-c053dad5ceba','SALBAR.017/BIB20','Salsa Barbacoa 017  / BIB20','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('1d0313e7-8fc4-4613-bccb-7ec610967703','SALBAR.017/BIDON','Salsa Barbacoa 017  / BIDON','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('327f8852-648c-43e0-93d2-8fc14d4e3107','SALBAR.017/COMBO','Salsa Barbacoa 017  / COMBO','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('d500ddcd-7ec0-4050-9a50-0cd661e81ccd','SALBAR.022/BIB03','Salsa Barbacoa Extra 022  / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('cf1c42b3-2ce3-44a2-b251-4f062f411c65','SALBAR.022/BIB05','Salsa Barbacoa Extra 022  / BIB05','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('57e321d4-800b-4fda-a7a3-fc42066451bc','SALBAR.022/BIB10','Salsa Barbacoa Extra 022  / BIB10','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('9ea27ff8-124e-4a19-bd04-a062537d5f27','SALBAR.022/BIDON','Salsa Barbacoa Extra 022  / BIDON','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('c9d57281-66c3-4e01-af7f-3037551c657c','SALBAR.042/BIB03','Salsa Barbacoa 042  / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('30580254-972c-4512-bbe4-d7e0f5bdb199','SALBAR.048/BIB03','WHISKEY GLAZE SAUCE / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('3281251f-a106-46f9-a95b-2181f77c018f','SALBAR.062/BIB03','Salsa Barbacoa 062 / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('530357cb-4002-41c9-993f-3ceb48f08b48','SALBAR.064/COMBO','Salsa Barbacoa 064 / COMBO','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('27dd3a92-87b9-4d21-a2d7-b29c60cfe449','SALBAR.069/BIB03','Salsa Barbacoa 069 / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('88e6df04-b282-4e29-9fb3-5cb009d2f9be','SALBAR/BIB03','Salsa Barbacoa  / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('dc59a130-e43c-4b68-8784-f7272d12eee6','SALBAR/BIB10','Salsa Barbacoa  / BIB10','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('9573d93a-ccd9-41d3-8329-0f01131b06b0','SALBAR/BIDON','Salsa Barbacoa  / BIDON','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('0e41d579-41fe-4da3-93ef-95bc6bba2880','SALBAS/BIDON','Tomato Sauce Basilico 017  / BIDON','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('76d0bca0-d31a-4e58-b55d-cfbc3aefcb4b','SALCAT/BIB05','Salsa Catering  / BIB05','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('2dec147c-7aa0-4c21-9fe8-b402b56e6538','SALCAT/BIDON','Salsa Catering  / BIDON','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('6ee5eadd-ab8b-4b26-9951-92011e042c2f','SALCAT/COMBO','Salsa Catering  / COMBO','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('7ef3c668-40fd-430f-b524-e53a1aab466d','SALCP61/GLCM','SALSA TOMATE CP61 / GLCM','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('70aae2c4-3a5e-4685-9776-455923baf3ed','SALCPZ/BIB10','Salsa Tomate Cambalache Pizza  / BIB10','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('4cb1f113-e32e-4658-9703-dbcc7b2e5f5a','SALDOM.EU/BIB03','SALSA TOMATE DOMINOS EUROPA / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('a9470177-c991-4b7e-a742-7b87a38043f6','SALDOM.EUV5/BIB03','SALSA TOMATE DOM EUV5 / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('a323f26f-2e2b-4c66-a51d-8035160be774','SALDOM/BIB03','Salsa Tomate DOMINOS  / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('354e23e4-a3cd-46e0-a4f1-af73b3d379be','SALDOM/BIB05','Salsa Tomate DOMINOS  / BIB05','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('dbf968e4-2d35-481b-bc1f-4b241a03b85d','SALDOM/BIB10','Salsa Tomate DOMINOS  / BIB10','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('d273a51e-4b29-4c9b-875c-e1e48ac53465','SALDPZ/BIB10','SALSA DPZ / BIB10','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('a046770e-fcba-4d82-aa2c-7543256d9999','SALMUL/BIDON','Tomato Sauce Multiuse 019 / BIDON','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('1804f01c-2a4b-44a3-b2d1-291f4404a62c','SALNAP/BIB03','Salsa Napolitana / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('b9fff3c9-47aa-4e03-92f3-0b924d2d04d8','SALNAP/BIB05','Salsa Napolitana / BIB05','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('93731560-82ee-41fd-b198-687df81c6624','SALNAT/BIDON','Tomato Filling Sauce / BIDON','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('406956f5-0095-42ed-8693-c999305987fa','SALPES/BIDON','Pesto Filling Sauce  / BIDON','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('14c88b7c-bc33-43ce-bf7c-f1eb4fc8ed04','SALPGI / BIB03','SALSA PASTA GIRASOL / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('113b2918-cad5-4004-abd3-67e5261db50d','SALPIM/BIB03','Salsa  Pizza MV  / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('a6af07e4-300a-427f-ba43-5d5eb2d0f6b8','SALPIM/BIB05','Salsa  Pizza MV  / BIB05','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('c39d91ac-c4b3-4779-adb8-1ca278a64580','SALPNY/BIB10','Salsa Pizza NY  / BIB10','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('0b5b5e34-e0db-4d85-96ca-a8a858c021ec','SALPOL/BIB03','Salsa Tomate Polpa  / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('201be5f0-59e6-4026-b4da-19c2794f45a8','SALPOM/BIB05','Salsa Tomate POMOLINO - Pizza Topping / BIB05','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('6f72c456-dad0-4c82-b69a-bda8e0aacf72','SALPOM/BIB10','Salsa Tomate POMOLINO - Pizza Topping / BIB10','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('dade153f-559d-4f6a-b84c-6256ae855173','SALPOM/BIDON','Salsa Tomate POMOLINO - Pizza Topping / BIDON','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('2e7f171d-151a-4809-87d7-a2c8c22e6e68','SALPPJ/BIB03','Papa Johns Pizza Sauce / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('12924822-1603-479b-8a58-3565f702ab57','SALPZC/BIB03','SALSA PIZZA C ESPECIADA / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('c735ac19-8b0a-42e4-b7b6-0850a369c519','SALPZC/BIB05','SALSA PIZZA C ESPECIADA / BIB05','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('ccc23633-c80a-4482-888a-84d321061ae9','SALPZD/BIB10','Salsa Pizza D  / BIB10','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('2261aa44-6890-494b-93b0-bb64ea8caf50','SALPZD/BIDON','Salsa Pizza D  / BIDON','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('19327889-622b-4a63-a226-b2f626f50e6b','SALPZK/BIB10','Pizza Sauce K  / BIB10','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('eb18ddcc-2b0f-4f5c-a0de-9b6e813afbe9','SALPZP/BIB03','Salsa Pizza P  / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('91fc0889-7fb0-46ec-bc56-938a68695f31','SALPZP/BIB05','Salsa Pizza P / BIB05','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('a8a4c5a1-3490-40b1-8657-bff940998b99','SALPZP/BIDON','Salsa Pizza P  / BIDON','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('55b3edef-4fb8-4090-86c9-325437a876b0','SALPZP/COMBO','Salsa Pizza P  / COMBO','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('192ce900-b44f-4fdd-9344-4174a3b8feba','SALPZV/BIB03','Salsa Pizza V  / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('a93bbbfc-5e95-4d4a-8333-5410693a93ce','SALPZV/BIB05','Salsa Pizza V  / BIB05','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('274acd4b-5e88-4b0e-a40a-bd9fae7152b6','SALSA66/BIB03','Salsa Tomate Concentrado TP66 / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('f37af104-a2d0-467b-8846-e12620df404f','SALSA67/BIB03','Salsa de Tomate DF67 / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('7528e18d-9406-4e65-a107-a2e2fecf2e76','SALSA68/BIDON','Salsa de Tomate PS68 / BIDON','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('7a3c12b5-fff7-4976-b039-adec3b84ab03','SALSPS/BIDON','Spice Pizza Sauce F  / BIDON','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('eebb1e78-f4f1-4717-bd7f-4a6bd0266c0f','SALTAC/BIDON','Salsa Tomate CPF  / BIDON','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('a2f2a803-3f4b-47fc-a9b2-fec1997b8da0','SALTAC/COMBO','Salsa Tomate CPF  / COMBO','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('a0fcf094-04a5-42ae-8a5c-af570ef180fa','SALTCG/BIB05','Salsa Tomate Coulis G / BIB05','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('590ccc28-0947-4c2e-90b1-77a6e7acf879','SALTCG/BIB10','Salsa Tomate Coulis G / BIB10','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('e5d27dd1-5a21-48c6-9299-1dce96d61a9e','SALTCG/BIDON','Salsa Tomate Coulis G / BIDON','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('647326c5-54a8-4c0a-9617-d118be591c6e','SALTCO/BIB10','Salsa Tomate Coulis O / BIB10','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('3fce8970-88f0-47e6-8fcf-6b842fc5e64c','SALTOC/BIB03','Salsa Tomate C  / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('70e5d3a0-befd-4cd4-abfd-44e6a3930c42','SD300.WA/BIGBAG','Tomato Powder SD-300 - Cold Break WA / BIGBAG','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('e4b73765-451f-4105-9986-e2844db683f4','SD300.WA/CAJA25K','Tomato Powder SD-300 - Cold Break (With A) / CAJA25K','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('f84231f5-f266-418d-a334-6b7b259657f3','SD300/BIGBAG','Tomato Powder SD-300 - Cold Break / BIG BAG','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('e7e1156d-47cb-4fda-b487-67d630f5d970','SD300/CAJA25K','Tomato Powder SD-300 - Cold Break / CAJA25K','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('25113306-1cfb-4490-8b01-e9268386b66e','SD310.F/BIGBAG','Tomato Powder SD-310 F - Cold Break / BIGBAG','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('4366df69-9bb2-4d07-943b-120dc43009f2','SD310.F/CAJA25K','Tomato Powder SD-310 F - Cold Break / CAJA25K','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('b3e54017-de1a-41f5-a96a-3bfa4401349a','SD400.WA/CAJA25K','Tomato Powder SD-400 -  Hot Break (With A) / CAJA25K','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('f2cb7a36-4960-4808-b98c-dd11ef843592','T350/BIGBAG','Tomato Powder NT-350(10a) - Cold Break / BIGBAG','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('40537efe-f1ca-4776-bbdf-dd134f788e6b','T350/CAJA25K','Tomato Powder NT-350(10a) - Cold Break / CAJA25K','POLVO','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('25a799bf-c37d-4a2e-b801-a8e4becd7516','TEMFAM.12/BIB03','Temperado Famosa 12/14 / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('9f7efdce-6a5e-4c84-93ae-152c783e9c76','TFRITO.BF/BIB20','Tomate Frito BABY FOODS  / BIB20','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('ac1f789e-953f-4a70-85af-ddc503ee939c','TFRITO.BIO/BIB20','Tomate Frito ECOLOGICO  / BIB20','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('0df5aac2-f1ab-4d0c-8b83-ec912eeeba49','TFRITO.BIO/BIDON','Tomate Frito ECOLOGICO  / BIDON','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('b2533367-fdd7-47ff-8917-c1485a0200b6','TFRITO.CAS/BIB20','Tomate Frito Casero / BIB20','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('27f61414-36cb-4217-8876-ffba53a12ae1','TFRITO.EXT/BIB10','Tomate Frito Extra  / BIB10','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('f6fee307-c745-4dc4-9256-e7f13edaaf96','TFRITO.EXT/BIB20','Tomate Frito Extra  / BIB20','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('547eb708-a503-45e9-a61a-631920ff707d','TFRITO.EXT/BIDON','Tomate Frito Extra  / BIDON','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('ab49e0ab-f80c-4086-9f32-3c45e38497f6','TFRITO.GSOL/BIB03','TOMATE FRITO GIRASOL / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('3050ca2f-fa26-4faf-bb19-9f1e74a0baeb','TFRITO.NAT/BIB03','Tomate Frito Natural / BIB03','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('838257ee-584d-4903-b4cd-9b66a8b9e92e','TFRITO.OLI/BIB20','Tomate Frito con Aceite de Oliva  / BIB20','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('495eda7f-d80f-49c0-a2e4-327225d72f23','TFRITO/BIB05','Tomate Frito CONESA  / BIB05','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('22cd394f-bbc1-426e-b5bd-b67eda1c43f5','TFRITO/BIB10','Tomate Frito CONESA  / BIB10','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('6d897cba-d445-4256-9bf0-965b4f7b41a6','TFRITO/BIB20','Tomate Frito CONESA  / BIB20','SALSA','1');
INSERT INTO [dbo].[productos] ([id],[id_producto],[nombre_producto],[familia_producto],[visible]) VALUES ('6b3f408d-ba19-4cc2-8c0f-5a0f95347a60','TFRITO/BIDON','Tomate Frito CONESA  / BIDON','SALSA','1');

INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('2ea9e7c4-6c52-47ee-b26a-414b0a9687b4','1','Producto en directo 1000 Kg',1000.00,1000.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('2c320520-dff0-4b0a-be1a-6605993f6901','2','Pallet con 44 cajas de 25 Kg',1100.00,1152.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('cb36c949-8623-4d72-bcd6-2077f0e6de6d','3','Pallet con 40 cajas de 25 Kg',1000.00,1050.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('41f13250-9be3-4cf4-a1e8-812e31f18402','4','Pallet con 27 cajas de 25 Kg',675.00,715.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('b6deb959-ee25-46c7-9e54-02c2100ec879','5','Pallet con 16 cajas de 25 Kg - BBE 24m',400.00,431.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('e1309f57-25c2-4abf-bb15-431009800b89','6','Pallet con 44 cajas de 25Kg - BBE 24m',1100.00,1152.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('041bd1f5-22b6-47fe-b03b-9298c8433d20','7','Pallet con 44 cajas de 25Kg - BBE 18m',1100.00,1152.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('054afecf-c508-46f5-b0f9-3ccf5e34ecc3','8','Pallet con 40 cajas de 25Kg - BBE 24m',1000.00,1050.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('df4601fc-8aef-4f45-a8a9-824f9cc36790','9','Pallet con 40 cajas de 25Kg - BBE 18m',1000.00,1050.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('d04cb839-c2c2-43e9-b948-b9f12ab0a485','10','Pallet con 40 cajas de 25 Kg',1000.00,1050.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('87774556-aa70-47a2-b981-694fe933f8ef','11','Pallet con 39 cajas de 25 Kg',975.00,1024.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('27904f92-df47-48dc-8066-efc7dfe4fc94','12','Pallet con 36 cajas de 25 Kg',900.00,947.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('9947e446-5363-4e74-b339-05889f971431','13','Pallet con 33 cajas de 25 Kg - BBE 24m',825.00,870.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('fc3e46ac-2ff1-484c-93ba-c5b66d291703','14','Pallet con 33 cajas de 25 Kg',825.00,870.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('97c5add1-b8b6-45f0-bbdf-dd9d431b12ab','15','Pallet con 30 cajas de 25 Kg - BBE 24m',750.00,792.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('131f606c-193c-48ed-a592-9c1179bee5cf','16','Pallet con 30 cajas de 25 Kg',750.00,792.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('7855f5e0-bebd-4200-be2f-33f52bcaeb20','17','Pallet con 30 cajas de 20 Kg',600.00,642.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('7a6ec4b8-9aa9-4764-a00d-6a0474fe90ea','18','Pallet con 28 cajas de 25Kg - BBE 24m',700.00,740.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('fbf31794-ddd7-4998-83a5-a8c314e172d6','19','Pallet con 28 cajas de 25Kg - BBE 18m',700.00,740.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('c94d0254-7c75-4f4b-8dc5-4bc908b1aec6','20','Pallet con 28 cajas de 25 Kg - BBE 18m',700.00,740.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('041510f1-fef8-476e-a84b-d3e4a9e02afc','21','Pallet con 28 cajas de 25 Kg',700.00,740.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('fdd836c8-ae84-4e86-a974-f0c819d0ede2','22','Pallet con 28 cajas de 20 Kg',560.00,600.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('ea40209c-91be-4a9d-9054-cb8370cd0006','23','Pallet con 24 cajas de 25Kg - BBE 18m',600.00,637.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('f475f099-1dda-46bb-b706-9a128bb0c1b2','24','Pallet con 24 cajas de 25 Kg',600.00,637.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('bd556df2-d8c0-4790-b3a9-600207cee06c','25','Pallet con 22 cajas de 25Kg - BBE 24m',550.00,586.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('048152a8-ddd3-44da-af10-f2a2a7315c39','26','Pallet con 22 cajas de 25Kg',550.00,586.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('123833a8-385b-4cc2-bd88-5e8dbbb72879','27','Pallet con 20 cajas de 25Kg - BBE 24m',500.00,534.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('5028e845-cc74-4d40-b043-f33992188860','28','Pallet con 20 cajas de 25 Kg - BBE 18m',500.00,534.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('186280de-d2bc-4cb3-87bc-eb194fd70cb9','29','Pallet con 20 cajas de 25 Kg',500.00,534.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('0b7af8e6-5a67-4b56-b093-5eb3d25b95af','30','Pallet con 16 cajas de 25 Kg',400.00,431.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('0dc1ed6e-f91f-4688-96d7-822537e7b858','31','GLCM de 1000 Kg',1000.00,1220.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('c49c4d51-eca4-4b67-afff-3b072d08acbc','32','Fructus con bolsa de 1300 Kg',1300.00,1408.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('b8558204-feae-4314-a7b1-46577b8ad2a5','33','Fructus con bolsa de 1250 Kg',1250.00,1358.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('57ab1642-25c4-4056-b737-8452d428d319','34','Combo con bolsa de 1200 Kg',1200.00,1280.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('752a4e8c-bfd1-416a-b0cc-eb9fb91d0381','35','Combo con bolsa de 1250 Kg',1250.00,1330.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('ec4a6f08-ff79-4ce0-a41f-bfb616ab8fae','36','Combo con bolsa de 1000 Kg',1000.00,1080.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('cec59c73-0b2e-455c-86c3-105cad758b84','37','Caja de 25 Kg',25.00,26.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('4514c3e1-28dc-4196-ae5e-e093ef938801','38','Caja de 20 Kg',20.00,21.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('70db5b3c-c561-48ba-bf34-2a10490c26b9','39','Caja con 6 Stickpack de 3000 gr',18.00,19.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('386b2435-c1d2-4140-b234-73acadfc1aad','40','Caja con 24 StickPacks 750 gr',18.00,19.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('32097ec9-0ca1-44e5-ab69-f73fa3361697','41','Caja con 112 StickPacks 125 gr',14.00,15.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('0299afbc-8e46-4285-9451-d207672d68b7','42','Big Bag de 950 Kg POMACE',950.00,970.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('ae221781-c634-4a89-9adf-42329bc6b235','43','Big Bag de 900 Kg POMACE',900.00,920.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('92deae39-ce02-49ea-9e61-aa51d93d1028','44','Big Bag de 900 Kg',900.00,910.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('f400b756-d381-491c-9a42-54e9b82e3882','45','Big Bag de 850 Kg POMACE',850.00,870.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('411017d7-d2a8-471b-8610-54a91bc30f56','46','Big Bag de 800 Kg POMACE',800.00,820.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('6e39a6d1-657f-4b9c-b533-8fb796d8a77b','47','Big Bag de 800 Kg',800.00,820.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('71dd8a23-c3a3-4f13-afbd-248538f5904b','48','Big Bag de 750 Kg POMACE',750.00,770.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('d150dce7-a073-4022-9429-65265376b923','49','Big Bag de 700 Kg POMACE',700.00,720.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('8a46a3c0-db34-49e1-a8e8-2e666fccfd7e','50','Big Bag de 700 Kg',700.00,715.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('5b717e44-4ea8-4e24-9331-c5e422371e62','51','Big Bag de 650 Kg POMACE',650.00,670.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('a59ca5b3-1384-42f7-97a3-39a2b660f14a','52','Big Bag de 600 Kg POMACE',600.00,620.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('db40e5d9-18ce-4aec-8607-11185b3da7e9','53','Big Bag de 550 Kg POMACE',550.00,570.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('85769280-5365-40af-a8bc-83686818bb66','54','Big Bag de 500 Kg POMACE',500.00,520.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('ece5a2d1-a5de-4f47-be74-7360b21f287e','55','Big Bag de 500 Kg',500.00,515.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('e15aa981-ac0c-40bc-9bfe-d4a70454eb45','56','Big Bag de 450 Kg POMACE',450.00,470.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('f38deabd-1461-4746-bd9a-b615911b1b39','57','Big Bag de 450 Kg',450.00,465.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('5abc8957-45cd-41e6-8a20-90d0ba816845','58','Big Bag de 410 Kg POMACE',410.00,427.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('8062c44b-1b28-4864-8361-b1ac77174f76','59','Big Bag de 400 Kg',400.00,415.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('8c783721-d09f-4311-9992-0aac7b7d2c27','60','Big Bag de 380 Kg POMACE',380.00,400.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('335d4775-c8b1-4987-9e66-241cea5501cd','61','Big Bag de 1300 Kg POMACE',1300.00,1320.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('1acc978b-4d69-4e43-808d-ccc1d8c4ef95','62','Big Bag de 1200 Kg POMACE',1200.00,1220.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('5e65557c-f48f-49be-8005-1aac3c2f7a2f','63','Big Bag de 1000 Kg POMACE',1000.00,1020.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('ff9f7955-781b-4281-b1e8-100205b4ab9f','64','Big Bag de 1000 Kg - BBE 18m',1000.00,1010.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('1289ec59-6f2f-4a30-9b20-aee6746b9e37','65','Big Bag de 1000 Kg',1000.00,1010.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('70df8970-f203-4691-8b52-d85e9aa31e5d','66','Bidon con bolsa de 250 Kg',250.00,260.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('bf63ad3a-5615-4624-8b3d-917a068fa02d','67','Bidon con bolsa de 245 Kg',245.00,255.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('91a81531-6aa9-4d90-aeda-0f8d502083d9','68','Bidon con bolsa de 240 Kg',240.00,250.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('c192fee4-bd28-4955-8a73-3e8020eab989','69','Bidon con bolsa de 225 Kg',225.00,235.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('6160470e-a758-421d-bbe5-b081f5c8342b','70','Bidon con bolsa de 220 Kg sin AC',220.00,230.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('e9cf78bf-1cfc-48d2-9140-37ad2f01ef1f','71','Bidon con bolsa de 220 Kg',220.00,230.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('64cfcb85-a295-44e2-9c16-2010c5f43e90','72','Bidon con bolsa de 215 Kg',215.00,225.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('759f1ed8-63fd-43eb-9a2d-0aac548a8093','73','Bidon con 7 bolsas de 20 Kg',140.00,150.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('b2234e3e-92b2-47e2-8914-63f261b7d0c8','74','Bidon con 14 bolsas de 10 Kg',140.00,150.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('1c91a34a-7be5-45fd-b789-f5f82e5efab3','75','Bidon con bolsa de 215 Kg / Sin AC',215.00,225.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('1fad836b-e168-4b62-88df-a29887745f84','76','Bidon con 52 bolsas de 3 Kg',156.00,166.00,'1');
INSERT INTO [dbo].[presentaciones] ([id],[id_presentacion],[nombre_presentacion],[peso_neto],[peso_bruto],[visible]) VALUES ('b1e4da1c-a0f5-4db9-a4f9-3c135d1bdd2f','77','Bidon con 32 bolsas de 5 Kg',160.00,170.00,'1');

INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('2abdb106-4bdd-4154-8d52-e46752ec828c','8436029250027','3701/DIRECTO','1',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('9e93a25d-cdf2-45d2-ac44-96b56ff2b80d','8436029250058','3701/BIDON','67',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('60beb5b8-e4ef-4fc6-bddc-01be58ce2650','8436029250089','3701/BIDON','68',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('abeae8b0-ed3b-4845-89ea-a1bb42b78456','8436029250157','2901/BIDON','68',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('d37fdd27-326e-4827-a4e9-a8ab50cb22b9','8436029250164','2901/COMBO','34',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('4703e271-5e8f-42d9-918a-59bf1678288e','8436029250195','2901/DIRECTO','1',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('5b759686-3490-4f4d-870e-8cd574cbd1ba','8436029250256','2902/BIDON','68',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('00404d00-503c-4d8c-a925-840b0cc03958','8436029250263','2902/COMBO','34',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('2cad6050-72ef-4259-ba2d-4f5250939612','8436029250355','2902.3M/BIDON','68',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('02d7dcd0-8993-4888-9301-4a6ae4652536','8436029250409','2802.BIO/BIDON','68',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('d92b2b3b-21a8-49e5-9489-8103c45bd2f2','8436029250416','2802.BIO/COMBO','34',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('faf05cf9-f25a-48b4-bb50-eea8b76bbcf6','8436029250454','2801.BIO/BIDON','68',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('1baa2ef4-9d5a-4ef6-b54e-723a33c09729','8436029250478','2901.HL/BIDON','68',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('968f5aeb-dadd-4a7b-a14c-e3d614c0a705','8436029250560','2302/BIDON','69',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('d1c7bc49-f015-4c47-9ba6-a21b2ef8a70c','8436029250645','1502/BIDON','71',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('feb23370-31a6-40a4-92f5-c842881b0108','8436029250690','NT300.BF/CAJA25K','24',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('196df5ee-f20c-4d23-ac35-8aebdb34d81b','8436029250744','1302/BIDON','71',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('ce2082fa-4ca6-4b23-87d7-f3e1646c926a','8436029250782','NT300.BF/CAJA25K','37',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('ea810d31-4724-4974-8fa7-fed5f19973fd','8436029250843','1102/BIDON','71',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('457aa255-31ef-462b-98f3-1655f56f055f','8436029250942','1301/BIDON','71',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('0032f7a7-31d7-4fcb-97d0-7a32df62f968','8436029251048','1301.SAL/BIDON','71',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('d379ae28-f056-445a-a9fe-dcf16f24aadd','8436029251086','SALSPS/BIDON','71',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('41766fd9-884b-4867-9173-93ed6b402db8','8436029251093','NT400/CAJA25K','18',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('b0c65478-ce82-4111-9d7b-ad6e9da7753f','8436029251147','1101/BIDON','71',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('ec69b800-d0d4-440e-8082-1810090a7a5e','8436029251246','1101.SAL/BIDON','71',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('f6bd4b96-745e-4319-8edb-9e26db807aa8','8436029251314','DADO.SM/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('2de477b7-ff5f-4843-a3e5-0cf769f9cf24','8436029251321','DADO.SM/COMBO','36',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('05f2749b-4b67-4437-880b-a35dafaee790','8436029251413','DADO.CM/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('69b65862-1e0d-4962-98eb-f2bbb73b1a5e','8436029251420','DADO.CM/COMBO','36',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('6d9df8f4-316d-4317-a3ad-ac0d8c1378d7','8436029251604','NT300/CAJA25K','37',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('41cfb4de-371b-4cdd-9ab7-4e51163d102f','8436029251611','NT300/BIGBAG','57',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a427af3e-a36e-4e14-a38e-4abb50883b88','8436029251628','NT300/BIGBAG','55',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('f7e188eb-248c-404b-afda-47e89069433c','8436029251703','NT400/CAJA25K','37',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('422d3d48-0fc3-4d6f-88ca-cdf9e40645ad','8436029251710','NT400/BIGBAG','57',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('059b98d5-ff2d-4909-9ddb-aba632aa4b56','8436029251727','NT400/BIGBAG','55',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('21e4c3c9-10bd-450d-bf73-3605daf1470d','8436029251734','NT400/BIGBAG','65',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('d4668582-3adf-4e90-aa7e-c24a1e55c616','8436029251741','NT400/BIGBAG','44',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('ce48d2f5-2c1d-4264-be76-816431ef9f25','8436029251765','NT400/BIGBAG','59',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('f2c6a00f-d5bb-443a-a310-2df4c836c92d','8436029251840','NT400.BIO/CAJA25K','37',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('5f425f15-d933-48a9-b8e9-ac1ee83d7df8','8436029251857','NT300/BIGBAG','44',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('3eedf512-de35-4673-abba-dadcfdafa352','8436029251864','NT300.BIO/CAJA25K','37',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('297dc9ec-ca12-44e8-8e1b-d16c356895a3','8436029251871','NT300.BIO/BIGBAG','55',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('1e133f7c-64d4-43fd-bc0d-b3eee10e119c','8436029251949','1501/BIDON','71',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('6d433bc2-8a08-4069-828e-b302842289bf','8436029251994','2902/DIRECTO','1',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('54fb21ce-aeca-46a0-8db5-32e7b899a094','8436029252090','0701/COMBO','36',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('1149998b-d610-43cf-92dc-aa92f41e9bde','8436029252144','0701/DIRECTO','1',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('cc9eb789-b02a-4458-b6ee-4a3be7eb37f4','8436029252151','0901.BF/BIDON','71',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('71374a4c-8504-442a-8c10-39096ee2679c','8436029252182','0701/BIB05','77',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('13e37c54-e5b2-4b9e-9905-86c50f743328','8436029252199','0901/DIRECTO','1',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('9880953a-5700-450e-8f67-39c399b39a40','8436029252212','DADO.CP/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('1a87591e-9440-4d29-95ee-8cad311a29a1','8436029252229','DADO.CP/COMBO','36',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('13b39e9f-bc67-472b-98be-aaac6800617b','8436029252281','1301/DIRECTO','1',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('d9b1e7c4-61aa-4e55-ba78-94879526cf89','8436029252298','1101.SAL/DIRECTO','1',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('cee07347-a592-4a88-862f-d1e0ffde13e1','8436029252311','DADO.SP/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('4bd39b80-63ee-4256-aa9c-28e337d88e3a','8436029252397','DADO.CM/BIB05','77',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('cc017045-a0c9-4c16-be98-75bcbe35ecd8','8436029252410','DADO.CG/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('000865ea-0920-45b8-a4d8-748b08028b46','8436029252427','DADO.CG/COMBO','36',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('4c48bb71-9606-4adb-b4a4-1b87ac6bd5f0','8436029252519','DADO.SG/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('48da685d-5847-4711-801e-5f63d169bb4f','8436029252724','0701/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('7255dc1d-e7bc-447c-b9e3-78f063a91552','8436029252748','0702/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('fe8cad08-bc7b-4b8e-97e3-ab3356648539','8436029252915','0901/BIDON','71',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a3c37bc6-979b-4a8f-a676-41b889ea1c9d','8436029253059','PISTO/BIDON','72',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('cd387b82-368e-4a5f-a9af-ca099be3ff4a','8436029253134','3102/BIDON','68',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('3f3490db-e919-48be-a1fb-f3a0753e01a3','8436029253141','3102/COMBO','34',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('4fead011-6587-43e8-86b3-ca1fd21c57a8','8436029253172','DBIO.SM/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('55475b81-1580-46e4-951a-77c10726f76f','8436029253189','DBIO.CM/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('937ce4d1-6b3b-4d2a-9da4-b4e3207fb1b4','8436029253196','0901/COMBO','36',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('b00c0f6d-25ee-4a48-ab15-6d440b1c2301','8436029253394','SALDOM/BIB03','76',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('7a055fc6-f6ff-4c1f-b4bf-0c3b67e5039f','8436029253509','NT310.F/CAJA25K','37',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('43121e4b-7fd7-47f1-9759-4ed177a54265','8436029253523','NT310.F/CAJA25K','29',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('dfc3b277-6e94-4ae7-92fc-968a3d36ff8e','8436029253578','NT310.F/CAJA25K','10',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('436eb2d4-1433-4733-b354-4878dcc55488','8436029253660','NT300/CAJA25K','15',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('56b0e7d2-6a9c-450c-ad0b-c013a8d1f0ec','8436029253677','NT300/CAJA25K','27',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('61244cdd-a784-4858-ae77-388674a4e531','8436029253684','NT300/CAJA20K','17',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('1261fd5a-440d-4973-aed2-1b9f3d2518ee','8436029253691','NT300/CAJA25K','21',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('2598e4d5-b683-41a5-a9d3-69f10b0cdb0d','8436029253707','NT300/CAJA25K','30',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('aed05bdf-5a26-4533-92cb-d59381a44278','8436029253714','NT300/CAJA25K','29',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('e0d6bd0b-6a35-44f7-b167-8ddf86d4439c','8436029253721','NT300/CAJA25K','24',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('679510fa-0346-4a78-ad65-fe005e740439','8436029253738','NT300/CAJA25K','4',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('f99efb23-b114-450c-9569-10b98548d87f','8436029253745','NT300/CAJA25K','16',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('f9e536d1-6bd2-49f8-bbdd-1d1934892662','8436029253752','NT300/CAJA25K','12',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('5a2ed18c-5ee7-4e12-98c3-0feba663d76e','8436029253769','NT300/CAJA25K','10',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('4b68b677-d7ba-428a-b169-d89c47a72742','8436029253776','NT300/CAJA25K','8',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('70b00dad-a38b-4ba3-bc41-83f2548791a1','8436029253783','NT300/CAJA25K','6',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('c494e6dc-987f-48a7-af16-52eb961781c4','8436029253790','NT300/CAJA25K','24',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('ee18f573-e44d-4cb3-82ed-b486f36cfc09','8436029253806','NT400/CAJA25K','30',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a459244a-9aa1-4a23-9af5-48e06156ed38','8436029253813','NT400/CAJA25K','29',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('f2ee52ad-3422-4151-a44c-3921a41d6223','8436029253820','NT400/CAJA25K','24',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('0253a0ac-4d8a-4fa4-a6a4-8e28050b70b7','8436029253837','NT400/CAJA25K','4',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('d8045508-f65a-41f6-b72a-7fb2e72b928e','8436029253844','NT400/CAJA25K','16',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('6e4c91c2-9b71-4f0b-92bf-3cb1a4430cbc','8436029253851','NT400/CAJA25K','12',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('cfb8f480-7301-40cf-b7ef-c27316e6b088','8436029253868','NT400/CAJA25K','10',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('2f86d1a8-869c-41ef-9d5f-1875d63d2289','8436029253875','NT400/CAJA25K','8',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('10c7da97-4077-4299-8cba-65b4f59f6bb6','8436029253882','NT400/CAJA25K','12',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('564b86fb-7291-46d6-87cd-b8a66a33b795','8436029253899','NT400/CAJA25K','23',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('12f2b484-ebcb-49cb-acc4-e965d7713b7e','8436029253905','NT400.BIO/CAJA25K','16',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('1a30b2fe-27b1-4fee-ab5f-51e80011f613','8436029253912','NT400.BIO/CAJA25K','29',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('1bc4aace-54bb-4f00-a602-7b7ea5c2609b','8436029253929','NT300.BIO/CAJA25K','29',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('ae2b7e5c-e725-4c72-8335-c30035bab797','8436029253998','NT400/CAJA25K','9',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('2e048ce5-699d-4035-b686-2bb23442d1a0','8436029254018','NT300/CAJA25K','9',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('3a37e683-43f0-4f62-95d6-472e50015dee','8436029254025','NT3500/CAJA20K','22',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('58c0dc1d-9c25-4134-9b0e-fcd7e216aca0','8436029254032','NT3500/CAJA20K','38',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('b3d21d62-d077-4155-8473-bcf75ebb4402','8436029254063','TFRITO/BIDON','71',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('59118caa-3dad-4233-b2ea-b941c764e97c','8436029254124','NT300/CAJA25K','2',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('14b1e5d5-fa6c-40c5-87e6-dffde620b7fb','8436029254186','NT300/CAJA25K','11',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('e9acacca-5a39-4cff-88d1-d2ad339b7502','8436029254209','T350/CAJA25K','37',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('95fa6331-d11f-49b8-b452-1f5974909ecb','8436029254223','T350/CAJA25K','29',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('aef241f3-d503-4dc7-aaf6-1b6f6db21d00','8436029254230','T350/CAJA25K','24',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('9dea150b-ff66-4faa-9882-bca0e565faa4','8436029254254','T350/CAJA25K','16',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('77126434-7544-4c00-97eb-77d836a949c4','8436029254292','T350/BIGBAG','55',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('147f6dc8-b56f-47e0-89b1-8f611fcfefd9','8436029254339','NT3500/CAJA25K','10',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('724656e6-c33e-4915-8394-3e7210f3dad4','8436029254346','NT350.30A/CAJA25K','37',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('1bd8fda8-58b5-4c77-a444-f8618d7b6774','8436029254353','NT350.30A/CAJA25K','29',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('306bfbb9-5780-4c4d-9c6b-92c976e7f344','8436029254360','NT350.30A/CAJA25K','24',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('7d1f903b-3dbe-4101-91e9-f2e039a415f8','8436029254377','NT350.30A/CAJA25K','30',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('5a6ec3fd-9ab3-4591-9bba-7e73020dc59d','8436029254407','NT300.BIO/CAJA25K','24',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('ac5c78ed-1d24-4634-a874-033f6d0229fb','8436029254452','NT350.SEMI/CAJA25K','30',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('87e76104-3a62-4699-9918-bb04b70bb334','8436029254469','NT350.SEMI/CAJA25K','29',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a69cd468-3e7a-4c3a-a901-0cf6636f64ad','8436029254698','3101/BIDON','68',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('c39ba255-ee45-461a-88d5-3bbb0f9f8e87','8436029254735','2901.BF/BIDON','68',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('dacd7c8d-f21f-4a81-aab7-f08b17469192','8436029254889','TFRITO/BIB05','77',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('c6146cdc-8c98-42f7-a002-c361a6613c5b','8436029254902','SALTAC/COMBO','36',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('6abbd416-748b-4322-a3a2-a2c1bcf55804','8436029254919','SALBAR.022/BIB03','76',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('9ae77f97-c7bb-4fee-b30d-1c6521328d8a','8436029254926','NT300/CAJA25K','25',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a2e5fcca-6f54-4383-b97f-f2bb7f79f2a3','8436029254940','SALBAR.017/BIB03','76',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('dc7dec6a-8731-4dc6-8eb8-71fcb44567a2','8436029254957','NT300.BF/BIGBAG','55',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('2f2e8600-999d-4d8b-bd1d-38229a9dd81b','8436029255053','NT300/CAJA25K','18',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('5520a455-942d-47d0-8c49-e38ef7ff8044','8436029255190','1101.BF/BIDON','71',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('aee144c5-df51-4b0c-b5c8-1c0dc77a9dc8','8436029255206','28SHB/BIDON','68',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('d59bcb9d-a72d-47a2-af75-add25c1bd9ef','8436029255213','28SHB/COMBO','34',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('354fe138-1269-4ac2-a7ae-8fbba0d6c356','8436029255220','1101.BIO/BIDON','71',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('53bc2174-69d5-4db8-b294-edac438501f1','8436029255237','NT300.BIO/CAJA25K','21',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('0495e2b0-d88a-48ed-8004-c3b551c5a5d1','8436029255343','SALBAR/BIDON','69',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('0f7bcd7f-16cf-4ca9-a443-d1cba8245c0b','8436029255411','NT300.BIO/CAJA25K','10',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('684a66c5-b252-4b86-af10-e1e1db749872','8436029255442','NT300/BIGBAG','50',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('6fe3c075-2d65-40c2-a549-cbde4869d934','8436029255503','SALBAR/BIB03','76',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('d05c5db0-a6ed-4c3d-8681-ca1b9560134a','8436029255572','DBIO.SP/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('6fa11d94-846a-4245-ba72-eda704023712','8436029255657','2901.INT/BIDON','68',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('0137aa90-d326-4514-9627-70ed648e91c3','8436029255664','2902.INT/BIDON','68',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('22e91f74-5769-4c2a-b3c2-be9491ca07f5','8436029255671','DINT.SP/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('afa074d1-0e80-468a-bad9-0f4311ff67c8','8436029255688','DINT.SM/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('6bc380c9-896f-42a0-934e-6059f2c35273','8436029255695','2801.BIO/COMBO','34',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('92c4ff69-ea84-4407-bdfe-b16760191a6a','8436029255701','2901/BIB20','73',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('87e6d765-e20f-4391-a923-af02ec89259f','8436029255718','POLPA/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('ac96c257-5240-4ac6-9acd-d2933387ede4','8436029255725','NT300/CAJA25K','14',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('64b86090-ef3b-48d2-a7fb-4774be8c9434','8436029255732','2901/BIB10','74',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('6d17872d-7a05-4458-9f71-ccbb1a3f4427','8436029255749','1301/BIB20','73',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('11fdd21b-53d6-4f92-b729-0812e871d7a9','8436029255756','1102/BIB10','74',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('0aff4115-7c40-4592-944c-0ffbbadd1863','8436029255763','TFRITO.EXT/BIB10','74',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('1cbebbb4-ea14-4475-9c3b-aa5713aae655','8436029255794','DADO.CP/BIB20','73',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('51d9525b-2eb7-43f0-b2f6-7cd5546fac5e','8436029255800','DADO.SM/BIB10','74',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('6279e0f4-8600-4baf-9908-fa7ae2f62ad6','8436029255817','SALPOM/BIB10','74',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('348a2772-9599-4a50-9f89-ae2f81a8855d','8436029255824','0701/BIB10','74',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('b287b2e9-1d45-4940-901f-a82d8bb10aaf','8436029255909','DADO.SM/BIB20','73',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('e0981cf0-2e4d-49c5-bc3f-15025fac1168','8436029255916','DADO.CM/BIB20','73',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('1713b06b-8899-4c11-95ae-0d30b0bcbfb9','8436029255947','DADO.CM/BIB10','74',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('c0755ea8-b505-4f24-b5b0-36b3ad365b7f','8436029255954','SALCPZ/BIB10','74',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('870e8af9-9184-44ec-be51-fd15be7d6e73','8436029255985','SALDOM/BIB10','74',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('1a49c63c-1984-4cca-b25f-d9e4ec2378a2','8436029256005','NT400/CAJA25K','2',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('5f011d63-df09-4a4a-8423-8e97940ecf68','8436029256074','TFRITO/BIB10','74',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('bb085f18-6098-4f6f-b811-79f2da91fdbf','8436029256081','TFRITO/BIB20','73',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('73e7c1ef-5095-46bf-bc72-c2feb3e202b2','8436029256104','DADO.CP/BIB10','74',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('7c3b59d1-6784-4769-9030-9b45be9f5050','8436029256111','TFRITO.OLI/BIB20','73',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('8a54465d-ff76-4150-841a-b6d349545ec1','8436029256135','SALPZD/BIDON','71',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('643a1f7c-c60d-4418-aead-939505d517cf','8436029256166','1101/BIB10','74',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('612fd924-2816-43a5-9ce1-eba020cced77','8436029256173','1101/DIRECTO','1',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('e9a5d941-8fff-4da1-8025-42db2a7d6fbd','8436029256197','1501/BIB10','74',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('4b31ef23-de12-440e-bbeb-a2bf0a80d9a3','8436029256203','0901/BIB10','74',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a764187d-96b7-4342-802e-14155c9be87a','8436029256210','1302/BIB10','74',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('e948fa13-0a21-4cba-b0dc-e7aa78b58203','8436029256227','1501/BIB20','73',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a78ea027-f204-46dc-838e-d025525e568e','8436029256265','0901.BIO/BIDON','71',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('e2f16efd-a7e3-4823-b259-4ce5ea78c76c','8436029256272','NT310.F/CAJA25K','7',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('dbb2e14d-0f4a-4b8b-a75d-697a7f7e0385','8436029256289','KETCHUP/BIB10','74',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('df853f40-9ea5-4b6b-859a-843c0b3f0264','8436029256302','SALBAR.017/BIDON','71',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('46749d42-ccb1-4718-90c9-4281df81a330','8436029256319','NT350.SEMI/CAJA25K','37',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('9beb6026-9e84-41a4-8688-eb27784479ba','8436029256326','SALTOC/BIB03','76',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('3e526ed0-cf9a-4630-8e8d-9e1805146839','8436029256357','SALTCG/BIB05','77',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('b860f659-f788-48ee-830b-3a857a6e8def','8436029256364','SALTCO/BIB10','74',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('d7ddadc8-ead3-42d7-8413-313f26cac4af','8436029256371','SALBAR.022/BIB10','74',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('529d4cfd-e0ce-4f95-a597-a04010f4b982','8436029256432','TFRITO.CAS/BIB20','73',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('c827a369-39b0-4c5f-9ad1-84c60ec0bcfd','8436029256456','TFRITO.EXT/BIDON','71',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('7f2ee6dd-84b5-45a0-b78a-b4f45df45104','8436029256470','SALBAR.017/COMBO','36',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a9346d7d-2553-4f07-9a78-70cabfed4628','8436029256494','SALBAS/BIDON','72',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('eb5f3ac7-8f51-487d-9a89-5782391a801b','8436029256500','SALMUL/BIDON','72',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('8254d279-9b51-42da-8554-360d8ccacae5','8436029256517','TFRITO.BIO/BIB20','73',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('2c0f07c2-1468-4f65-a94e-c20ae325c4d3','8436029256555','PISTO/BIB20','73',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('1d360ceb-021d-4a16-902a-5a6db1f8d9ad','8436029256579','POMACE/BIGBAG','46',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('660aedfb-f8c5-4df9-9d6d-0127139fff14','8436029256586','POMACE/BIGBAG','58',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('4a6ca6c4-f55f-4cb9-bd23-82d3a2355bbd','8436029256609','DINT.CM/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('1ec9aa11-4a4c-4fe0-aab6-633f63bdd604','8436029256616','DINT.CP/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('1ef695ad-bb84-44b5-8fdd-3a6b03a217fa','8436029256623','NT350.SEMI/BIGBAG','55',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('551454a5-2ddf-4d60-8c71-a812dfc20a21','8436029256630','POMACE/BIGBAG','49',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('d5d2ef6c-43ee-47f6-b0bb-4280be4e31bb','8436029256685','3701.BIO/BIDON','67',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('bb1f12aa-6c57-4191-8448-031616d3b654','8436029256692','POMACE/BIGBAG','51',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('083ea613-fb3b-4810-9b9a-26f9e849b013','8436029256715','2801.BIO/BIDON','69',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('593b9e4f-4314-42fc-a3f0-853be502ed88','8436029256722','2802.BIO/BIDON','69',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('f0487093-99e5-4fe6-b0b6-6e3ee0b83395','8436029256739','3701/BIB20','73',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('e701e653-e899-48b7-9132-55923c18134d','8436029256760','NT300.BIO/CAJA25K','16',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a617b98c-98d7-4a76-bafc-ee2e64ec37b7','8436029256807','NT300/CAJA25K','5',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('46151ad3-958d-4963-bb17-c1ef1c04a5b3','8436029256821','2801.BIO/BIB20','73',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('289daa41-6ccc-4ace-8313-5413d7be0163','8436029256845','NT350.SEMI/BIGBAG','59',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('01c9f866-2ce9-492e-8258-7a9cd9ae10e6','8436029256852','SALPOM/BIDON','72',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('6043aadc-5885-4248-96c8-a3c62382357c','8436029256869','SALPZD/BIB10','74',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('35064c67-bb08-449b-96b2-e2ff74ac450f','8436029256913','SALTAC/BIDON','71',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('ac9be4cc-e681-4fc8-a593-5023ee08307d','8436029256920','KETCHUP/COMBO','36',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('f7a6baec-c52f-4cba-85d8-f3c06339fdec','8436029256951','3101/DIRECTO','1',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('c0b61d9a-bddf-4566-bfca-b220777ff1a7','8436029256968','1301.BIO/BIDON','71',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('4d0dfa95-e44f-4e70-9358-265720bee336','8436029256975','2903/BIDON','68',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('03741f91-7db5-4399-8f6e-878bff49e2d0','8436029256982','DINT.CXP/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('cc2ca2ab-c449-4ca2-b930-5d004cd717bb','8436029256999','DINT.SXP/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('056fb335-3213-4bee-b37c-5f3dd082537f','8436029257002','DADO.SXP/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('6cc8c4fb-7be8-46ac-8777-5b547f3c707f','8436029257019','DADO.CXP/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('0582d9b7-6786-44bc-a7c6-8c27e27db218','8436029257026','DBIO.SXP/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('b39c88b6-fbc0-4849-9420-dbb3a4592369','8436029257064','0501/BIB05','77',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('acef344c-89e4-45e5-9317-1c091fc57c97','8436029257095','NT300/BIGBAG','64',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a203de9a-7983-4741-9cfb-e1c5a6a4795e','8436029257101','1101/BIB20','73',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('935e56d9-04fb-4fc4-b511-77da2a049c17','8436029257118','NT400/CAJA25K','7',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('88c4bf54-fed5-499c-b2a5-31bd64af23d6','8436029257125','DADO.CXP/BIB10','74',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('9c1228a1-2f95-4f65-8762-75f8db9404e2','8436029257132','TFRITO.NAT/BIB03','76',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('c0877df1-ff35-405e-83f4-fa8934a67c87','8436029257149','TFRITO.BIO/BIDON','71',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('13d51866-3a59-4174-8bd5-6d59828f8857','8436029257217','NT310.F/CAJA25K','16',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a767f97b-4b01-43c5-a0da-d7ffbd035dda','8436029257231','SALBAR.017/BIB20','73',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('73683efc-c967-42ec-8e1a-b681b5e720bd','8436029257255','NT300/CAJA25K','26',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('cfc64ea2-a12c-4e83-92b1-9674dbe84b34','8436029257293','NT350.SEMI/BIGBAG','47',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('b16ae64a-78cc-4a45-af48-128fe758cc06','8436029257323','SALBAR.022/BIDON','71',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('404e863b-03bb-4db4-91bb-73156e71a255','8436029257330','SALPZP/BIDON','71',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('147c5fb5-5083-4eb1-9060-963df4006601','8436029257347','SALPZK/BIB10','74',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('e0977283-b758-4894-955a-db088d5a5786','8436029257361','SALTCG/BIDON','72',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('5bcc75f9-a018-444b-8772-e0d17e4404d4','8436029257378','3102.BIO/BIDON','68',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('d539c0de-cee9-4ce3-91e9-d57b42d01d37','8436029257385','NT400.BIO/CAJA25K','24',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('c6ed7b47-bd0b-4317-bc99-ba376781e10f','8436029257392','NT300.BIO/CAJA25K','4',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('9e9b3b4b-df11-4528-8ab5-fecce3b304f3','8436029257408','NT400/BIGBAG','47',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('c971762b-72f0-4ddd-9f57-094f3307a6e5','8436029257415','SALCAT/BIDON','71',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('03b74403-3ed7-4106-902e-6c3755b40a6f','8436029257439','3701.BF/BIDON','67',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('ff25db24-d0e1-4cee-9de8-7dd9b90f4ee3','8436029257453','DBIO.SG/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('3d4fd154-2a00-4927-b1fd-2a9274cca857','8436029257477','3202/BIDON','68',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a05416b4-5d4e-4baf-9879-0008149fd3e8','8436029257484','SALCAT/BIB05','77',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('b393772d-efa7-4078-ba74-ad91c2a66dce','8436029257569','SALNAT/BIDON','71',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('f43ed893-a701-459d-8ad1-6c6162af77fb','8436029257576','SALPES/BIDON','71',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('1d625694-a177-4ed5-8166-f27929124b1e','8436029257606','SALNAP/BIB03','76',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('22ac32ac-47b0-4e04-90cc-ffb79b73c328','8436029257620','SALPZV/BIB03','76',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('3892b607-d3e2-48c6-b5b4-8224b863f782','8436029257644','SALPZV/BIB05','77',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('7046d25e-65dc-4377-b597-614af0417ba6','8436029257682','KETCHUP/BIB03','76',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a1b2d48e-7a9e-4f16-a2dd-51e205b05b51','8436029257705','3701/FRUCTUS','32',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('b01f4797-966d-4eaf-94de-0c26427011ba','8436029257712','POMACE/BIGBAG','48',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a7384650-aaae-4780-88df-aca257f01e30','8436029257729','POMACE/BIGBAG','52',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('29a64150-be73-4576-a133-492d169b35e5','8436029257736','28SHB/FRUCTUS','33',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('38ce15ff-9203-4197-a1cc-5879d74486d1','8436029257743','2801.BIO/BIB10','74',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('3136b078-075a-4dc0-9285-4c56132319e2','8436029257750','0901.BIO/BIB20','73',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a6a72557-7cd8-4e61-8270-a71041b5afa9','8436029257842','SALPZP/BIB03','76',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('c7b30e7e-1abc-4235-81ce-f727dcb4316c','8436029257873','NT300/SP750GR','40',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('9e08a803-8eb7-45fe-b522-8c76e0d0ce69','8436029257880','NT300/SP3000GR','39',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a0164741-1c9e-48ef-8143-16fb331e76e6','8436029257903','NT600/CAJA25K','5',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('0ce004ca-840b-4cb6-8b4f-c0cd8c40c921','8436029257927','SALBAR.042/BIB03','76',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('94173552-deba-42d1-8d64-c69bd535b395','8436029257934','SALPPJ/BIB03','76',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('4c7cd6bc-1083-4af4-a894-0a0166489c80','8436029257958','POMACE/BIGBAG','53',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('32fb3de7-0a14-4a84-a2f7-60423a7ad672','8436029257965','POMACE/BIGBAG','54',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('9b99f39d-8493-489c-b2ed-506d0d5ce8ed','8436029257989','POMACE/BIGBAG','45',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('bb956a84-dd1f-4d88-97e0-b300a6bafb7a','8436029257996','POMACE/BIGBAG','43',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('c3a75a6f-78a6-493b-b9ff-04de2df9e831','8436029258061','DBIO.SM/BIB10','74',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('b8870a6b-139b-468b-ab37-4d3c83f68648','8436029258078','KETCHUP/BIB20','73',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('49a4831b-70e4-4eb9-9390-ae69a7fbe9c0','8436029258122','2901/BIB05','77',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('d491bfca-b9d6-4f10-aab2-fa341184866e','8436029258139','NT300.BIO/CAJA25K','19',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('647685d5-7202-413b-b755-10a0e7849999','8436029258153','DADO.SXP/BIB03','76',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('d66412be-bb2f-4f17-bfba-256a8f0edc2c','8436029258177','NT300/SP125GR','41',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('f0c42fbc-9ea1-42d6-8dda-1b34b380e0c5','8436029258184','SALPNY/BIB10','74',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('c393866a-e0d0-42a0-8b87-f3998702e499','8436029258191','SALPZP/COMBO','36',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('2c4a269d-fb83-422b-96e2-88f7ae20d8c5','8436029258221','SD300.WA/CAJA25K','10',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a1a07650-b3f4-4260-9d20-7ee7543317bc','8436029258269','3701/COMBO','35',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('f29b8bd6-db05-4d41-9a82-433bd9c0b4bc','8436029258283','SD300/CAJA25K','10',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('5c1997aa-9eaa-4d2e-ad71-70705f5222ad','8436029258290','NT300.BIO/SP3000GR','39',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('bcce6b72-0735-4e49-9646-286163e07d32','8436029258344','0901/BIB20','73',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('41bbe313-41bb-4aa8-9cb1-8c578a3c77a5','8436029258351','1802/BIB03','76',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('871c54f9-34df-4e83-84b6-9edfc3caa587','8436029258368','SALPOL/BIB03','76',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('fd9384e5-2f88-4f9a-b8dc-095a19ee77ce','8436029258481','NT400/CAJA25K','27',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a39f44a7-da32-48f4-8796-d8a794f34b98','8436029258498','NT300/BIGBAG','47',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('63227c6e-5cb2-41ab-a13a-601f310d31f0','8436029258504','POMACE/BIGBAG','42',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a83874e9-bcb3-4f92-b17a-a14206accf42','8436029258511','POMACE/BIGBAG','63',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('ad69bab1-0914-4fd6-9d49-cecfe7144888','8436029258528','SALCAT/COMBO','36',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a2b6396a-0b5f-4180-857b-d5321dabcb34','8436029258542','POLPA/BIB05','77',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('3ef9b117-ec17-4e3c-a96e-a46abc0cc73c','8436029258566','DADO.SM/BIDON','75',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a98e8dc4-604e-44ee-9f07-edc0586940f4','8436029258658','0901/BIDON','70',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('e1627d83-624b-4fac-86aa-ee4f6d091b8a','8436029258665','NT300.BIO/CAJA25K','27',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('a3e78772-1c22-4eb7-87a1-397d91b68d2c','8436029258672','CTC45/BIB20','73',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('22b9e158-a143-4f75-9979-f70b6ac86f1a','8436029258702','SALPZC/BIB03','76',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('165706af-e649-42bb-a2c4-49df7ebbd232','8436029258726','DBF.SG/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('81f6d8e1-703b-4810-95bf-8276bd712357','8436029258740','DBF.SM/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('843a012d-2f35-4938-8ea2-cd9f5e629bd8','8436029258757','DBF.SP/BIDON','72',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('63ee9e58-12ca-4f47-a6b7-2c9115f15591','8436029258764','SALBAR.048/BIB03','76',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('07c5baf5-f224-471c-ae06-f087a4e8325e','8436029258771','TFRITO.EXT/BIB20','73',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('07ace6c3-a29e-4c7e-99ae-7f253e44a32a','8436029258788','NT400/CAJA25K','13',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('e6b09576-413d-4229-8a41-4299c9cb8185','8436029258801','SALPZP/BIB05','77',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('170a189b-cf20-4198-bc32-f046128f8064','8436029258818','SALDPZ/BIB10','74',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('91346e4f-9b2d-4125-8c67-a835db9b2c5b','8436029258832','TFRITO.GSOL/BIB03','76',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('70bde0f3-7c54-48aa-86a3-4f654d93ad7c','8436029258863','NT300/CAJA25K','20',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('add0a1df-19f3-4be9-ac3c-eb97a8a36bfe','8436029258870','DADO.SP/BIB10','74',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('7e0fb13c-1633-4d90-9637-d30bc174a5bd','8436029258887','DADO.SXP/BIB10','74',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('f3425a3f-f933-4376-b338-79dde365e5d9','8436029258900','SALPOM/BIB05','77',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('6aa90828-113a-42cf-a85f-00a934f12ccb','8436029258917','NT300.BF/CAJA25K','23',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('0fb035d5-e5f7-4a9c-9227-3a046332fcdb','8436029258948','0902/DIRECTO','1',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('4dd9528b-1d97-43ed-a45c-32949d9d626a','8436029258986','SALDOM/BIB05','77',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('6e9d11fc-be78-4d27-b3a6-d2396947cf90','8436029259006','SALBAR.022/BIB05','77',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('b3b2956e-92ce-4f00-8092-06266d4a9ec3','8436029259037','1101/COMBO','36',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('d26ce465-cee8-43d3-9c0d-a10756ab6def','8436029259044','SALPZC/BIB05','77',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('f6394ae2-d78f-4fa7-9dc0-1c43dee7e1fe','8436029259068','POMACE/BIGBAG','62',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('b09ad8d9-8960-4208-b23b-bcf392bd1136','8436029259075','POMACE/BIGBAG','61',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('ff96068a-c2e5-42f1-885e-2a8111e69cb7','8436029259105','1101.SAL/COMBO','36',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('668b20d0-d92e-4296-910a-7d8e518385ce','8436029259167','SALPGI / BIB03','76',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('20c102d2-6ff7-4846-bfc2-ad4b6245ebb3','8436029259198','TEMFAM.12/BIB03','76',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('0281c0eb-213f-4b20-a985-4f596ab2b4c9','8436029259266','DADO.SP/BIB20','73',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('34877e45-a8f2-4b53-8d2b-7dabb42021d5','8436029259273','0902/BIDON','71',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('6679cb4c-849e-4970-82d2-4565ac07197b','8436029259280','POMACE/BIGBAG','60',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('6d8d5543-c628-477e-a70f-f0465031f46a','8436029259297','POMACE/BIGBAG','56',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('569ecff0-acfd-4849-a71d-683a69466071','8436029259303','3701/BIDON','66',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('cc3d8d5b-3331-414a-bbf2-82270cafc312','8436029259310','SALBAR.062/BIB03','76',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('664ab1e3-aaf4-4587-a2ff-b68d89eb91fb','8436029259327','SALBAR.064/COMBO','36',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('41f4f4cc-420a-4771-bd09-7b3046f0b197','8436029259334','SALDOM.EUV5/BIB03','76',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('57593fa6-8f6f-43a3-ad31-49d407c89f62','8436029259358','NT400/CAJA25K','21',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('e9558b38-5162-4fe4-b459-ac3ea95f113c','8436029259419','SALCP61/GLCM','31',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('50cf63db-ff00-4cdf-b9ba-89f0fa0e6ea0','8436029259426','SALNAP/BIB05','77',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('b6fdfd38-093a-44fc-afb2-c5ee862a3854','8436029259440','SALSA66/BIB03','76',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('74a0af40-553b-4991-a31e-8353c5501c3c','8436029259457','SALSA67/BIB03','76',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('cb47b0b1-bcd8-4ee4-9788-31e74bc5322e','8436029259488','SALSA68/BIDON','72',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('b5f792ef-6031-44c9-82f8-b9b8ea0e7cc9','8436029259495','NT300.BF/CAJA25K','29',365,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('0ee50f5b-5f66-48b1-b189-a82490e24ca2','8436029259518','NT300/CAJA25K','28',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('1eb31d16-c408-4465-a468-7e76726f1d44','8436029259525','KETCHUP.060/BIB20','73',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('bfdfaf43-f3b5-4d2c-886c-fa3f670adc9c','8436029259556','SALDOM.EU/BIB03','76',540,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('e6cd33eb-bd6d-4cdf-a53b-abffccb0a35b','8436029259679','NT300.BIO/CAJA25K','18',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('3d51e90c-c8f3-467d-8ebe-778dc0af2e09','8436029259693','SALBAR.069/BIB03','76',730,'1');
INSERT INTO [dbo].[ean] ([id],[codigo_ean],[id_producto],[id_presentacion],[dias_best_before],[visible]) VALUES ('2177a70c-0b46-43e1-9e70-cb6ac13bda04','8436029259709','NT300.BIO/CAJA25K','30',365,'1');

INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('d9745c23-9966-474a-af94-38ab0f17ed24','01','A','fa9722af-1798-47e8-baae-18a0bfe552a1',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('6489d75f-389a-4cb7-8207-920fd2f56a80','01','B','caf8e716-783d-4611-9632-8ef5394d0cea',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('ad8db812-9fb3-42b5-926c-d86b23bd1169','02','A','c51e8042-7711-4bbf-8da2-6496c98ae775',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('499b39cf-f991-4b25-9767-752a1812947b','02','B','1f5e5ddc-36f3-4caf-9f50-56d6aca6369b',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('2042ae82-417d-408c-ae7f-a65da46a269d','03','A','d44acec9-621d-4c3d-9b24-82816f3472a6',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('8691bcfb-8230-4a36-92fe-226328350b5a','03','B','a82c3273-abcc-4472-bd6d-1ed72f04380c',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('c1471c8b-6e71-48ab-8d7b-27d8946a25ca','03','C','774d2144-c789-4e80-b150-54edd6552113',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('6bb09006-6b86-4166-ad51-7695619c117c','04','A','5d34e91b-fd3f-4135-a2ae-4fbc4edf8aa3',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('490ee1c4-68ff-4fe3-b633-3a24e388d4e9','04','B','2461000f-5bb4-4015-8f22-eb60b0a659f2',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('bd9ab28d-6ab2-4558-aa78-b8dc09bc1f6d','05','A','c5f6ec17-7f35-4332-b78c-b4d38432985c',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('43098460-8409-43aa-b84c-1312076e59a8','05','B','40c4e601-3408-47c0-90ff-cead554bd961',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('fae25e25-3e53-4c23-befe-9a5e363121ec','06','A','fa810548-933b-40a5-b226-595e43d978a8',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('b76683e0-6c22-43fb-9860-3b0b1cf566d3','06','B','8964ed48-25bb-4030-819e-4d9b14d506ed',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('d12a656f-baca-47e9-b93d-b024e6329825','07','A','3636bb0a-17b8-4e98-a20a-b02a4ba19dcb',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('d45f2c39-1d8b-4cd1-85f9-15096c3b5eac','07','B','27286f4b-d476-426c-a4fe-cc6cf6c42c06',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('7ee6e137-90bd-40de-b946-9c35530747b9','08','A','d59ff702-8fc4-487f-b829-d800c95c84b2',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('e9adead6-e1c2-4c04-a7f8-74bda1df4bd3','09','A','2df4d194-549d-4eef-b67b-5204390dcf3f',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('16570688-11ab-40ac-93ef-d3f9637cf9f1','10','A','d5b87a88-f993-4838-a52b-49313e547fa6',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('fcc57fac-0752-4ed3-878c-605b5030ba84','11','A','ae821f8b-8797-4415-8afe-9528e9667895',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('3854f6f4-e2da-4c76-828f-5083e3937eee','12','A','9183542d-a8ba-45ac-8ce1-8cd54011d53f',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('aa60589b-b270-4b59-ac55-b72d60a9ea6f','13','A','2c683596-dd04-4dd3-9676-db587bf10ee6',NULL,NULL,NULL,3,NULL);
INSERT INTO [dbo].[asociacion_produccion] ([id],[id_llenadora],[id_cabezal_llenadora],[uuid_cabezal],[familia_producto],[id_producto],[codigo_ean],[limite_llenado],[ruta_etiqueta]) VALUES ('24871e1e-4af2-4a3c-943f-8f07008d357f','14','A','293a9425-c438-4aae-a559-2c74a438c733',NULL,NULL,NULL,3,NULL);

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
