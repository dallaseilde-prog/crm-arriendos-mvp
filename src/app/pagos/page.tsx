'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Check, Plus, Receipt, Calendar, User, Home, Search, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Transaction } from '@/types'

interface TransactionWithRelations extends Transaction {
    inquilino_nombre?: string
    unidad_nombre?: string
}

const conceptoConfig: any = {
    arriendo: { label: 'Arriendo', color: 'text-success', bg: 'bg-success/20' },
    luz: { label: 'Electricidad', color: 'text-warning', bg: 'bg-warning/20' },
    deposito: { label: 'Depósito', color: 'text-info', bg: 'bg-info/20' },
    otros: { label: 'Otro', color: 'text-slate-400', bg: 'bg-slate-400/20' },
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    }).format(amount)
}

export default function PagosPage() {
    const [payments, setPayments] = useState<TransactionWithRelations[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [search, setSearch] = useState('')
    const [contratos, setContratos] = useState<any[]>([])

    // Nuevo pago form
    const [newPayment, setNewPayment] = useState({
        contrato_id: '',
        categoria: 'arriendo',
        monto: 0,
        descripcion: '',
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            // 1. Fetch transactions
            const { data: transData, error: transError } = await supabase
                .from('vista_transacciones_completas')
                .select('*')
                .eq('tipo', 'ingreso')

            if (transError) throw transError
            setPayments(transData || [])

            // 2. Fetch contracts for the form
            const { data: contractsData, error: contractsError } = await supabase
                .from('vista_contratos_completos')
                .select('id, inquilino_nombre, unidad_nombre')
                .eq('estado_activo', true)

            if (contractsError) throw contractsError
            setContratos(contractsData || [])
        } catch (error) {
            console.error('Error fetching payments:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredPayments = payments.filter(p =>
        (p.inquilino_nombre?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (p.unidad_nombre?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (p.descripcion?.toLowerCase() || '').includes(search.toLowerCase())
    )

    const handleConfirmPayment = async (id: string) => {
        try {
            const { error } = await supabase
                .from('transacciones')
                .update({ confirmado: true })
                .eq('id', id)

            if (error) throw error
            await fetchData()
        } catch (error) {
            console.error('Error confirming payment:', error)
        }
    }

    const handleAddPayment = async () => {
        if (!newPayment.contrato_id || !newPayment.monto) return

        try {
            const { error } = await supabase
                .from('transacciones')
                .insert([{
                    tipo: 'ingreso',
                    categoria: newPayment.categoria,
                    monto: newPayment.monto,
                    descripcion: newPayment.descripcion,
                    contrato_id: newPayment.contrato_id,
                    fecha: new Date().toISOString().split('T')[0],
                    confirmado: true
                }])

            if (error) throw error

            await fetchData()
            setShowForm(false)
            setNewPayment({ contrato_id: '', categoria: 'arriendo', monto: 0, descripcion: '' })
        } catch (error) {
            console.error('Error adding payment:', error)
        }
    }

    const totalMes = payments.reduce((sum, p) => sum + p.monto, 0)
    const pendientes = payments.filter(p => !p.confirmado).length

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-success" />
                        Registro de Pagos
                    </h1>
                    <p className="text-slate-400 mt-1">Gestiona los pagos de arriendos y servicios</p>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="btn-success flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Registrar Pago
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="stat-card">
                    <p className="text-slate-400 text-sm">Total Histórico</p>
                    <p className="stat-value text-success">{formatCurrency(totalMes)}</p>
                </div>
                <div className="stat-card">
                    <p className="text-slate-400 text-sm">Pagos Registrados</p>
                    <p className="stat-value text-white">{payments.length}</p>
                </div>
                <div className="stat-card col-span-2 lg:col-span-1">
                    <p className="text-slate-400 text-sm">Pendientes de Confirmar</p>
                    <p className={`stat-value ${pendientes > 0 ? 'text-warning' : 'text-success'}`}>{pendientes}</p>
                </div>
            </div>

            {/* Modal de nuevo pago */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm">
                    <div className="card w-full max-w-md">
                        <h2 className="text-xl font-bold text-white mb-4">Registrar Nuevo Pago</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">
                                    <User className="w-4 h-4 inline mr-1" />
                                    Contrato (Inquilino - Unidad)
                                </label>
                                <select
                                    value={newPayment.contrato_id}
                                    onChange={(e) => setNewPayment({ ...newPayment, contrato_id: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="">Seleccionar contrato...</option>
                                    {contratos.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.inquilino_nombre} - {c.unidad_nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Categoría</label>
                                <select
                                    value={newPayment.categoria}
                                    onChange={(e) => setNewPayment({ ...newPayment, categoria: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="arriendo">Arriendo</option>
                                    <option value="luz">Electricidad</option>
                                    <option value="deposito">Depósito</option>
                                    <option value="otros">Otro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Monto ($)</label>
                                <input
                                    type="number"
                                    value={newPayment.monto || ''}
                                    onChange={(e) => setNewPayment({ ...newPayment, monto: Number(e.target.value) })}
                                    className="input-field"
                                    placeholder="450000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Descripción (Opcional)</label>
                                <input
                                    type="text"
                                    value={newPayment.descripcion}
                                    onChange={(e) => setNewPayment({ ...newPayment, descripcion: e.target.value })}
                                    className="input-field"
                                    placeholder="Mes de Enero..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowForm(false)}
                                className="btn-secondary flex-1"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddPayment}
                                className="btn-success flex-1 flex items-center justify-center gap-2"
                            >
                                <Receipt className="w-4 h-4" />
                                Registrar Pago
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por inquilino, unidad o descripción..."
                    className="input-field pl-12"
                />
            </div>

            {/* Lista de pagos */}
            <div className="card">
                <h2 className="text-lg font-semibold text-white mb-4">Historial de Pagos</h2>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-info animate-spin mb-4" />
                        <p className="text-slate-400">Cargando pagos desde Supabase...</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredPayments.map((payment) => {
                            const config = conceptoConfig[payment.categoria] || conceptoConfig.otros
                            return (
                                <div
                                    key={payment.id}
                                    className={`p-4 rounded-lg flex items-center justify-between gap-4 ${payment.confirmado ? 'bg-dark-800' : 'bg-warning/10 border border-warning/30'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${config.bg}`}>
                                            {payment.categoria === 'arriendo' ? (
                                                <Home className={`w-5 h-5 ${config.color}`} />
                                            ) : (
                                                <DollarSign className={`w-5 h-5 ${config.color}`} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{payment.inquilino_nombre || 'N/A'}</p>
                                            <p className="text-sm text-slate-400">
                                                {payment.unidad_nombre || 'Sin unidad'} • {config.label}
                                            </p>
                                            {payment.descripcion && (
                                                <p className="text-xs text-slate-400 italic mt-1">{payment.descripcion}</p>
                                            )}
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(payment.fecha).toLocaleDateString('es-CL')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xl font-bold text-success">
                                            {formatCurrency(payment.monto)}
                                        </p>
                                        {payment.confirmado ? (
                                            <span className="badge-success text-xs">
                                                <Check className="w-3 h-3 mr-1" />
                                                Confirmado
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleConfirmPayment(payment.id)}
                                                className="text-xs text-warning hover:text-white transition-colors"
                                            >
                                                Confirmar pago
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        {filteredPayments.length === 0 && (
                            <div className="text-center py-12">
                                <DollarSign className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                                <p className="text-slate-400">No se encontraron pagos</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
