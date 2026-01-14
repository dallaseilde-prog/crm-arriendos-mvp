# CRM Arriendos 🏠

Sistema de gestión de arriendos para propiedades multifamiliares. Permite administrar inquilinos, contratos, pagos y calcular la distribución justa de electricidad basada en consumo real.

## ✨ Características

### Dashboard Principal
- Vista general del estado de todas las unidades
- Estadísticas de ingresos, pendientes y ocupación
- Alertas de contratos por vencer
- Acciones rápidas para registrar pagos y lecturas

### 💡 Calculadora de Electricidad
La función más importante del sistema. Resuelve el problema de dividir justamente el costo de electricidad:
- Ingresa el monto total de la factura y el consumo del medidor principal
- Registra las lecturas de cada sub-contador
- El sistema calcula el costo real del kWh
- Distribuye el costo según el consumo real de cada unidad
- Opción de prorratear diferencias entre medidores

### 📋 Gestión de Contratos
- Crear y editar contratos de arriendo
- Alertas automáticas de vencimiento (30 días antes)
- Subida de documentos PDF
- Histórico por unidad

### 💰 Registro de Pagos
- Formulario rápido optimizado para móvil
- Registro de arriendos y servicios
- Generación de recibos digitales
- Historial de pagos con filtros

### 📊 Tabla Financiera Anual
- Resumen mensual de ingresos y gastos
- Comparativa Luz Cobrada vs Pagada
- Gastos de mantenimiento
- Cálculo de utilidad neta

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + React 18
- **Estilos**: Tailwind CSS con tema oscuro personalizado
- **Backend**: Supabase (PostgreSQL)
- **Lenguaje**: TypeScript
- **Iconos**: Lucide React

## 🚀 Instalación

### 1. Clonar e instalar dependencias

```bash
cd crm-arriendos
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ejecuta el script SQL en `supabase/migrations/001_initial_schema.sql` en el SQL Editor de Supabase
3. Copia las credenciales del proyecto

### 3. Variables de entorno

Crea un archivo `.env.local` basándote en `.env.local.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Páginas (App Router)
│   ├── page.tsx           # Dashboard principal
│   ├── unidades/          # Gestión de unidades
│   ├── inquilinos/        # Gestión de inquilinos
│   ├── contratos/         # Gestión de contratos
│   ├── electricidad/      # Calculadora de electricidad
│   ├── pagos/             # Registro de pagos
│   └── reportes/          # Tabla financiera anual
├── components/
│   ├── layout/            # Sidebar, MobileNav
│   └── units/             # UnitCard
├── lib/
│   ├── supabase/          # Cliente de Supabase
│   └── utils/
│       └── electricity.ts # Lógica de cálculo
└── types/                 # Definiciones TypeScript
```

## 🔧 Scripts Disponibles

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run start     # Servidor de producción
npm run lint      # Ejecutar ESLint
npm run type-check # Verificar tipos TypeScript
```

## 📱 Diseño Mobile-First

El sistema está optimizado para uso en dispositivos móviles:
- Navegación adaptativa (sidebar en desktop, menú hamburguesa en móvil)
- Cards y formularios optimizados para touch
- Botones de acción prominentes

## 🎨 Sistema de Diseño

### Colores
- **Verde** (`#22c55e`): Ingresos, pagado, éxito
- **Rojo** (`#ef4444`): Gastos, pendiente, errores
- **Amarillo** (`#f59e0b`): Advertencias, parcial
- **Azul** (`#3b82f6`): Información, acciones primarias

### Componentes CSS
```css
.card          /* Tarjeta base */
.card-hover    /* Tarjeta con hover */
.btn-primary   /* Botón azul */
.btn-success   /* Botón verde */
.btn-danger    /* Botón rojo */
.btn-secondary /* Botón gris */
.input-field   /* Campo de entrada */
.badge-*       /* Badges de estado */
```

## 📄 Licencia

MIT

---

Desarrollado con ❤️ para simplificar la gestión de propiedades en arriendo.
