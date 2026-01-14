'use client'

import { useState } from 'react'
import { Building2, Plus, Edit2, Trash2, Zap, Search } from 'lucide-react'
import { Unit } from '@/types'

const mockUnits: Unit[] = [
    { id: '1', nombre: 'Habitación 1', medidor_id: 'M001', descripcion: 'Habitación principal con baño compartido', activa: true, created_at: '' },
    { id: '2', nombre: 'Habitación 2', medidor_id: 'M002', descripcion: 'Habitación con baño privado', activa: true, created_at: '' },
    { id: '3', nombre: 'Apartamento A', medidor_id: 'M003', descripcion: 'Apartamento completo con cocina', activa: true, created_at: '' },
    { id: '4', nombre: 'Habitación 3', medidor_id: 'M004', descripcion: 'Habitación económica', activa: false, created_at: '' },
]

export default function UnidadesPage() {
    const [units, setUnits] = useState(mockUnits)
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
    const [formData, setFormData] = useState({
        nombre: '',
        medidor_id: '',
        descripcion: '',
    })

    const filteredUnits = units.filter(u =>
        u.nombre.toLowerCase().includes(search.toLowerCase()) ||
        u.medidor_id?.toLowerCase().includes(search.toLowerCase())
    )

    const handleSave = () => {
        if (!formData.nombre) return

        if (editingUnit) {
            setUnits(units.map(u =>
                u.id === editingUnit.id
                    ? { ...u, ...formData }
                    : u
            ))
        } else {
            const newUnit: Unit = {
                id: Date.now().toString(),
                ...formData,
                activa: true,
                created_at: new Date().toISOString(),
            }
            setUnits([...units, newUnit])
        }

        setShowForm(false)
        setEditingUnit(null)
        setFormData({ nombre: '', medidor_id: '', descripcion: '' })
    }

    const handleEdit = (unit: Unit) => {
        setEditingUnit(unit)
        setFormData({
            nombre: unit.nombre,
            medidor_id: unit.medidor_id || '',
            descripcion: unit.descripcion || '',
        })
        setShowForm(true)
    }

    const handleToggleActive = (id: string) => {
        setUnits(units.map(u =>
            u.id === id ? { ...u, activa: !u.activa } : u
        ))
    }

    const activeCount = units.filter(u => u.activa).length

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-purple-400" />
                        Gestión de Unidades
                    </h1>
                    <p className="text-slate-400 mt-1">
                        {activeCount} de {units.length} unidades activas
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Nueva Unidad
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o medidor..."
                    className="input-field pl-12"
                />
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm">
                    <div className="card w-full max-w-md">
                        <h2 className="text-xl font-bold text-white mb-4">
                            {editingUnit ? 'Editar Unidad' : 'Nueva Unidad'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Nombre</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="input-field"
                                    placeholder="Habitación 1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-2">
                                    <Zap className="w-4 h-4 inline mr-1" />
                                    ID del Medidor
                                </label>
                                <input
                                    type="text"
                                    value={formData.medidor_id}
                                    onChange={(e) => setFormData({ ...formData, medidor_id: e.target.value })}
                                    className="input-field"
                                    placeholder="M001"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Descripción</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="input-field min-h-[100px]"
                                    placeholder="Descripción de la unidad..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowForm(false)
                                    setEditingUnit(null)
                                    setFormData({ nombre: '', medidor_id: '', descripcion: '' })
                                }}
                                className="btn-secondary flex-1"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn-primary flex-1"
                            >
                                {editingUnit ? 'Guardar Cambios' : 'Crear Unidad'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lista de unidades */}
            <div className="grid gap-4 md:grid-cols-2">
                {filteredUnits.map((unit) => (
                    <div
                        key={unit.id}
                        className={`card ${!unit.activa ? 'opacity-60' : ''}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${unit.activa ? 'bg-purple-500/20' : 'bg-dark-600'}`}>
                                    <Building2 className={`w-5 h-5 ${unit.activa ? 'text-purple-400' : 'text-slate-500'}`} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{unit.nombre}</h3>
                                    {unit.medidor_id && (
                                        <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                                            <Zap className="w-3 h-3" />
                                            Medidor: {unit.medidor_id}
                                        </p>
                                    )}
                                    {unit.descripcion && (
                                        <p className="text-sm text-slate-500 mt-2">{unit.descripcion}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <span className={`badge-${unit.activa ? 'success' : 'danger'} mr-2`}>
                                    {unit.activa ? 'Activa' : 'Inactiva'}
                                </span>
                                <button
                                    onClick={() => handleEdit(unit)}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleToggleActive(unit.id)}
                                    className="p-2 text-slate-400 hover:text-warning transition-colors"
                                    title={unit.activa ? 'Desactivar' : 'Activar'}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUnits.length === 0 && (
                <div className="card text-center py-12">
                    <Building2 className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                    <p className="text-slate-400">No se encontraron unidades</p>
                </div>
            )}
        </div>
    )
}
