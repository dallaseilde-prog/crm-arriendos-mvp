'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, Users, Zap, DollarSign, AlertTriangle, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import UnitCard from '@/components/units/UnitCard'
import { Unit, Contract, Transaction, UnitWithStatus } from '@/types'
import { supabase } from '@/lib/supabase/client'

// Datos de ejemplo para el MVP
export default function Dashboard() {
    const [unitsWithStatus, setUnitsWithStatus] = useState<UnitWithStatus[]>([])
    const [stats, setStats] = useState({
        totalIncome: 0,
        pendingPayments: 0,
        electricityCollected: 0,
        electricityPaid: 0,
        occupiedUnits: 0,
        totalUnits: 0,
        expiringContracts: 0,
    })
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        setLoading(true)
        try {
            // 1. Obtener Unidades
            const { data: units, error: unitsError } = await supabase
                .from('unidades')
                .select('*')

            if (unitsError) throw unitsError

            // 2. Obtener estadísticas de transacciones
            const { data: trans, error: transError } = await supabase
                .from('transacciones')
                .select('*')

            if (transError) throw transError

            const totalIncome = trans
                .filter(t => t.tipo === 'ingreso' && t.confirmado)
                .reduce((sum, t) => sum + t.monto, 0)

            const pendingPayments = trans
                .filter(t => t.confirmado === false)
                .reduce((sum, t) => sum + t.monto, 0)

            const electricityCollected = trans
                .filter(t => t.tipo === 'ingreso' && t.categoria === 'luz')
                .reduce((sum, t) => sum + t.monto, 0)

            // 3. Obtener contratos para ocupación (simplificado para el dashboard)
            const { data: contracts, error: contractsError } = await supabase
                .from('vista_contratos_completos')
                .select('*')
                .eq('estado_activo', true)

            if (contractsError) throw contractsError

            // Mappear unidades con su estado actual
            const mappedUnits: UnitWithStatus[] = (units || []).map(u => {
                const contract = contracts?.find(c => c.unidad_id === u.id)
                return {
                    ...u,
                    tenant: contract?.inquilino_nombre || undefined,
                    status: contract ? 'paid' : 'pending' // Simplificación
                }
            })

            setUnitsWithStatus(mappedUnits)
            setStats({
                totalIncome,
                pendingPayments,
                electricityCollected,
                electricityPaid: 118000, // Mock for now or could fetch from bills
                occupiedUnits: mappedUnits.filter(u => u.tenant).length,
                totalUnits: mappedUnits.length,
                expiringContracts: contracts?.filter(c => c.dias_restantes < 30).length || 0,
            })

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
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

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 card">
                    <Loader2 className="w-12 h-12 text-info animate-spin mb-4" />
                    <p className="text-slate-400">Cargando resumen desde Supabase...</p>
                </div>
            ) : (
                <>
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
                            {unitsWithStatus.map((unit) => (
                                <UnitCard
                                    key={unit.id}
                                    unit={unit}
                                    onPaymentClick={handlePaymentClick}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
