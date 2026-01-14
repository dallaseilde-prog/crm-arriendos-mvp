'use client'

import { useState } from 'react'
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Zap, Wrench, Filter } from 'lucide-react'
import { MonthlyFinancials } from '@/types'

// Datos de ejemplo para la tabla anual
const mockFinancials: MonthlyFinancials[] = [
    { mes: 'Enero', arriendosRecibidos: 1800000, luzCobrada: 125000, luzPagada: 118000, diferenciaLuz: 7000, gastosMantenimiento: 50000, utilidadNeta: 1682000 },
    { mes: 'Febrero', arriendosRecibidos: 1800000, luzCobrada: 132000, luzPagada: 128000, diferenciaLuz: 4000, gastosMantenimiento: 25000, utilidadNeta: 1679000 },
    { mes: 'Marzo', arriendosRecibidos: 1800000, luzCobrada: 115000, luzPagada: 122000, diferenciaLuz: -7000, gastosMantenimiento: 180000, utilidadNeta: 1513000 },
    { mes: 'Abril', arriendosRecibidos: 1350000, luzCobrada: 98000, luzPagada: 95000, diferenciaLuz: 3000, gastosMantenimiento: 35000, utilidadNeta: 1223000 },
    { mes: 'Mayo', arriendosRecibidos: 1800000, luzCobrada: 105000, luzPagada: 108000, diferenciaLuz: -3000, gastosMantenimiento: 45000, utilidadNeta: 1652000 },
    { mes: 'Junio', arriendosRecibidos: 1800000, luzCobrada: 142000, luzPagada: 138000, diferenciaLuz: 4000, gastosMantenimiento: 20000, utilidadNeta: 1646000 },
    { mes: 'Julio', arriendosRecibidos: 1800000, luzCobrada: 155000, luzPagada: 152000, diferenciaLuz: 3000, gastosMantenimiento: 65000, utilidadNeta: 1588000 },
    { mes: 'Agosto', arriendosRecibidos: 1800000, luzCobrada: 148000, luzPagada: 145000, diferenciaLuz: 3000, gastosMantenimiento: 30000, utilidadNeta: 1628000 },
    { mes: 'Septiembre', arriendosRecibidos: 1800000, luzCobrada: 128000, luzPagada: 125000, diferenciaLuz: 3000, gastosMantenimiento: 90000, utilidadNeta: 1588000 },
    { mes: 'Octubre', arriendosRecibidos: 1800000, luzCobrada: 118000, luzPagada: 115000, diferenciaLuz: 3000, gastosMantenimiento: 40000, utilidadNeta: 1648000 },
    { mes: 'Noviembre', arriendosRecibidos: 1800000, luzCobrada: 112000, luzPagada: 110000, diferenciaLuz: 2000, gastosMantenimiento: 55000, utilidadNeta: 1637000 },
    { mes: 'Diciembre', arriendosRecibidos: 1800000, luzCobrada: 108000, luzPagada: 105000, diferenciaLuz: 3000, gastosMantenimiento: 25000, utilidadNeta: 1673000 },
]

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    }).format(amount)
}

