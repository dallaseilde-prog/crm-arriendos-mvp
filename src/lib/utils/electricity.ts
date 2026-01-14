import { UnitReading, CalculationResult, ElectricityCalculation } from '@/types'

/**
 * Calcula el costo de electricidad para cada unidad basándose en su consumo real
 * 
 * @param montoTotalFactura - Monto total de la factura de luz ($)
 * @param consumoTotalFactura - Consumo total del medidor principal (kWh)
 * @param lecturas - Array de lecturas de cada sub-contador
 * @param prorratearDiferencia - Si true, prorratea la diferencia entre medidores. Si false, va a gasto común.
 * @returns Objeto con los resultados del cálculo
 */
export function calcularElectricidad(
    montoTotalFactura: number,
    consumoTotalFactura: number,
    lecturas: UnitReading[],
    prorratearDiferencia: boolean = true
): ElectricityCalculation {
    // 1. Calcular consumo individual de cada unidad
    const consumos = lecturas.map(l => ({
        ...l,
        consumo: Math.max(0, l.lecturaActual - l.lecturaAnterior)
    }))

    // 2. Suma de todos los sub-contadores
    const sumaSubcontadores = consumos.reduce((sum, c) => sum + c.consumo, 0)

    // Validar que hay consumo
    if (sumaSubcontadores === 0) {
        return {
            montoFactura: montoTotalFactura,
            consumoTotalFactura,
            sumaSubcontadores: 0,
            diferencia: consumoTotalFactura,
            precioKwhReal: 0,
            resultados: lecturas.map(l => ({
                unidadId: l.unidadId,
                unidadNombre: l.unidadNombre,
                consumoKwh: 0,
                porcentajeConsumo: 0,
                montoCobrar: 0,
                diferenciaProrrateo: 0
            })),
            gastoComun: montoTotalFactura
        }
    }

    // 3. Diferencia con medidor principal
    const diferencia = consumoTotalFactura - sumaSubcontadores

    // 4. Precio real del kWh basado en la factura
    const precioKwhReal = montoTotalFactura / consumoTotalFactura

    // 5. Calcular monto por unidad
    const resultados: CalculationResult[] = consumos.map(c => {
        const porcentaje = c.consumo / sumaSubcontadores
        const montoBase = c.consumo * precioKwhReal

        // Si hay diferencia entre medidor principal y sub-contadores, prorratear
        const diferenciaProrrateo = prorratearDiferencia
            ? (diferencia * precioKwhReal * porcentaje)
            : 0

        return {
            unidadId: c.unidadId,
            unidadNombre: c.unidadNombre,
            consumoKwh: c.consumo,
            porcentajeConsumo: porcentaje * 100,
            montoCobrar: Math.round(montoBase + diferenciaProrrateo),
            diferenciaProrrateo: Math.round(diferenciaProrrateo)
        }
    })

    // 6. Gasto común (si no se prorratea la diferencia)
    const gastoComun = prorratearDiferencia ? 0 : Math.round(diferencia * precioKwhReal)

    // Validar que la suma de cobros + gasto común = monto factura
    const totalCobrado = resultados.reduce((sum, r) => sum + r.montoCobrar, 0) + gastoComun

    // Ajustar diferencias de redondeo en la primera unidad
    if (totalCobrado !== montoTotalFactura && resultados.length > 0) {
        resultados[0].montoCobrar += (montoTotalFactura - totalCobrado)
    }

    return {
        montoFactura: montoTotalFactura,
        consumoTotalFactura,
        sumaSubcontadores,
        diferencia,
        precioKwhReal: Math.round(precioKwhReal * 100) / 100,
        resultados,
        gastoComun
    }
}

/**
 * Formatea el precio en pesos chilenos
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    }).format(amount)
}

/**
 * Formatea el consumo en kWh
 */
export function formatKwh(kwh: number): string {
    return `${kwh.toLocaleString('es-CL')} kWh`
}

/**
 * Calcula el porcentaje de diferencia entre medidores
 */
export function calcularPorcentajeDiferencia(
    consumoFactura: number,
    sumaSubcontadores: number
): number {
    if (consumoFactura === 0) return 0
    return Math.round(((consumoFactura - sumaSubcontadores) / consumoFactura) * 100)
}

/**
 * Valida las lecturas antes del cálculo
 */
export function validarLecturas(lecturas: UnitReading[]): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    lecturas.forEach(lectura => {
        if (lectura.lecturaActual < lectura.lecturaAnterior) {
            errors.push(`${lectura.unidadNombre}: La lectura actual (${lectura.lecturaActual}) es menor que la anterior (${lectura.lecturaAnterior})`)
        }
        if (lectura.lecturaActual < 0 || lectura.lecturaAnterior < 0) {
            errors.push(`${lectura.unidadNombre}: Las lecturas no pueden ser negativas`)
        }
    })

    return {
        valid: errors.length === 0,
        errors
    }
}
