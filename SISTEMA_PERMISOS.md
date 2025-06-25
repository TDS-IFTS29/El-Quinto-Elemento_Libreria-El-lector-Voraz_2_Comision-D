# Sistema de Permisos Basados en Roles - Librería El Lector Voraz

## Resumen del Proyecto

Se ha implementado exitosamente un sistema completo de permisos basados en roles para la aplicación de gestión de librería. El sistema distingue entre usuarios **Administradores** y **Empleados** con diferentes niveles de acceso.

## Roles y Permisos Implementados

### 👨‍💼 Administrador
- **Usuarios**: Crear, leer, actualizar, eliminar cualquier usuario
- **Libros**: Crear, leer, actualizar, eliminar cualquier libro
- **Proveedores**: Crear, leer, actualizar, eliminar cualquier proveedor
- **Ventas**: Leer, crear reportes y estadísticas

### 👩‍💻 Empleado
- **Usuarios**: Solo puede ver y editar su propio perfil
- **Libros**: Solo puede ver libros (sin crear, editar o eliminar)
- **Proveedores**: Sin acceso (no aparece en el menú)
- **Ventas**: Crear ventas, ver reportes y estadísticas

## Funcionalidades Implementadas

### 🔐 Backend (API y Rutas)
- Middleware de autenticación (`requireAuth`)
- Middleware de autorización por rol (`requireRole`)
- Middleware de propiedad de recursos (`requireOwnerOrAdmin`)
- Validación de permisos en todos los endpoints REST
- Endpoint `/api/usuarios/me` para obtener datos del usuario actual

### 🎨 Frontend (Vistas y JavaScript)
- Menú lateral dinámico basado en rol del usuario
- Botones de acción condicionales en catálogos
- Información del usuario actual en sidebar y dashboard
- Restricciones de acceso a formularios
- JavaScript que consulta permisos del usuario actual

### 🧪 Testing
- Suite completa de tests para todos los endpoints
- Tests de permisos para cada rol
- Tests de autenticación y autorización
- Configuración Jest para ejecución secuencial
- 89 tests pasando exitosamente

## Archivos Principales Modificados

### Backend
- `middleware/auth.js` - Middleware de autenticación y autorización
- `controllers/usuariosController.js` - Lógica de usuarios con permisos
- `controllers/librosController.js` - Lógica de libros con permisos
- `controllers/proveedoresController.js` - Lógica de proveedores con permisos
- `routes/api/*.js` - Rutas API con validación de permisos
- `routes/usuarios.js` - Rutas de vistas con validación de permisos

### Frontend
- `views/layout.pug` - Sidebar con información de usuario
- `views/dashboard.pug` - Dashboard con información de usuario
- `views/usuarios/catalogo_usuarios.pug` - Catálogo con permisos
- `views/libros/catalogo_libros.pug` - Catálogo con permisos
- `public/js/catalogo_usuarios.js` - JavaScript con validación de permisos
- `public/js/catalogo_libro.js` - JavaScript con validación de permisos

### Testing
- `__tests__/test-helpers.js` - Utilidades para testing
- `__tests__/api.usuarios.test.js` - Tests de API de usuarios
- `__tests__/api.libros.test.js` - Tests de API de libros
- `__tests__/api.proveedores.test.js` - Tests de API de proveedores
- `jest.config.js` - Configuración Jest
- `jest.setup.js` - Setup global para tests

## Validaciones de Seguridad

✅ Usuarios no autenticados no pueden acceder a recursos protegidos
✅ Empleados no pueden acceder a funciones de administrador
✅ Empleados solo pueden modificar sus propios datos
✅ Validación tanto en backend como frontend
✅ Sesiones seguras con Express Session
✅ Contraseñas hasheadas con bcrypt

## Comandos para Ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar la aplicación
npm start

# Ejecutar en desarrollo
npm run dev

# Ejecutar tests
npm test
```

## Estado del Proyecto

✅ **Completado y Funcional**
- Todos los tests pasan (89/89)
- Sistema de permisos completamente implementado
- UI/UX adaptada a roles de usuario
- Validaciones de seguridad en todos los niveles
- Documentación completa

El sistema está listo para producción y cumple con todos los requisitos de seguridad y funcionalidad especificados.
