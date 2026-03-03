# Sistema de Gestión Integral - Galpón Vial (Municipio de Lobería)

   Este proyecto fue desarrollado como parte de mi Práctica Profesional Supervisada (PPS) para la Tecnicatura Universitaria en Desarrollo de Aplicaciones                Informáticas (UNICEN). Se trata de una solución corporativa diseñada para digitalizar y centralizar la gestión operativa del Galpón Vial Municipal,                   reemplazando procesos manuales por una plataforma robusta, segura y auditable.
---
## Visión General y Objetivos

El objetivo principal fue dotar al municipio de una herramienta que permitiera optimizar el registro y control de sus recursos críticos: vehículos, inventario de herramientas, materiales y la actividad operativa diaria, garantizando la trazabilidad absoluta de cada movimiento.
---
## Módulos y Funcionalidades Principales

El sistema se estructura en cuatro pilares fundamentales, cada uno con reglas de negocio específicas:
1. Módulo de almacén: Diseñado para el control minucioso de herramientas, repuestos y materiales.
   - Gestión de Stock: Altas, bajas y modificaciones con consulta en tiempo real.
   - Auditoría Estricta: Registro histórico de cada movimiento (entradas/salidas), identificando al usuario responsable y la marca de tiempo exacta.
   - Organización Dinámica: Categorización lógica y filtros avanzados por unidad de medida, stock mínimo y otros atributos.
   - Gestión Multimedia: Integración con Cloudinary para el almacenamiento y redimensionamiento eficiente de imágenes de los artículos.
2. Módulo de vehículos: Administración integral del ciclo de vida de la flota municipal.
   - Trazabilidad Operativa: Registro inalterable de los cambios de estado de cada unidad.
   - Vista 360°: Detalle individual por vehículo que consolida historial de uso, cargas de combustible e incidentes reportados.
3. Módulo de Servicios: Centraliza las operaciones diarias asociadas a la flota, funcionando como el motor de auditoría del galpón.
   - Control de Combustible: Registro detallado de repostajes (litros, fecha, responsable) con validación de consistencia contra el stock del almacén.
   - Reporte de Incidentes: Declaración de fallas categorizadas por nivel de criticidad para priorizar su resolución técnica.
   - Asignación de Responsabilidades: Funcionalidad exclusiva para administradores que vincula formalmente un vehículo a un operario por un tiempo determinado.
   - Sistema de Recordatorios: Alertas operativas con permisos granulares (los usuarios estándar gestionan los propios, mientras que los Superadministradores          pueden asignar alertas a otros).
4. Seguridad y Gestión de Usuarios: Un sólido modelo RBAC (Role-Based Access Control) protege la integridad de los datos municipales..
   - Permisos Granulares: Acceso dinámico a funciones de lectura/escritura según el rol (Administrador de Almacén, Superusuario, Administrador, Superadministrador.
   - Panel Administrativo: Centralización para la creación de usuarios, reseteo de contraseñas y gestión de estados de cuenta (activación/desactivación).

---
## Stack Tecnológico
- NestJS con TypeScript, arquitectura modular (Controllers, Services, Repositories).
- React y Tailwind CSS, componentes reutilizables y diseño centrado en el usuario (UX/UI).
- PostgreSQL (TypeORM) para persistencia y SQLite para entornos de prueba.
- JWT (Stateless Sessions), Guards personalizados en NestJS y encriptación Bcrypt.
- Docker para la estandarización de entornos de desarrollo y testing.

---
## Impacto
Este desarrollo permitió al Municipio de Lobería digitalizar procesos críticos, garantizando la seguridad de sus bienes y facilitando auditorías internas mediante datos confiables y actualizados.
