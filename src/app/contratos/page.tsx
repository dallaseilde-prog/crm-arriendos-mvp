'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus, AlertTriangle, Calendar, User, Home, Upload, Eye, Search, Loader2, X, DollarSign } from 'lucide-react'
import { Contract, Unit, Tenant } from '@/types'
import { supabase } from '@/lib/supabase/client'

interface ContractWithRelations extends Contract {
    inquilino_nombre: string
    unidad_nombre: string
    dias_restantes: number
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    }).format(amount)
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

export default function ContratosPage() {
    const [contracts, setContracts] = useState<ContractWithRelations[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'todos' | 'activos' | 'por_vencer'>('todos')

    // Form state
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [units, setUnits] = useState<Unit[]>([])
    const [tenants, setTenants] = useState<Tenant[]>([])
    const [formData, setFormData] = useState({
        inquilino_id: '',
        unidad_id: '',
        fecha_inicio: '',
        fecha_fin: '',
        monto_arriendo_base: 0,
        deposito: 0,
        dia_pago_mensual: 5,
    })

    useEffect(() => {
        fetchContracts()
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        if (!supabase) return
        try {
            const { data: unitsData } = await supabase.from('unidades').select('*').eq('activa', true)
            const { data: tenantsData } = await supabase.from('inquilinos').select('*').eq('estado', 'activo')
            setUnits(unitsData || [])
            setTenants(tenantsData || [])
        } catch (error) {
            console.error('Error fetching units/tenants:', error)
        }
    }

    const fetchContracts = async () => {
        if (!supabase) {
            setLoading(false)
            return
        }
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('vista_contratos_completos')
                .select('*')
                .order('fecha_fin', { ascending: true })

            if (error) throw error
            setContracts(data || [])
        } catch (error) {
            console.error('Error fetching contracts:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!formData.inquilino_id || !formData.unidad_id || !formData.fecha_inicio || !formData.fecha_fin) {
            alert('Por favor complete todos los campos obligatorios.')
            return
        }

        if (!supabase) {
            alert('Error: No hay conexión con la base de datos')
            return
        }

        setSaving(true)
        try {
            const { error } = await supabase.from('contratos').insert([formData])
            if (error) throw error

            await fetchContracts()
            setShowForm(false)
            setFormData({
                inquilino_id: '',
                unidad_id: '',
                fecha_inicio: '',
                fecha_fin: '',
                monto_arriendo_base: 0,
                deposito: 0,
                dia_pago_mensual: 5,
            })
        } catch (error) {
            console.error('Error saving contract:', error)
            alert('Error al guardar el contrato.')
        } finally {
            setSaving(false)
        }
    }

    const handleView = (contract: ContractWithRelations) => {
        alert(`Detalles del contrato:\nUnidad: ${contract.unidad_nombre}\nInquilino: ${contract.inquilino_nombre}\nArriendo: ${formatCurrency(contract.monto_arriendo_base)}`)
    }

    const handlePdf = (contract: ContractWithRelations) => {
        alert(`Generando PDF para el contrato de ${contract.inquilino_nombre}...`)
        // En una app real, aquí se abriría una ruta de PDF o se generaría en el cliente
        window.print()
    }

    const expiringContracts = contracts.filter(c => c.dias_restantes <= 30 && c.estado_activo)

    const filteredContracts = contracts.filter(c => {
        const matchesSearch = c.inquilino_nombre.toLowerCase().includes(search.toLowerCase()) ||
            c.unidad_nombre.toLowerCase().includes(search.toLowerCase())

        if (filter === 'activos') return matchesSearch && c.estado_activo
        if (filter === 'por_vencer') return matchesSearch && c.dias_restantes <= 30
        return matchesSearch
    })

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <FileText className="w-8 h-8 text-info" />
                        Gestor de Contratos
                    </h1>
                    <p className="text-slate-400 mt-1">Administra los contratos de arriendo</p>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Contrato
                </button>
            </div>

            {/* Modal de Nuevo Contrato */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm">
                    <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-info" />
                                Nuevo Contrato de Arriendo
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Inquilino */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Inquilino *</label>
                                <select
                                    className="input-field"
                                    value={formData.inquilino_id}
                                    onChange={(e) => setFormData({ ...formData, inquilino_id: e.target.value })}
                                >
                                    <option value="">Seleccionar Inquilino...</option>
                                    {tenants.map(t => (
                                        <option key={t.id} value={t.id}>{t.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Unidad */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Unidad / Propiedad *</label>
                                <select
                                    className="input-field"
                                    value={formData.unidad_id}
                                    onChange={(e) => setFormData({ ...formData, unidad_id: e.target.value })}
                                >
                                    <option value="">Seleccionar Unidad...</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.id}>{u.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Fechas */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2 font-medium">Fecha de Inicio *</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={formData.fecha_inicio}
                                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2 font-medium">Fecha de Término *</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={formData.fecha_fin}
                                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                                />
                            </div>

                            {/* Montos */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2 font-medium">Monto Arriendo Mensual ($) *</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="number"
                                        className="input-field pl-10"
                                        placeholder="450000"
                                        value={formData.monto_arriendo_base || ''}
                                        onChange={(e) => setFormData({ ...formData, monto_arriendo_base: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2 font-medium">Depósito de Garantía ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="number"
                                        className="input-field pl-10"
                                        placeholder="450000"
                                        value={formData.deposito || ''}
                                        onChange={(e) => setFormData({ ...formData, deposito: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            {/* Día Pago */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2 font-medium">Día de Pago (Mensual)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    className="input-field"
                                    placeholder="5"
                                    value={formData.dia_pago_mensual}
                                    onChange={(e) => setFormData({ ...formData, dia_pago_mensual: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setShowForm(false)}
                                className="btn-secondary flex-1"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                                {saving ? 'Guardando...' : 'Crear Contrato'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alerta de contratos por vencer */}
            {!loading && expiringContracts.length > 0 && (
                <div className="card border-warning/50 bg-warning/10">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-warning">
                                {expiringContracts.length} contrato(s) por vencer en los próximos 30 días
                            </p>
                            <ul className="text-sm text-slate-300 mt-2 space-y-1">
                                {expiringContracts.map(c => (
                                    <li key={c.id}>
                                        • {c.inquilino_nombre} ({c.unidad_nombre}) - {Math.round(c.dias_restantes)} días restantes
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por inquilino o unidad..."
                        className="input-field pl-12"
                    />
                </div>

                <div className="flex gap-2">
                    {(['todos', 'activos', 'por_vencer'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                ? 'bg-info text-white'
                                : 'bg-dark-700 text-slate-400 hover:text-white'
                                }`}
                        >
                            {f === 'todos' ? 'Todos' : f === 'activos' ? 'Activos' : 'Por Vencer'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lista de contratos */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 card">
                    <Loader2 className="w-12 h-12 text-info animate-spin mb-4" />
                    <p className="text-slate-400">Cargando contratos desde Supabase...</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredContracts.map((contract) => {
                        const isExpiring = contract.dias_restantes <= 30

                        return (
                            <div
                                key={contract.id}
                                className={`card ${isExpiring ? 'border-warning/50' : ''}`}
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {/* Info principal */}
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-lg ${isExpiring ? 'bg-warning/20' : 'bg-info/20'}`}>
                                            <FileText className={`w-6 h-6 ${isExpiring ? 'text-warning' : 'text-info'}`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-semibold text-white text-lg">{contract.unidad_nombre}</h3>
                                                {contract.estado_activo ? (
                                                    <span className="badge-success">Activo</span>
                                                ) : (
                                                    <span className="badge-danger">Inactivo</span>
                                                )}
                                                {isExpiring && (
                                                    <span className="badge-warning">Por vencer</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 mt-1">
                                                <User className="w-4 h-4" />
                                                <span>{contract.inquilino_nombre}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detalles */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                                        <div>
                                            <p className="text-xs text-slate-400">Inicio</p>
                                            <p className="text-sm text-white font-medium">{formatDate(contract.fecha_inicio)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Fin</p>
                                            <p className={`text-sm font-medium ${isExpiring ? 'text-warning' : 'text-white'}`}>
                                                {formatDate(contract.fecha_fin)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Arriendo</p>
                                            <p className="text-sm text-success font-medium">{formatCurrency(contract.monto_arriendo_base)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Días restantes</p>
                                            <p className={`text-sm font-medium ${isExpiring ? 'text-warning' : 'text-white'}`}>
                                                {Math.round(contract.dias_restantes)} días
                                            </p>
                                        </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleView(contract)}
                                            className="btn-secondary flex items-center gap-2 text-sm"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Ver
                                        </button>
                                        <button
                                            onClick={() => handlePdf(contract)}
                                            className="btn-secondary flex items-center gap-2 text-sm"
                                        >
                                            <Upload className="w-4 h-4" />
                                            PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {!loading && filteredContracts.length === 0 && (
                <div className="card text-center py-12">
                    <FileText className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                    <p className="text-slate-400">No se encontraron contratos</p>
                </div>
            )}
        </div>
    )
}
