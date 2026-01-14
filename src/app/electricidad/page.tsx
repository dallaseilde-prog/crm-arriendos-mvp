'use client'

import { useState } from 'react'
import { Zap, Calculator, AlertCircle, CheckCircle, Info, DollarSign } from 'lucide-react'
import { calcularElectricidad, formatCurrency, formatKwh, validarLecturas } from '@/lib/utils/electricity'
import { UnitReading, ElectricityCalculation } from '@/types'

// Datos de ejemplo
const mockUnits = [
    { id: '1', nombre: 'Habitación 1', medidor_id: 'M001' },
    { id: '2', nombre: 'Habitación 2', medidor_id: 'M002' },
    { id: '3', nombre: 'Apartamento A', medidor_id: 'M003' },
    { id: '4', nombre: 'Habitación 3', medidor_id: 'M004' },
]

export default function ElectricidadPage() {
    const [montoFactura, setMontoFactura] = useState<number>(118000)
    const [consumoFactura, setConsumoFactura] = useState<number>(450)
    const [lecturas, setLecturas] = useState<UnitReading[]>(
        mockUnits.map(u => ({
            unidadId: u.id,
            unidadNombre: u.nombre,
            lecturaAnterior: 0,
            lecturaActual: 0,
        }))
    )
    const [prorratear, setProrratear] = useState(true)
    const [resultado, setResultado] = useState<ElectricityCalculation | null>(null)
    const [errors, setErrors] = useState<string[]>([])

    const handleLecturaChange = (index: number, field: 'lecturaAnterior' | 'lecturaActual', value: number) => {
        const newLecturas = [...lecturas]
        newLecturas[index] = { ...newLecturas[index], [field]: value }
        setLecturas(newLecturas)
    }

    const handleCalcular = () => {
        // Validar
        const validation = validarLecturas(lecturas)
        if (!validation.valid) {
            setErrors(validation.errors)
            setResultado(null)
            return
        }

        setErrors([])
        const calculo = calcularElectricidad(montoFactura, consumoFactura, lecturas, prorratear)
        setResultado(calculo)
    }

    const handleGenerarCargos = () => {
        if (!resultado) return
        // Aquí se crearían las transacciones en la base de datos
        alert('Cargos generados exitosamente. En producción, esto crearía transacciones en Supabase.')
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                    <Zap className="w-8 h-8 text-warning" />
                    Calculadora de Electricidad
                </h1>
                <p className="text-slate-400 mt-1">
                    Calcula el costo exacto de luz para cada unidad según su consumo real
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Formulario */}
                <div className="space-y-6">
                    {/* Datos de la factura */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-info" />
                            Datos de la Factura General
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">
                                    Monto Total Factura ($)
                                </label>
                                <input
                                    type="number"
                                    value={montoFactura}
                                    onChange={(e) => setMontoFactura(Number(e.target.value))}
                                    className="input-field"
                                    placeholder="118000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">
                                    Consumo Total (kWh)
                                </label>
                                <input
                                    type="number"
                                    value={consumoFactura}
                                    onChange={(e) => setConsumoFactura(Number(e.target.value))}
                                    className="input-field"
                                    placeholder="450"
                                />
                            </div>
                        </div>

                        {/* Opción de prorrateo */}
                        <div className="mt-4 p-3 bg-dark-800 rounded-lg">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={prorratear}
                                    onChange={(e) => setProrratear(e.target.checked)}
                                    className="w-4 h-4 rounded border-dark-600 text-info focus:ring-info"
                                />
                                <div>
                                    <span className="text-white font-medium">Prorratear diferencia</span>
                                    <p className="text-xs text-slate-400">
                                        Distribuir la diferencia entre sub-contadores y medidor principal entre todas las unidades
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Lecturas */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-white mb-4">
                            Lecturas de Sub-contadores
                        </h2>
                        <div className="space-y-4">
                            {lecturas.map((lectura, index) => (
                                <div key={lectura.unidadId} className="p-4 bg-dark-800 rounded-lg">
                                    <p className="font-medium text-white mb-3">{lectura.unidadNombre}</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">
                                                Lectura Anterior
                                            </label>
                                            <input
                                                type="number"
                                                value={lectura.lecturaAnterior || ''}
                                                onChange={(e) => handleLecturaChange(index, 'lecturaAnterior', Number(e.target.value))}
                                                className="input-field text-sm"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">
                                                Lectura Actual
                                            </label>
                                            <input
                                                type="number"
                                                value={lectura.lecturaActual || ''}
                                                onChange={(e) => handleLecturaChange(index, 'lecturaActual', Number(e.target.value))}
                                                className="input-field text-sm"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    {lectura.lecturaActual > 0 && (
                                        <p className="text-sm text-info mt-2">
                                            Consumo: {formatKwh(Math.max(0, lectura.lecturaActual - lectura.lecturaAnterior))}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleCalcular}
                            className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
                        >
                            <Calculator className="w-4 h-4" />
                            Calcular Distribución
                        </button>
                    </div>
                </div>

                {/* Resultados */}
                <div className="space-y-6">
                    {/* Errores */}
                    {errors.length > 0 && (
                        <div className="card border-danger/50 bg-danger/10">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-danger">Errores en las lecturas</p>
                                    <ul className="text-sm text-slate-300 mt-2 space-y-1">
                                        {errors.map((error, i) => (
                                            <li key={i}>• {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Resultado del cálculo */}
                    {resultado && (
                        <>
                            {/* Resumen */}
                            <div className="card border-info/50">
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-info" />
                                    Resumen del Cálculo
                                </h2>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="p-3 bg-dark-800 rounded-lg">
                                        <p className="text-slate-400">Precio kWh Real</p>
                                        <p className="text-xl font-bold text-info">{formatCurrency(resultado.precioKwhReal)}</p>
                                    </div>
                                    <div className="p-3 bg-dark-800 rounded-lg">
                                        <p className="text-slate-400">Suma Sub-contadores</p>
                                        <p className="text-xl font-bold text-white">{formatKwh(resultado.sumaSubcontadores)}</p>
                                    </div>
                                    <div className="p-3 bg-dark-800 rounded-lg">
                                        <p className="text-slate-400">Consumo Factura</p>
                                        <p className="text-xl font-bold text-white">{formatKwh(resultado.consumoTotalFactura)}</p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${resultado.diferencia !== 0 ? 'bg-warning/20' : 'bg-success/20'}`}>
                                        <p className="text-slate-400">Diferencia</p>
                                        <p className={`text-xl font-bold ${resultado.diferencia !== 0 ? 'text-warning' : 'text-success'}`}>
                                            {formatKwh(resultado.diferencia)}
                                        </p>
                                    </div>
                                </div>

                                {resultado.gastoComun > 0 && (
                                    <div className="mt-4 p-3 bg-warning/20 rounded-lg">
                                        <p className="text-warning font-medium">Gasto Común: {formatCurrency(resultado.gastoComun)}</p>
                                        <p className="text-xs text-slate-300">Este monto no se asigna a ninguna unidad específica</p>
                                    </div>
                                )}
                            </div>

                            {/* Desglose por unidad */}
                            <div className="card">
                                <h2 className="text-lg font-semibold text-white mb-4">
                                    Cargo por Unidad
                                </h2>
                                <div className="space-y-3">
                                    {resultado.resultados.map((r) => (
                                        <div key={r.unidadId} className="p-4 bg-dark-800 rounded-lg flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-white">{r.unidadNombre}</p>
                                                <p className="text-sm text-slate-400">
                                                    {formatKwh(r.consumoKwh)} ({r.porcentajeConsumo.toFixed(1)}%)
                                                </p>
                                                {r.diferenciaProrrateo > 0 && (
                                                    <p className="text-xs text-warning">
                                                        Incluye {formatCurrency(r.diferenciaProrrateo)} de prorrateo
                                                    </p>
                                                )}
                                            </div>
                                            <p className="text-2xl font-bold text-success">
                                                {formatCurrency(r.montoCobrar)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Total */}
                                <div className="mt-4 p-4 bg-info/20 rounded-lg flex items-center justify-between">
                                    <p className="font-medium text-white">Total a Cobrar</p>
                                    <p className="text-2xl font-bold text-info">
                                        {formatCurrency(resultado.resultados.reduce((sum, r) => sum + r.montoCobrar, 0))}
                                    </p>
                                </div>

                                <button
                                    onClick={handleGenerarCargos}
                                    className="btn-success w-full mt-4 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Generar Cargos Automáticos
                                </button>
                            </div>
                        </>
                    )}

                    {/* Estado inicial */}
                    {!resultado && errors.length === 0 && (
                        <div className="card text-center py-12">
                            <Zap className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                            <p className="text-slate-400">
                                Ingresa los datos de la factura y las lecturas para ver el cálculo
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
