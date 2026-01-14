'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, Users, Zap, DollarSign, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import UnitCard from '@/components/units/UnitCard'
import { Unit, Contract, Transaction } from '@/types'

// Datos de ejemplo para el MVP
const mockUnits: (Unit & { tenant?: string; status: 'paid' | 'pending' | 'partial' })[] = [
    { id: '1', nombre: 'Habitación 1', medidor_id: 'M001', descripcion: 'Habitación principal', activa: true, created_at: '', tenant: 'Juan Pérez', status: 'paid' },
    { id: '2', nombre: 'Habitación 2', medidor_id: 'M002', descripcion: 'Habitación con baño', activa: true, created_at: '', tenant: 'María García', status: 'pending' },
    { id: '3', nombre: 'Apartamento A', medidor_id: 'M003', descripcion: 'Apartamento completo', activa: true, created_at: '', tenant: 'Carlos López', status: 'partial' },
    { id: '4', nombre: 'Habitación 3', medidor_id: 'M004', descripcion: 'Habitación económica', activa: true, created_at: '', status: 'pending' },
]

export default function Dashboard() {
    const [units, setUnits] = useState(mockUnits)
    const router = useRouter()

    // Estadísticas del dashboard
    const stats = {
        totalIncome: 1850000,
        pendingPayments: 450000,
        electricityCollected: 125000,
        electricityPaid: 118000,
        occupiedUnits: units.filter(u => u.tenant).length,
        totalUnits: units.length,
        expiringContracts: 1,
    }

    const handlePaymentClick = (unitId: string) => {
        router.push('/pagos')
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400 mt-1">Resumen de tu propiedad</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/pagos">
                        <button className="btn-primary flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            <span>Registrar Pago</span>
                        </button>
                    </Link>
                    <Link href="/electricidad">
                        <button className="btn-secondary flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            <span>Nueva Lectura</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Ingresos Totales */}
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-success/20 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-success" />
                        </div>
                        <span className="badge-success">+12%</span>
                    </div>
                    <p className="stat-value text-success mt-3">
                        ${stats.totalIncome.toLocaleString('es-CL')}
                    </p>
                    <p className="stat-label">Ingresos del Mes</p>
                </div>

                {/* Pagos Pendientes */}
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-warning/20 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-warning" />
                        </div>
                        <span className="badge-warning">2 pend.</span>
                    </div>
                    <p className="stat-value text-warning mt-3">
                        ${stats.pendingPayments.toLocaleString('es-CL')}
                    </p>
                    <p className="stat-label">Pagos Pendientes</p>
                </div>

                {/* Electricidad */}
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-info/20 rounded-lg">
                            <Zap className="w-5 h-5 text-info" />
                        </div>
                        <span className={stats.electricityCollected >= stats.electricityPaid ? 'badge-success' : 'badge-danger'}>
                            {stats.electricityCollected >= stats.electricityPaid ? '+' : '-'}
                            ${Math.abs(stats.electricityCollected - stats.electricityPaid).toLocaleString('es-CL')}
                        </span>
                    </div>
                    <p className="stat-value text-info mt-3">
                        ${stats.electricityCollected.toLocaleString('es-CL')}
                    </p>
                    <p className="stat-label">Luz Cobrada vs Pagada</p>
                </div>

                {/* Ocupación */}
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Home className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-slate-400 text-sm">
                            {stats.occupiedUnits}/{stats.totalUnits}
                        </span>
                    </div>
                    <p className="stat-value text-purple-400 mt-3">
                        {Math.round((stats.occupiedUnits / stats.totalUnits) * 100)}%
                    </p>
                    <p className="stat-label">Ocupación</p>
                </div>
            </div>

            {/* Alertas */}
            {stats.expiringContracts > 0 && (
                <div className="card border-warning/50 bg-warning/10">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                        <div>
                            <p className="font-medium text-warning">Contratos por vencer</p>
                            <p className="text-sm text-slate-300">
                                Tienes {stats.expiringContracts} contrato(s) que vencen en los próximos 30 días
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Units Grid */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Estado de Unidades
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {units.map((unit) => (
                        <UnitCard
                            key={unit.id}
                            unit={unit}
                            onPaymentClick={handlePaymentClick}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
