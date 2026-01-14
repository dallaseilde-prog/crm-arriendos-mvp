'use client'

import { useState } from 'react'
import { FileText, Plus, AlertTriangle, Calendar, User, Home, Upload, Eye, Search } from 'lucide-react'
import { Contract } from '@/types'

interface ContractWithRelations extends Contract {
    inquilinoNombre: string
    unidadNombre: string
    diasRestantes: number
}

const mockContracts: ContractWithRelations[] = [
    {
        id: '1',
        inquilino_id: '1',
        unidad_id: '1',
        inquilinoNombre: 'Juan Pérez',
        unidadNombre: 'Habitación 1',
        fecha_inicio: '2023-06-01',
        fecha_fin: '2024-06-01',
        monto_arriendo_base: 450000,
        deposito: 450000,
        estado_activo: true,
        created_at: '',
        diasRestantes: 142,
    },
    {
        id: '2',
        inquilino_id: '2',
        unidad_id: '2',
        inquilinoNombre: 'María García',
        unidadNombre: 'Habitación 2',
        fecha_inicio: '2023-08-15',
        fecha_fin: '2024-02-15',
        monto_arriendo_base: 450000,
        deposito: 450000,
        estado_activo: true,
        created_at: '',
        diasRestantes: 35, // Por vencer
    },
    {
        id: '3',
        inquilino_id: '3',
        unidad_id: '3',
        inquilinoNombre: 'Carlos López',
        unidadNombre: 'Apartamento A',
        fecha_inicio: '2023-03-01',
        fecha_fin: '2024-03-01',
        monto_arriendo_base: 550000,
        deposito: 550000,
        estado_activo: true,
        created_at: '',
        diasRestantes: 50,
    },
]

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
    const [contracts, setContracts] = useState(mockContracts)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<'todos' | 'activos' | 'por_vencer'>('todos')

    const expiringContracts = contracts.filter(c => c.diasRestantes <= 30 && c.estado_activo)

    const filteredContracts = contracts.filter(c => {
        const matchesSearch = c.inquilinoNombre.toLowerCase().includes(search.toLowerCase()) ||
            c.unidadNombre.toLowerCase().includes(search.toLowerCase())

        if (filter === 'activos') return matchesSearch && c.estado_activo
        if (filter === 'por_vencer') return matchesSearch && c.diasRestantes <= 30
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

                <button className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nuevo Contrato
                </button>
            </div>

            {/* Alerta de contratos por vencer */}
            {expiringContracts.length > 0 && (
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
                                        • {c.inquilinoNombre} ({c.unidadNombre}) - {c.diasRestantes} días restantes
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
            <div className="grid gap-4">
                {filteredContracts.map((contract) => {
                    const isExpiring = contract.diasRestantes <= 30

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
                                            <h3 className="font-semibold text-white text-lg">{contract.unidadNombre}</h3>
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
                                            <span>{contract.inquilinoNombre}</span>
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
                                            {contract.diasRestantes} días
                                        </p>
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="flex gap-2">
                                    <button className="btn-secondary flex items-center gap-2 text-sm">
                                        <Eye className="w-4 h-4" />
                                        Ver
                                    </button>
                                    <button className="btn-secondary flex items-center gap-2 text-sm">
                                        <Upload className="w-4 h-4" />
                                        PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {filteredContracts.length === 0 && (
                <div className="card text-center py-12">
                    <FileText className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                    <p className="text-slate-400">No se encontraron contratos</p>
                </div>
            )}
        </div>
    )
}
