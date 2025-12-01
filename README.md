# Elixir Ventas - Sistema de Gestión y Control

Sistema de Punto de Venta (POS) y gestión administrativa de escritorio, diseñado a medida para **Elixir Helados**. Este software centraliza la operación diaria, automatiza el cálculo de promociones y ofrece métricas financieras en tiempo real.

## 📋 Descripción del Proyecto

El objetivo principal de este desarrollo fue reemplazar el control manual por una solución digital robusta que soporte la dinámica rápida de una heladería. El sistema permite registrar ventas con doble lista de precios (Mostrador vs. Delivery), aplicar reglas de descuento complejas automáticamente y visualizar el rendimiento del negocio mediante gráficos interactivos.

## 🚀 Funcionalidades Principales

### 1. Módulo de Ventas (POS)

- **Gestión de Canales:** Diferenciación automática de precios entre **Venta Local** (Mostrador) y **PedidosYa** (Delivery).
- **Multi-Pago:** Soporte para cobros en **Efectivo** y **Mercado Pago** con indicadores visuales.
- **Cálculo Automático:** Totalización de precios en tiempo real.
- **Historial:** Visualización de las últimas ventas con opción de anulación/cancelación inmediata.

### 2. Motor de Promociones Inteligente

Sistema automatizado que valida y aplica descuentos sin intervención manual:

- **Reglas Flexibles:** Configuración por días de la semana, rangos de fecha o canales específicos.
- **Tipos de Descuento:** Porcentaje (%), Precio Fijo (Combos) y Descuento por monto ($).
- **Prioridad:** Resolución automática de conflictos entre promociones.

### 3. Gestión de Datos (Inventario)

- **ABM de Productos:** Alta, baja y modificación de presentaciones (Kilo, 1/4, Cucurucho, etc.).
- **Precios Duales:** Configuración independiente de precio base y precio delivery para cada producto.

### 4. Reportes y Estadísticas

Dashboard analítico para la toma de decisiones:

- **Tendencias:** Gráfico de ingresos expandible (vista por horas o días).
- **Ranking:** Top de productos más vendidos.
- **Comparativa:** Balance de ingresos Local vs. Aplicaciones.
- **Filtros:** Visualización por día, semana, mes o rangos personalizados.

### 5. Seguridad y Sistema

- **Base de Datos Local:** Almacenamiento seguro en SQLite (sin dependencia de internet).
- **Copias de Seguridad:** Herramienta integrada para generar y restaurar Backups (.db) del sistema completo.

---

## 🛠️ Tecnologías Utilizadas

Este proyecto utiliza una arquitectura moderna de escritorio basada en tecnologías web:

- **Core:** [Electron](https://www.electronjs.org/) (Runtime de escritorio)
- **Frontend:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** Shadcn/ui (basado en Radix UI) & Lucide Icons
- **Gráficos:** Recharts
- **Base de Datos:** Better-SQLite3 (con modo WAL activado)
- **Notificaciones:** Sonner

## 📂 Estructura del Proyecto

```bash
├── electron/          # Lógica del proceso principal (Backend local)
│   ├── database/      # Repositorios y consultas SQL
│   ├── handlers/      # Manejadores de eventos IPC (Puente Front-Back)
│   └── db.js          # Conexión y migraciones automáticas SQLite
├── src/               # Interfaz de Usuario (Frontend React)
│   ├── components/    # Componentes modulares (Vistas, Tablas, Forms)
│   ├── hooks/         # Lógica de react (useProducts, usePromotions)
│   └── lib/           # Utilidades y configuración de estilos
└── heladeria.db       # Archivo de base de datos (generado automáticamente)
```