export default function ReportesPage() {
    const [year, setYear] = useState(2024)
    const financials = mockFinancials

    // Calcular totales
    const totals = financials.reduce((acc, row) => ({
        arriendosRecibidos: acc.arriendosRecibidos + row.arriendosRecibidos,
        luzCobrada: acc.luzCobrada + row.luzCobrada,
        luzPagada: acc.luzPagada + row.luzPagada,
        diferenciaLuz: acc.diferenciaLuz + row.diferenciaLuz,
        gastosMantenimiento: acc.gastosMantenimiento + row.gastosMantenimiento,
        utilidadNeta: acc.utilidadNeta + row.utilidadNeta,
    }), {
        arriendosRecibidos: 0,
        luzCobrada: 0,
        luzPagada: 0,
        diferenciaLuz: 0,
        gastosMantenimiento: 0,
        utilidadNeta: 0,
    })

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-info" />
                        Reportes Financieros
                    </h1>
                    <p className="text-slate-400 mt-1">Vista anual de ingresos, gastos y utilidades</p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="input-field w-auto"
                    >
                        <option value={2024}>2024</option>
                        <option value={2023}>2023</option>
                        <option value={2022}>2022</option>
                    </select>
                    <button className="btn-secondary flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filtros
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">Total Arriendos</span>
                    </div>
                    <p className="stat-value text-success">{formatCurrency(totals.arriendosRecibidos)}</p>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm">Balance Luz</span>
                    </div>
                    <p className={`stat-value ${totals.diferenciaLuz >= 0 ? 'text-success' : 'text-danger'}`}>
                        {totals.diferenciaLuz >= 0 ? '+' : ''}{formatCurrency(totals.diferenciaLuz)}
                    </p>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Wrench className="w-4 h-4" />
                        <span className="text-sm">Mantenimiento</span>
                    </div>
                    <p className="stat-value text-danger">{formatCurrency(totals.gastosMantenimiento)}</p>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">Utilidad Anual</span>
                    </div>
                    <p className="stat-value text-info">{formatCurrency(totals.utilidadNeta)}</p>
                </div>
            </div>

            {/* Tabla Financiera */}
            <div className="card overflow-hidden">
                <h2 className="text-lg font-semibold text-white mb-4">Tabla Financiera Mensual</h2>

                <div className="overflow-x-auto -mx-4 md:mx-0">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-dark-600">
                                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Mes</th>
                                <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">
                                    <span className="flex items-center justify-end gap-1">
                                        <DollarSign className="w-3 h-3" />
                                        Arriendos
                                    </span>
                                </th>
                                <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">
                                    <span className="flex items-center justify-end gap-1">
                                        <Zap className="w-3 h-3" />
                                        Luz Cobrada
                                    </span>
                                </th>
                                <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">Luz Pagada</th>
                                <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">Diferencia</th>
                                <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">
                                    <span className="flex items-center justify-end gap-1">
                                        <Wrench className="w-3 h-3" />
                                        Mant.
                                    </span>
                                </th>
                                <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">Utilidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {financials.map((row, index) => (
                                <tr
                                    key={row.mes}
                                    className={`border-b border-dark-700 hover:bg-dark-700/50 transition-colors ${index % 2 === 0 ? 'bg-dark-800/30' : ''}`}
                                >
                                    <td className="py-3 px-4 font-medium text-white">{row.mes}</td>
                                    <td className="py-3 px-4 text-right text-success font-medium">
                                        {formatCurrency(row.arriendosRecibidos)}
                                    </td>
                                    <td className="py-3 px-4 text-right text-info">
                                        {formatCurrency(row.luzCobrada)}
                                    </td>
                                    <td className="py-3 px-4 text-right text-slate-300">
                                        {formatCurrency(row.luzPagada)}
                                    </td>
                                    <td className={`py-3 px-4 text-right font-medium ${row.diferenciaLuz >= 0 ? 'text-success' : 'text-danger'}`}>
                                        <span className="flex items-center justify-end gap-1">
                                            {row.diferenciaLuz >= 0 ? (
                                                <TrendingUp className="w-3 h-3" />
                                            ) : (
                                                <TrendingDown className="w-3 h-3" />
                                            )}
                                            {row.diferenciaLuz >= 0 ? '+' : ''}{formatCurrency(row.diferenciaLuz)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right text-danger">
                                        {formatCurrency(row.gastosMantenimiento)}
                                    </td>
                                    <td className="py-3 px-4 text-right font-bold text-white">
                                        {formatCurrency(row.utilidadNeta)}
                                    </td>
                                </tr>
                            ))}
                            {/* Fila de totales */}
                            <tr className="bg-info/10 border-t-2 border-info">
                                <td className="py-4 px-4 font-bold text-white">TOTAL ANUAL</td>
                                <td className="py-4 px-4 text-right text-success font-bold">
                                    {formatCurrency(totals.arriendosRecibidos)}
                                </td>
                                <td className="py-4 px-4 text-right text-info font-bold">
                                    {formatCurrency(totals.luzCobrada)}
                                </td>
                                <td className="py-4 px-4 text-right text-slate-300 font-bold">
                                    {formatCurrency(totals.luzPagada)}
                                </td>
                                <td className={`py-4 px-4 text-right font-bold ${totals.diferenciaLuz >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {totals.diferenciaLuz >= 0 ? '+' : ''}{formatCurrency(totals.diferenciaLuz)}
                                </td>
                                <td className="py-4 px-4 text-right text-danger font-bold">
                                    {formatCurrency(totals.gastosMantenimiento)}
                                </td>
                                <td className="py-4 px-4 text-right text-info font-bold text-lg">
                                    {formatCurrency(totals.utilidadNeta)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Insights */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="card border-success/30 bg-success/5">
                    <h3 className="font-medium text-success flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4" />
                        Mejor Mes
                    </h3>
                    <p className="text-2xl font-bold text-white">Enero</p>
                    <p className="text-sm text-slate-400">Utilidad: {formatCurrency(1682000)}</p>
                </div>
                <div className="card border-warning/30 bg-warning/5">
                    <h3 className="font-medium text-warning flex items-center gap-2 mb-2">
                        <TrendingDown className="w-4 h-4" />
                        Mayor Gasto Mantenimiento
                    </h3>
                    <p className="text-2xl font-bold text-white">Marzo</p>
                    <p className="text-sm text-slate-400">Gastos: {formatCurrency(180000)}</p>
                </div>
            </div>
        </div>
    )
}
