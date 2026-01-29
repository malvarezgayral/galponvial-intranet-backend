# Entidad Intermedia: UsuarioRol

## Overview

Se implementó una **entidad explícita `UsuarioRol`** para gestionar la relación Many-to-Many entre **Usuario** y **Rol**. Aunque TypeORM puede manejar la tabla de unión automáticamente, tener una entidad explícita proporciona:

1. **Control explícito** sobre la tabla de unión
2. **Campos adicionales** para auditoría y seguimiento (fecha_asignacion, fecha_actualizacion)
3. **Queries más complejas** cuando sea necesario
4. **Claridad** en la arquitectura de base de datos

## Estructura de Entidad

```typescript
@Entity('usuario_rol')
export class UsuarioRol {
  @PrimaryColumn('bigint')
  dni: number;

  @PrimaryColumn('int')
  rol_id: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.usuarioRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dni' })
  usuario: Usuario;

  @ManyToOne(() => Rol, (rol) => rol.usuarioRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @CreateDateColumn()
  fecha_asignacion: Date;

  @UpdateDateColumn()
  fecha_actualizacion: Date;
}
```

## Relaciones Actualizadas

### Usuario Entity
```typescript
@OneToMany(() => UsuarioRol, (ur) => ur.usuario, {
  cascade: true,
  eager: true,
})
usuarioRoles: UsuarioRol[];

// Getter para acceso conveniente a roles
get roles(): Rol[] {
  return this.usuarioRoles?.map((ur) => ur.rol) ?? [];
}
```

### Rol Entity
```typescript
@OneToMany(() => UsuarioRol, (ur) => ur.rol)
usuarioRoles: UsuarioRol[];
```

## Schema de Base de Datos

```sql
CREATE TABLE usuario_rol (
  dni BIGINT NOT NULL,
  rol_id INT NOT NULL,
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (dni, rol_id),
  FOREIGN KEY (dni) REFERENCES usuario(dni) ON DELETE CASCADE,
  FOREIGN KEY (rol_id) REFERENCES rol(id) ON DELETE CASCADE
);
```

## Cómo Funciona

### 1. Acceso a Roles desde Usuario

```typescript
const user = await userRepository.findOne({
  where: { dni: 12345678 },
  relations: ['usuarioRoles', 'usuarioRoles.rol'],
});

// Opción 1: Acceder a través de usuarioRoles
const usuarioRoles: UsuarioRol[] = user.usuarioRoles;
// usuarioRoles[0] = { dni, rol_id, usuario, rol, fecha_asignacion, ... }

// Opción 2: Usar el getter de conveniencia
const roles: Rol[] = user.roles;
// roles[0] = { id, rol, permisos, ... }

// Opción 3: Combinar permisos
const permisos = user.roles.flatMap(r => r.permisos);
```

### 2. Asignar Nuevo Rol a Usuario

```typescript
// Crear la asignación
const usuarioRol = usuarioRolRepository.create({
  dni: usuario.dni,
  rol_id: rol.id,
  usuario,  // objeto usuario
  rol,      // objeto rol
});

// Guardar
await usuarioRolRepository.save(usuarioRol);

// El usuario ahora tiene acceso a todos los permisos de ese rol
```

### 3. Remover Rol de Usuario

```typescript
// Opción 1: Por DNI y rol_id específico
await usuarioRolRepository.delete({
  dni: 12345678,
  rol_id: 3,
});

// Opción 2: Remover todos los roles del usuario
await usuarioRolRepository.delete({
  dni: 12345678,
});
```

### 4. Auditoría: Ver Cuándo se Asignó un Rol

```typescript
const usuarioRol = await usuarioRolRepository.findOne({
  where: { dni: 12345678, rol_id: 3 },
});

console.log('Asignado el:', usuarioRol.fecha_asignacion);
console.log('Actualizado el:', usuarioRol.fecha_actualizacion);
```

## Ventajas de la Entidad Explícita

| Aspecto | Ventaja |
|--------|---------|
| **Auditoría** | Campos `fecha_asignacion` y `fecha_actualizacion` registran cambios |
| **Cascadas** | `onDelete: 'CASCADE'` asegura integridad referencial |
| **Queries Complejas** | Puedes filtrar por fecha de asignación, por ejemplo |
| **Documentación** | Explícita en el código qué es la tabla de unión |
| **Mantenimiento** | Fácil agregar campos en el futuro (ej: `activo: boolean`) |
| **Control** | TypeORM no genera automáticamente la tabla, **tú la controlas** |

