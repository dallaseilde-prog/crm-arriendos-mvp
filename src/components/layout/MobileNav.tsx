'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Menu,
    X,
    Home,
    Users,
    FileText,
    Zap,
    DollarSign,
    BarChart3,
    Building2
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

export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    return (
        <>
            {/* Top bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-dark-800/95 backdrop-blur-sm border-b border-dark-700">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-info to-purple-500 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-white">CRM Arriendos</span>
                    </div>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu overlay */}
            {isOpen && (
                <div className="lg:hidden fixed inset-0 z-30 bg-dark-900/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            )}

            {/* Mobile menu */}
            <div className={`
        lg:hidden fixed top-14 left-0 right-0 z-30 bg-dark-800 border-b border-dark-700 
        transition-all duration-300 transform
        ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}
      `}>
                <nav className="p-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                  ${isActive
                                        ? 'bg-info/20 text-info'
                                        : 'text-slate-400 hover:bg-dark-700 hover:text-white'
                                    }
                `}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </>
    )
}
