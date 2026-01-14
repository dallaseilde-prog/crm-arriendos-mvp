'use client'

import { useState } from 'react'
import { Users, Plus, Edit2, Phone, Mail, Search, User } from 'lucide-react'
import { Tenant, TenantStatus } from '@/types'

const mockTenants: Tenant[] = [
    { id: '1', nombre: 'Juan Pérez', telefono: '+56912345678', email: 'juan.perez@email.com', documento_identidad: '12.345.678-9', estado: 'activo', created_at: '' },
    { id: '2', nombre: 'María García', telefono: '+56923456789', email: 'maria.garcia@email.com', documento_identidad: '23.456.789-0', estado: 'activo', created_at: '' },
    { id: '3', nombre: 'Carlos López', telefono: '+56934567890', email: 'carlos.lopez@email.com', documento_identidad: '34.567.890-1', estado: 'activo', created_at: '' },
    { id: '4', nombre: 'Ana Martínez', telefono: '+56945678901', email: 'ana.martinez@email.com', estado: 'prospecto', created_at: '' },
]

const estadoConfig: Record<TenantStatus, { label: string; class: string }> = {
    activo: { label: 'Activo', class: 'badge-success' },
    inactivo: { label: 'Inactivo', class: 'badge-danger' },
    prospecto: { label: 'Prospecto', class: 'badge-warning' },
}

export default function InquilinosPage() {
    const [tenants, setTenants] = useState(mockTenants)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<TenantStatus | 'todos'>('todos')
    const [showForm, setShowForm] = useState(false)
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        email: '',
        documento_identidad: '',
        estado: 'prospecto' as TenantStatus,
    })

    const filteredTenants = tenants.filter(t => {
        const matchesSearch = t.nombre.toLowerCase().includes(search.toLowerCase()) ||
            t.email?.toLowerCase().includes(search.toLowerCase()) ||
            t.telefono?.includes(search)
        if (filter === 'todos') return matchesSearch
        return matchesSearch && t.estado === filter
    })

    const handleSave = () => {
        if (!formData.nombre) return

        if (editingTenant) {
            setTenants(tenants.map(t =>
                t.id === editingTenant.id ? { ...t, ...formData } : t
            ))
        } else {
            const newTenant: Tenant = {
                id: Date.now().toString(),
                ...formData,
                created_at: new Date().toISOString(),
            }
            setTenants([...tenants, newTenant])
        }

        setShowForm(false)
        setEditingTenant(null)
        setFormData({ nombre: '', telefono: '', email: '', documento_identidad: '', estado: 'prospecto' })
    }

    const handleEdit = (tenant: Tenant) => {
        setEditingTenant(tenant)
        setFormData({
            nombre: tenant.nombre,
            telefono: tenant.telefono || '',
            email: tenant.email || '',
            documento_identidad: tenant.documento_identidad || '',
            estado: tenant.estado,
        })
        setShowForm(true)
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-info" />
                        Gestión de Inquilinos
                    </h1>
                    <p className="text-slate-400 mt-1">
                        {tenants.filter(t => t.estado === 'activo').length} inquilinos activos
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Inquilino
                </button>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre, email o teléfono..."
                        className="input-field pl-12"
                    />
                </div>

                <div className="flex gap-2">
                    {(['todos', 'activo', 'inactivo', 'prospecto'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                    ? 'bg-info text-white'
                                    : 'bg-dark-700 text-slate-400 hover:text-white'
                                }`}
                        >
                            {f === 'todos' ? 'Todos' : estadoConfig[f].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm">
                    <div className="card w-full max-w-md">
                        <h2 className="text-xl font-bold text-white mb-4">
                            {editingTenant ? 'Editar Inquilino' : 'Nuevo Inquilino'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Nombre Completo *</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="input-field"
                                    placeholder="Juan Pérez"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Teléfono</label>
                                    <input
                                        type="tel"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                        className="input-field"
                                        placeholder="+56912345678"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Estado</label>
                                    <select
                                        value={formData.estado}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value as TenantStatus })}
                                        className="input-field"
                                    >
                                        <option value="prospecto">Prospecto</option>
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field"
                                    placeholder="email@ejemplo.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Documento de Identidad</label>
                                <input
                                    type="text"
                                    value={formData.documento_identidad}
                                    onChange={(e) => setFormData({ ...formData, documento_identidad: e.target.value })}
                                    className="input-field"
                                    placeholder="12.345.678-9"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowForm(false)
                                    setEditingTenant(null)
                                    setFormData({ nombre: '', telefono: '', email: '', documento_identidad: '', estado: 'prospecto' })
                                }}
                                className="btn-secondary flex-1"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn-primary flex-1"
                            >
                                {editingTenant ? 'Guardar Cambios' : 'Crear Inquilino'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lista */}
            <div className="grid gap-4 md:grid-cols-2">
                {filteredTenants.map((tenant) => (
                    <div key={tenant.id} className="card">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-info to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {tenant.nombre.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-white">{tenant.nombre}</h3>
                                        <span className={estadoConfig[tenant.estado].class}>
                                            {estadoConfig[tenant.estado].label}
                                        </span>
                                    </div>
                                    <div className="mt-2 space-y-1">
                                        {tenant.telefono && (
                                            <a href={`tel:${tenant.telefono}`} className="flex items-center gap-2 text-sm text-slate-400 hover:text-info transition-colors">
                                                <Phone className="w-3 h-3" />
                                                {tenant.telefono}
                                            </a>
                                        )}
                                        {tenant.email && (
                                            <a href={`mailto:${tenant.email}`} className="flex items-center gap-2 text-sm text-slate-400 hover:text-info transition-colors">
                                                <Mail className="w-3 h-3" />
                                                {tenant.email}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleEdit(tenant)}
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredTenants.length === 0 && (
                <div className="card text-center py-12">
                    <User className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                    <p className="text-slate-400">No se encontraron inquilinos</p>
                </div>
            )}
        </div>
    )
}
