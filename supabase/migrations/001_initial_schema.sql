-- ============================================
-- CRM ARRIENDOS - ESQUEMA DE BASE DE DATOS
-- ============================================
-- Ejecutar este script en el SQL Editor de Supabase

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: UNIDADES
-- ============================================
CREATE TABLE IF NOT EXISTS unidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    medidor_id VARCHAR(50),
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: INQUILINOS
-- ============================================
CREATE TYPE estado_inquilino AS ENUM ('activo', 'inactivo', 'prospecto');

CREATE TABLE IF NOT EXISTS inquilinos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(200) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(200),
    documento_identidad VARCHAR(50),
    estado estado_inquilino DEFAULT 'prospecto',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: CONTRATOS
-- ============================================
CREATE TABLE IF NOT EXISTS contratos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquilino_id UUID REFERENCES inquilinos(id) ON DELETE SET NULL,
    unidad_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    monto_arriendo_base DECIMAL(12, 2) NOT NULL,
    deposito DECIMAL(12, 2),
    documento_pdf_url TEXT,
    estado_activo BOOLEAN DEFAULT true,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_contratos_inquilino ON contratos(inquilino_id);
CREATE INDEX IF NOT EXISTS idx_contratos_unidad ON contratos(unidad_id);
CREATE INDEX IF NOT EXISTS idx_contratos_fechas ON contratos(fecha_inicio, fecha_fin);

-- ============================================
-- TABLA: LECTURAS DE LUZ
-- ============================================
CREATE TABLE IF NOT EXISTS lecturas_luz (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unidad_id UUID REFERENCES unidades(id) ON DELETE CASCADE,
    fecha_lectura DATE NOT NULL,
    lectura_kwh DECIMAL(10, 2) NOT NULL,
    foto_evidencia_url TEXT,
    registrado_por UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lecturas_unidad ON lecturas_luz(unidad_id);
CREATE INDEX IF NOT EXISTS idx_lecturas_fecha ON lecturas_luz(fecha_lectura DESC);

-- ============================================
-- TABLA: FACTURAS GENERALES
-- ============================================
CREATE TYPE tipo_servicio AS ENUM ('electricidad', 'agua', 'gas', 'internet');

CREATE TABLE IF NOT EXISTS facturas_generales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_servicio tipo_servicio NOT NULL,
    monto_total DECIMAL(12, 2) NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE,
    consumo_total_kwh DECIMAL(10, 2),
    documento_url TEXT,
    procesada BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_facturas_tipo ON facturas_generales(tipo_servicio);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas_generales(fecha_emision DESC);

-- ============================================
-- TABLA: TRANSACCIONES
-- ============================================
CREATE TYPE tipo_transaccion AS ENUM ('ingreso', 'gasto');
CREATE TYPE categoria_transaccion AS ENUM ('arriendo', 'luz', 'agua', 'reparacion', 'mantenimiento', 'deposito', 'otro');

CREATE TABLE IF NOT EXISTS transacciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo tipo_transaccion NOT NULL,
    categoria categoria_transaccion NOT NULL,
    monto DECIMAL(12, 2) NOT NULL,
    fecha DATE NOT NULL,
    descripcion TEXT,
    contrato_id UUID REFERENCES contratos(id) ON DELETE SET NULL,
    factura_id UUID REFERENCES facturas_generales(id) ON DELETE SET NULL,
    confirmado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transacciones_tipo ON transacciones(tipo);
CREATE INDEX IF NOT EXISTS idx_transacciones_categoria ON transacciones(categoria);
CREATE INDEX IF NOT EXISTS idx_transacciones_fecha ON transacciones(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_transacciones_contrato ON transacciones(contrato_id);

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Contratos con información completa
CREATE OR REPLACE VIEW vista_contratos_completos AS
SELECT 
    c.*,
    i.nombre AS inquilino_nombre,
    i.telefono AS inquilino_telefono,
    i.email AS inquilino_email,
    u.nombre AS unidad_nombre,
    u.medidor_id,
    (c.fecha_fin - CURRENT_DATE) AS dias_restantes
FROM contratos c
LEFT JOIN inquilinos i ON c.inquilino_id = i.id
LEFT JOIN unidades u ON c.unidad_id = u.id;

-- Vista: Resumen financiero mensual
CREATE OR REPLACE VIEW vista_resumen_mensual AS
SELECT 
    DATE_TRUNC('month', fecha) AS mes,
    SUM(CASE WHEN tipo = 'ingreso' AND categoria = 'arriendo' THEN monto ELSE 0 END) AS arriendos_recibidos,
    SUM(CASE WHEN tipo = 'ingreso' AND categoria = 'luz' THEN monto ELSE 0 END) AS luz_cobrada,
    SUM(CASE WHEN tipo = 'gasto' AND categoria = 'luz' THEN monto ELSE 0 END) AS luz_pagada,
    SUM(CASE WHEN tipo = 'gasto' AND categoria IN ('reparacion', 'mantenimiento') THEN monto ELSE 0 END) AS gastos_mantenimiento,
    SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END) AS utilidad_neta
FROM transacciones
WHERE confirmado = true
GROUP BY DATE_TRUNC('month', fecha)
ORDER BY mes DESC;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Habilitar RLS en todas las tablas
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquilinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturas_luz ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas_generales ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir todo para usuarios autenticados)
-- En producción, ajustar según roles y permisos específicos
CREATE POLICY "Permitir lectura a usuarios autenticados" ON unidades
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir escritura a usuarios autenticados" ON unidades
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Permitir lectura a usuarios autenticados" ON inquilinos
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir escritura a usuarios autenticados" ON inquilinos
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Permitir lectura a usuarios autenticados" ON contratos
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir escritura a usuarios autenticados" ON contratos
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Permitir lectura a usuarios autenticados" ON lecturas_luz
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir escritura a usuarios autenticados" ON lecturas_luz
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Permitir lectura a usuarios autenticados" ON facturas_generales
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir escritura a usuarios autenticados" ON facturas_generales
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Permitir lectura a usuarios autenticados" ON transacciones
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir escritura a usuarios autenticados" ON transacciones
    FOR ALL TO authenticated USING (true);

-- ============================================
-- DATOS DE EJEMPLO
-- ============================================
-- Insertar unidades de ejemplo
INSERT INTO unidades (nombre, medidor_id, descripcion, activa) VALUES
    ('Habitación 1', 'M001', 'Habitación principal con baño compartido', true),
    ('Habitación 2', 'M002', 'Habitación con baño privado', true),
    ('Apartamento A', 'M003', 'Apartamento completo con cocina', true),
    ('Habitación 3', 'M004', 'Habitación económica', true);

-- Insertar inquilinos de ejemplo
INSERT INTO inquilinos (nombre, telefono, email, estado) VALUES
    ('Juan Pérez', '+56912345678', 'juan.perez@email.com', 'activo'),
    ('María García', '+56923456789', 'maria.garcia@email.com', 'activo'),
    ('Carlos López', '+56934567890', 'carlos.lopez@email.com', 'activo');
