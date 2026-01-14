// ============================================
// TIPOS DE LA BASE DE DATOS
// ============================================

// Unidades (habitaciones/apartamentos)
export interface Unit {
    id: string
    nombre: string
    medidor_id: string
    descripcion?: string
    activa: boolean
    created_at: string
}

// Inquilinos
export type TenantStatus = 'activo' | 'inactivo' | 'prospecto'

export interface Tenant {
    id: string
    nombre: string
    telefono: string
    email?: string
    documento_identidad?: string
    estado: TenantStatus
    created_at: string
}

// Contratos
export interface Contract {
    id: string
    inquilino_id: string
    unidad_id: string
    fecha_inicio: string
    fecha_fin: string
    monto_arriendo_base: number
    deposito?: number
    documento_pdf_url?: string
    estado_activo: boolean
    notas?: string
    created_at: string
    // Relaciones
    inquilino?: Tenant
    unidad?: Unit
}

// Lecturas de luz
export interface ElectricityReading {
    id: string
    unidad_id: string
    fecha_lectura: string
    lectura_kwh: number
    foto_evidencia_url?: string
    registrado_por?: string
    created_at: string
    // Relaciones
    unidad?: Unit
}

// Facturas generales
export type ServiceType = 'electricidad' | 'agua' | 'gas' | 'internet'

export interface GeneralBill {
    id: string
    tipo_servicio: ServiceType
    monto_total: number
    fecha_emision: string
    fecha_vencimiento?: string
    consumo_total_kwh?: number
    documento_url?: string
    procesada: boolean
    created_at: string
}

// Transacciones
export type TransactionType = 'ingreso' | 'gasto'
export type TransactionCategory = 'arriendo' | 'luz' | 'agua' | 'reparacion' | 'mantenimiento' | 'deposito' | 'otro'

export interface Transaction {
    id: string
    tipo: TransactionType
    categoria: TransactionCategory
    monto: number
    fecha: string
    descripcion?: string
    contrato_id?: string
    factura_id?: string
    confirmado: boolean
    created_at: string
    // Relaciones
    contrato?: Contract
    factura?: GeneralBill
}

// ============================================
// TIPOS PARA LA CALCULADORA DE ELECTRICIDAD
// ============================================

export interface UnitReading {
    unidadId: string
    unidadNombre: string
    lecturaAnterior: number
    lecturaActual: number
}

export interface CalculationResult {
    unidadId: string
    unidadNombre: string
    consumoKwh: number
    porcentajeConsumo: number
    montoCobrar: number
    diferenciaProrrateo: number
}

export interface ElectricityCalculation {
    montoFactura: number
    consumoTotalFactura: number
    sumaSubcontadores: number
    diferencia: number
    precioKwhReal: number
    resultados: CalculationResult[]
    gastoComun: number
}

// ============================================
// TIPOS PARA UI
// ============================================

export type PaymentStatus = 'paid' | 'pending' | 'partial'

export interface UnitWithStatus extends Unit {
    tenant?: string
    tenantId?: string
    rentAmount?: number
    electricityAmount?: number
    status: PaymentStatus
}

// Tabla financiera anual
export interface MonthlyFinancials {
    mes: string
    arriendosRecibidos: number
    luzCobrada: number
    luzPagada: number
    diferenciaLuz: number
    gastosMantenimiento: number
    utilidadNeta: number
}
