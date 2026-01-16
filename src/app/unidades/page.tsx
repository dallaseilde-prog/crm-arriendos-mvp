'use client'

import { useState, useEffect } from 'react'
import { Building2, Plus, Edit2, Trash2, Zap, Search, Loader2 } from 'lucide-react'
import { Unit } from '@/types'
import { supabase } from '@/lib/supabase/client'

export default function UnidadesPage() {
    const [units, setUnits] = useState<Unit[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
    const [formData, setFormData] = useState({
        nombre: '',
        medidor_id: '',
        descripcion: '',
    })

    useEffect(() => {
        fetchUnits()
    }, [])

    const fetchUnits = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('unidades')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching units:', error)
        } else {
            setUnits(data || [])
        }
        setLoading(false)
    }

    const filteredUnits = units.filter(u =>
        u.nombre.toLowerCase().includes(search.toLowerCase()) ||
        u.medidor_id?.toLowerCase().includes(search.toLowerCase())
    )

    const handleSave = async () => {
        if (!formData.nombre) return

        try {
            if (editingUnit) {
                const { error } = await supabase
                    .from('unidades')
                    .update(formData)
                    .eq('id', editingUnit.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('unidades')
                    .insert([formData])

                if (error) throw error
            }

            await fetchUnits()
            setShowForm(false)
            setEditingUnit(null)
            setFormData({ nombre: '', medidor_id: '', descripcion: '' })
            alert(editingUnit ? 'Unidad actualizada' : 'Unidad creada')
        } catch (error: any) {
            console.error('Error saving unit:', error)
            alert('Error al guardar: ' + error.message)
        }
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

    const handleToggleActive = async (unit: Unit) => {
        const { error } = await supabase
            .from('unidades')
            .update({ activa: !unit.activa })
            .eq('id', unit.id)

        if (error) {
            console.error('Error toggling active:', error)
        } else {
            fetchUnits()
        }
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

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 card">
                    <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                    <p className="text-slate-400">Cargando unidades desde Supabase...</p>
                </div>
            ) : (
                <>

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
                                            onClick={() => handleToggleActive(unit)}
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
                </>
            )}
        </div>
    )
}
