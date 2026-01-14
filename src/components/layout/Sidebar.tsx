'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Home,
    Users,
    FileText,
    Zap,
    DollarSign,
    BarChart3,
    Building2,
    Settings
} from 'lucide-react'

const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Unidades', href: '/unidades', icon: Building2 },
    { name: 'Inquilinos', href: '/inquilinos', icon: Users },
    { name: 'Contratos', href: '/contratos', icon: FileText },
    { name: 'Electricidad', href: '/electricidad', icon: Zap },
    { name: 'Pagos', href: '/pagos', icon: DollarSign },
    { name: 'Reportes', href: '/reportes', icon: BarChart3 },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-dark-800 border-r border-dark-700">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-dark-700">
                <div className="w-10 h-10 bg-gradient-to-br from-info to-purple-500 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-white">CRM Arriendos</h1>
                    <p className="text-xs text-slate-400">Gestión de Propiedades</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                                    ? 'bg-info/20 text-info border-l-2 border-info'
                                    : 'text-slate-400 hover:bg-dark-700 hover:text-white'
                                }
              `}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-dark-700">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-dark-700 hover:text-white transition-all duration-200"
                >
                    <Settings className="w-5 h-5" />
                    Configuración
                </Link>
            </div>
        </aside>
    )
}
