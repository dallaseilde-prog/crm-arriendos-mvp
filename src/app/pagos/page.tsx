'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Check, Plus, Receipt, Calendar, User, Home, Search, Loader2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
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
    reparacion: { label: 'Reparación', color: 'text-danger', bg: 'bg-danger/20' },
    mantenimiento: { label: 'Mantenimiento', color: 'text-purple-400', bg: 'bg-purple-500/20' },
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
    const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'ingreso' | 'gasto'>('todos')

    // Nuevo pago form
    const [newPayment, setNewPayment] = useState({
        tipo: 'ingreso' as 'ingreso' | 'gasto',
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
                .order('fecha', { ascending: false })

            if (transError) throw transError
            setPayments(transData || [])

            // 2. Fetch contracts for the form
            const { data: contractsData, error: contractsError } = await supabase
                .from('vista_contratos_completos')
                .select('id, inquilino_nombre, unidad_nombre')
                .eq('estado_activo', true)

            if (contractsError) throw contractsError
            setContratos(contractsData || [])
        } catch (error: any) {
            console.error('Error fetching payments:', error)
            alert('Error al cargar datos: ' + (error.message || 'Error desconocido'))
        } finally {
            setLoading(false)
        }
    }

    const filteredPayments = payments.filter(p => {
        const matchesSearch = (p.inquilino_nombre?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (p.unidad_nombre?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (p.descripcion?.toLowerCase() || '').includes(search.toLowerCase())

        if (tipoFiltro === 'todos') return matchesSearch
        return matchesSearch && p.tipo === tipoFiltro
    })

    const handleConfirmPayment = async (id: string) => {
        try {
            const { error } = await supabase
                .from('transacciones')
                .update({ confirmado: true })
                .eq('id', id)

            if (error) throw error
            await fetchData()
        } catch (error: any) {
            console.error('Error confirming payment:', error)
            alert('Error al confirmar: ' + (error.message || 'Error desconocido'))
        }
    }

    const handleAddPayment = async () => {
        if (newPayment.tipo === 'ingreso' && !newPayment.contrato_id) {
            alert('Seleccione un inquilino/contrato para ingresos')
            return
        }
        if (!newPayment.monto || newPayment.monto <= 0) {
            alert('Ingrese un monto válido')
            return
        }

        try {
            const { error } = await supabase
                .from('transacciones')
                .insert([{
                    tipo: newPayment.tipo,
                    categoria: newPayment.categoria,
                    monto: newPayment.monto,
                    descripcion: newPayment.descripcion,
                    contrato_id: newPayment.tipo === 'ingreso' ? newPayment.contrato_id : null,
                    fecha: new Date().toISOString().split('T')[0],
                    confirmado: true
                }])

            if (error) throw error

            await fetchData()
            setShowForm(false)
            setNewPayment({ tipo: 'ingreso', contrato_id: '', categoria: 'arriendo', monto: 0, descripcion: '' })
            alert('Transacción registrada con éxito')
        } catch (error: any) {
            console.error('Error adding payment:', error)
            alert('Error al guardar: ' + (error.message || 'Error desconocido'))
        }
    }

    const totalIngresos = payments
        .filter(p => p.tipo === 'ingreso' && p.confirmado)
        .reduce((sum, p) => sum + p.monto, 0)

    const totalGastos = payments
        .filter(p => p.tipo === 'gasto' && p.confirmado)
        .reduce((sum, p) => sum + p.monto, 0)

    const pendientes = payments.filter(p => !p.confirmado).length

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-success" />
                        Finanzas y Pagos
                    </h1>
                    <p className="text-slate-400 mt-1">Gestiona ingresos (arriendos) y gastos (reparaciones/servicios)</p>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="btn-success flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Registrar Movimiento
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-400 text-sm">Ingresos Totales</p>
                        <ArrowUpRight className="w-5 h-5 text-success" />
                    </div>
                    <p className="stat-value text-success">{formatCurrency(totalIngresos)}</p>
                </div>
                <div className="stat-card">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-400 text-sm">Gastos Totales</p>
                        <ArrowDownRight className="w-5 h-5 text-danger" />
                    </div>
                    <p className="stat-value text-danger">{formatCurrency(totalGastos)}</p>
                </div>
                <div className="stat-card">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-400 text-sm">Balance Neto</p>
                        <DollarSign className={`w-5 h-5 ${totalIngresos - totalGastos >= 0 ? 'text-info' : 'text-warning'}`} />
                    </div>
                    <p className={`stat-value ${totalIngresos - totalGastos >= 0 ? 'text-info' : 'text-warning'}`}>
                        {formatCurrency(totalIngresos - totalGastos)}
                    </p>
                </div>
            </div>

            {/* Modal de nuevo pago/gasto */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm">
                    <div className="card w-full max-w-md">
                        <h2 className="text-xl font-bold text-white mb-6">Nuevo Movimiento Financiero</h2>

                        <div className="space-y-4">
                            {/* Tipo Toggle */}
                            <div className="grid grid-cols-2 gap-2 p-1 bg-dark-800 rounded-lg">
                                <button
                                    onClick={() => setNewPayment({ ...newPayment, tipo: 'ingreso', categoria: 'arriendo' })}
                                    className={`py-2 text-sm font-medium rounded-md transition-all ${newPayment.tipo === 'ingreso' ? 'bg-success text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Ingreso (Pago)
                                </button>
                                <button
                                    onClick={() => setNewPayment({ ...newPayment, tipo: 'gasto', categoria: 'reparacion' })}
                                    className={`py-2 text-sm font-medium rounded-md transition-all ${newPayment.tipo === 'gasto' ? 'bg-danger text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Gasto (Egreso)
                                </button>
                            </div>

                            {newPayment.tipo === 'ingreso' && (
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">
                                        <User className="w-4 h-4 inline mr-1" />
                                        Inquilino / Contrato
                                    </label>
                                    <select
                                        value={newPayment.contrato_id}
                                        onChange={(e) => setNewPayment({ ...newPayment, contrato_id: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="">Seleccionar inquilino...</option>
                                        {contratos.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.inquilino_nombre} - {c.unidad_nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Categoría</label>
                                <select
                                    value={newPayment.categoria}
                                    onChange={(e) => setNewPayment({ ...newPayment, categoria: e.target.value })}
                                    className="input-field"
                                >
                                    {newPayment.tipo === 'ingreso' ? (
                                        <>
                                            <option value="arriendo">Arriendo</option>
                                            <option value="luz">Electricidad (Cobro)</option>
                                            <option value="deposito">Depósito de Garantía</option>
                                            <option value="otro">Otro Ingreso</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="reparacion">Reparación / Arreglo</option>
                                            <option value="mantenimiento">Mantenimiento</option>
                                            <option value="luz">Pago Factura Luz</option>
                                            <option value="agua">Pago Factura Agua</option>
                                            <option value="otro">Otro Gasto</option>
                                        </>
                                    )}
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
                                <label className="block text-sm text-slate-400 mb-2">Descripción / Notas</label>
                                <input
                                    type="text"
                                    value={newPayment.descripcion}
                                    onChange={(e) => setNewPayment({ ...newPayment, descripcion: e.target.value })}
                                    className="input-field"
                                    placeholder="Ej: Mes de Enero, Arreglo de baño..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowForm(false)}
                                className="btn-secondary flex-1"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddPayment}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${newPayment.tipo === 'ingreso' ? 'btn-success' : 'bg-danger hover:bg-danger/80 text-white shadow-lg shadow-danger/20'}`}
                            >
                                <Check className="w-5 h-5" />
                                Guardar {newPayment.tipo === 'ingreso' ? 'Pago' : 'Gasto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtros y Búsqueda */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por inquilino, unidad o descripción..."
                        className="input-field pl-12"
                    />
                </div>

                <div className="flex gap-2">
                    {(['todos', 'ingreso', 'gasto'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTipoFiltro(t)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${tipoFiltro === t
                                ? 'bg-info border-info text-white'
                                : 'bg-dark-700 border-dark-600 text-slate-400 hover:text-white'
                                }`}
                        >
                            {t === 'todos' ? 'Todos' : t === 'ingreso' ? 'Ingresos' : 'Gastos'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lista de movimientos */}
            <div className="card">
                <h2 className="text-lg font-semibold text-white mb-4">Historial Reciente</h2>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-info animate-spin mb-4" />
                        <p className="text-slate-400">Cargando transacciones...</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredPayments.map((p) => {
                            const config = conceptoConfig[p.categoria] || conceptoConfig.otros
                            return (
                                <div
                                    key={p.id}
                                    className={`p-4 rounded-xl flex items-center justify-between gap-4 transition-all hover:bg-dark-700/50 ${!p.confirmado ? 'bg-warning/10 border border-warning/30' : 'bg-dark-800'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${config.bg}`}>
                                            {p.tipo === 'ingreso' ? (
                                                <TrendingUp className={`w-5 h-5 ${config.color}`} />
                                            ) : (
                                                <TrendingDown className={`w-5 h-5 ${config.color}`} />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-white">
                                                    {p.tipo === 'ingreso' ? (p.inquilino_nombre || 'Ingreso Externo') : (config.label)}
                                                </p>
                                                {p.tipo === 'gasto' && (
                                                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-danger/20 text-danger border border-danger/20">Gasto</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-400">
                                                {p.unidad_nombre && `${p.unidad_nombre} • `}{p.descripcion || config.label}
                                            </p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(p.fecha).toLocaleDateString('es-CL')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className={`text-xl font-bold ${p.tipo === 'ingreso' ? 'text-success' : 'text-danger'}`}>
                                            {p.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(p.monto)}
                                        </p>
                                        {!p.confirmado ? (
                                            <button
                                                onClick={() => handleConfirmPayment(p.id)}
                                                className="text-xs text-warning hover:text-white underline transition-colors"
                                            >
                                                Confirmar
                                            </button>
                                        ) : (
                                            <span className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                                                <Check className="w-3 h-3" /> Registrado
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        {filteredPayments.length === 0 && (
                            <div className="text-center py-12">
                                <DollarSign className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                                <p className="text-slate-400">No hay movimientos que mostrar</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
