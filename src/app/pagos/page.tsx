'use client'

import { useState } from 'react'
import { DollarSign, Check, Plus, Receipt, Calendar, User, Home, Search } from 'lucide-react'

interface Payment {
    id: string
    inquilino: string
    unidad: string
    concepto: 'arriendo' | 'luz' | 'deposito' | 'otro'
    monto: number
    fecha: string
    confirmado: boolean
}

const mockPayments: Payment[] = [
    { id: '1', inquilino: 'Juan Pérez', unidad: 'Habitación 1', concepto: 'arriendo', monto: 450000, fecha: '2024-01-05', confirmado: true },
    { id: '2', inquilino: 'Juan Pérez', unidad: 'Habitación 1', concepto: 'luz', monto: 32000, fecha: '2024-01-05', confirmado: true },
    { id: '3', inquilino: 'María García', unidad: 'Habitación 2', concepto: 'arriendo', monto: 450000, fecha: '2024-01-08', confirmado: true },
    { id: '4', inquilino: 'Carlos López', unidad: 'Apartamento A', concepto: 'arriendo', monto: 550000, fecha: '2024-01-10', confirmado: false },
]

const conceptoConfig = {
    arriendo: { label: 'Arriendo', color: 'text-success', bg: 'bg-success/20' },
    luz: { label: 'Electricidad', color: 'text-warning', bg: 'bg-warning/20' },
    deposito: { label: 'Depósito', color: 'text-info', bg: 'bg-info/20' },
    otro: { label: 'Otro', color: 'text-slate-400', bg: 'bg-slate-400/20' },
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    }).format(amount)
}

export default function PagosPage() {
    const [payments, setPayments] = useState(mockPayments)
    const [showForm, setShowForm] = useState(false)
    const [search, setSearch] = useState('')

    // Nuevo pago form
    const [newPayment, setNewPayment] = useState({
        inquilino: '',
        unidad: '',
        concepto: 'arriendo' as const,
        monto: 0,
    })

    const filteredPayments = payments.filter(p =>
        p.inquilino.toLowerCase().includes(search.toLowerCase()) ||
        p.unidad.toLowerCase().includes(search.toLowerCase())
    )

    const handleConfirmPayment = (id: string) => {
        setPayments(payments.map(p =>
            p.id === id ? { ...p, confirmado: true } : p
        ))
    }

    const handleAddPayment = () => {
        if (!newPayment.inquilino || !newPayment.monto) return

        const payment: Payment = {
            id: Date.now().toString(),
            ...newPayment,
            fecha: new Date().toISOString().split('T')[0],
            confirmado: true,
        }

        setPayments([payment, ...payments])
        setShowForm(false)
        setNewPayment({ inquilino: '', unidad: '', concepto: 'arriendo', monto: 0 })

        // Aquí se generaría el recibo digital
        alert('Pago registrado. Recibo generado.')
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
                    <p className="text-slate-400 text-sm">Total del Mes</p>
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
                                    Inquilino
                                </label>
                                <select
                                    value={newPayment.inquilino}
                                    onChange={(e) => setNewPayment({ ...newPayment, inquilino: e.target.value, unidad: e.target.value === 'Juan Pérez' ? 'Habitación 1' : 'Habitación 2' })}
                                    className="input-field"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Juan Pérez">Juan Pérez</option>
                                    <option value="María García">María García</option>
                                    <option value="Carlos López">Carlos López</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Concepto</label>
                                <select
                                    value={newPayment.concepto}
                                    onChange={(e) => setNewPayment({ ...newPayment, concepto: e.target.value as any })}
                                    className="input-field"
                                >
                                    <option value="arriendo">Arriendo</option>
                                    <option value="luz">Electricidad</option>
                                    <option value="deposito">Depósito</option>
                                    <option value="otro">Otro</option>
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
                                Registrar y Generar Recibo
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
                    placeholder="Buscar por inquilino o unidad..."
                    className="input-field pl-12"
                />
            </div>

            {/* Lista de pagos */}
            <div className="card">
                <h2 className="text-lg font-semibold text-white mb-4">Historial de Pagos</h2>

                <div className="space-y-3">
                    {filteredPayments.map((payment) => {
                        const config = conceptoConfig[payment.concepto]
                        return (
                            <div
                                key={payment.id}
                                className={`p-4 rounded-lg flex items-center justify-between gap-4 ${payment.confirmado ? 'bg-dark-800' : 'bg-warning/10 border border-warning/30'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${config.bg}`}>
                                        {payment.concepto === 'arriendo' ? (
                                            <Home className={`w-5 h-5 ${config.color}`} />
                                        ) : payment.concepto === 'luz' ? (
                                            <DollarSign className={`w-5 h-5 ${config.color}`} />
                                        ) : (
                                            <DollarSign className={`w-5 h-5 ${config.color}`} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{payment.inquilino}</p>
                                        <p className="text-sm text-slate-400">
                                            {payment.unidad} • {config.label}
                                        </p>
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
                </div>
            </div>
        </div>
    )
}