## Queries Complejas Posibles

### Usuarios asignados a un rol en los últimos 7 días

```typescript
const recentlyAssigned = await usuarioRolRepository.find({
  where: {
    rol_id: 3,
    fecha_asignacion: MoreThan(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
  },
  relations: ['usuario', 'rol'],
});
```

### Usuarios que perdieron acceso a un rol específico

```typescript
const removedAccess = await usuarioRolRepository
  .createQueryBuilder('ur')
  .where('ur.rol_id = :rolId', { rolId: 3 })
  .andWhere('ur.fecha_actualizacion < NOW() - INTERVAL 30 DAY')
  .getMany();
```

### Usuarios con múltiples roles en almacén taller

```typescript
const tallerUsers = await usuarioRepository
  .createQueryBuilder('u')
  .leftJoinAndSelect('u.usuarioRoles', 'ur')
  .leftJoinAndSelect('ur.rol', 'r')
  .where('r.rol = :rol', { rol: 'taller' })
  .groupBy('u.dni')
  .having('COUNT(ur.rol_id) > 1')
  .getMany();
```

## Integración con Seeders

### CSV para poblar usuario_rol

```csv
dni,rol_id
12345678,1
87654321,2
11223344,1
11223344,3
55667788,3
```

### Seed Service (si es necesario)

```typescript
// El servicio de seed puede cargar usuario_rol.csv
// y poblar la tabla de unión automáticamente
const usuarioRoles = await this.csvReaderService.readUsuarioRol();
await this.usuarioRolRepository.save(usuarioRoles);
```

## Cambios en Servicios

### UsuarioService.addRol()

```typescript
async addRol(dto: AssignRolDto, dni: number): Promise<Rol> {
  const usuario = await this.usuarioRepository.findOne({
    where: { dni },
    relations: ['usuarioRoles'],
  });

  const rol = await this.rolRepository.findOne({
    where: { rol: dto.rol },
  });

  // Crear relación explícita
  const usuarioRol = this.usuarioRolRepository.create({
    dni: usuario.dni,
    rol_id: rol.id,
    usuario,
    rol,
  });

  await this.usuarioRolRepository.save(usuarioRol);
  return rol;
}
```

## Compatibilidad Backward

El **getter `roles` en Usuario** mantiene compatibilidad con el código existente:

```typescript
// Viejo código (sigue funcionando)
const permisos = user.roles.flatMap(r => r.permisos);

// Internamente:
// user.roles → user.usuarioRoles.map(ur => ur.rol)

// Nuevo código (con acceso a más información)
const permisos = user.usuarioRoles.map(ur => ({
  rol: ur.rol,
  asignado: ur.fecha_asignacion,
  permisos: ur.rol.permisos,
}));
```

## Testing

```typescript
it('should load usuario roles with join table', async () => {
  const user = await userRepository.findOne({
    where: { dni: 12345678 },
    relations: ['usuarioRoles', 'usuarioRoles.rol'],
  });

  expect(user.usuarioRoles).toHaveLength(2);
  expect(user.usuarioRoles[0].fecha_asignacion).toBeDefined();
  expect(user.roles).toHaveLength(2);
  expect(user.roles[0].permisos).toBeDefined();
});
```

## Próximos Pasos

### 1. Agregar campos a UsuarioRol (opcional)

```typescript
@Column('boolean', { default: true })
activo: boolean;  // Desactivar acceso sin borrar

@Column('text', { nullable: true })
razon_asignacion: string;  // Por qué se asignó este rol

@Column('text', { nullable: true })
aprobado_por: string;  // Quién autorizó la asignación
```

### 2. Crear API para gestionar asignaciones

```
POST /usuario/:dni/roles
GET /usuario/:dni/roles
DELETE /usuario/:dni/roles/:rolId
GET /usuario/roles/audit  // Auditoría de cambios
```

### 3. Implementar soft deletes

```typescript
@DeleteDateColumn()
fecha_revoke: Date;  // Cuando se removió el rol

// Así puedes ver el historial completo
```

## Conclusión

La entidad `UsuarioRol` explícita proporciona:
- ✅ Control total sobre la tabla de unión
- ✅ Auditoría automática con timestamps
- ✅ Flexibilidad para queries complejas
- ✅ Fácil de mantener y documentar
- ✅ Compatible con código existente vía getter

---

**Archivo**: `src/usuario/entities/usuario-rol.entity.ts`
**Status**: ✅ Implementado y testeado
**Tabla BD**: `usuario_rol`
