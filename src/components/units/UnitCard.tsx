'use client'

import { DollarSign, Zap, User, Home } from 'lucide-react'
import { UnitWithStatus } from '@/types'

interface UnitCardProps {
    unit: UnitWithStatus
    onPaymentClick?: (unitId: string) => void
}

export default function UnitCard({ unit, onPaymentClick }: UnitCardProps) {
    const statusConfig = {
        paid: {
            label: 'Pagado',
            bgColor: 'bg-success/20',
            textColor: 'text-success',
            borderColor: 'border-success/30',
            icon: '✓',
        },
        pending: {
            label: 'Pendiente',
            bgColor: 'bg-danger/20',
            textColor: 'text-danger',
            borderColor: 'border-danger/30',
            icon: '!',
        },
        partial: {
            label: 'Parcial',
            bgColor: 'bg-warning/20',
            textColor: 'text-warning',
            borderColor: 'border-warning/30',
            icon: '~',
        },
    }

    const status = statusConfig[unit.status]
    const rentAmount = unit.rentAmount || 450000
    const electricityAmount = unit.electricityAmount || 32000

    return (
        <div className={`card-hover border ${status.borderColor}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${status.bgColor}`}>
                        <Home className={`w-4 h-4 ${status.textColor}`} />
                    </div>
                    <h3 className="font-semibold text-white">{unit.nombre}</h3>
                </div>
                <span className={`
          px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1
          ${status.bgColor} ${status.textColor} border ${status.borderColor}
        `}>
                    <span>{status.icon}</span>
                    {status.label}
                </span>
            </div>

            {/* Tenant info */}
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                <User className="w-4 h-4" />
                <span>{unit.tenant || 'Sin inquilino'}</span>
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className={`p-3 rounded-lg ${unit.status === 'paid' ? 'bg-success/10' : 'bg-dark-800'}`}>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                        <DollarSign className="w-3 h-3" />
                        Arriendo
                    </div>
                    <p className={`font-bold ${unit.status === 'paid' ? 'text-success' : 'text-white'}`}>
                        ${rentAmount.toLocaleString('es-CL')}
                    </p>
                </div>
                <div className={`p-3 rounded-lg ${unit.status === 'paid' ? 'bg-success/10' : 'bg-dark-800'}`}>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                        <Zap className="w-3 h-3" />
                        Luz
                    </div>
                    <p className={`font-bold ${unit.status === 'paid' ? 'text-success' : 'text-warning'}`}>
                        ${electricityAmount.toLocaleString('es-CL')}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <button
                onClick={() => onPaymentClick?.(unit.id)}
                className={`
          w-full py-2.5 rounded-lg font-medium text-sm transition-all
          ${unit.status === 'paid'
                        ? 'bg-dark-600 text-slate-400 cursor-default'
                        : 'btn-success'
                    }
        `}
                disabled={unit.status === 'paid'}
            >
                {unit.status === 'paid' ? 'Al día' : 'Registrar Pago'}
            </button>
        </div>
    )
}
