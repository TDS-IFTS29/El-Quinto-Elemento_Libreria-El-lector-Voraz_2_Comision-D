# El Lector Voraz – Backend (Entrega Final) - 2da PARTE

Este proyecto fue desarrollado como parte del trabajo integrador de la materia Desarrollo Web Backend – Tecnicatura en Desarrollo de Software (IFTS 29).

## Cómo Ejecutar el Proyecto

### 1. Clonar el repositorio

```bash
git clone git@github.com:TDS-IFTS29/El-Quinto-Elemento_Libreria-El-lector-Voraz_2_Comision-D.git
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear .env en el directorio raiz con los siguientes datos para pruebas locales

```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017/el-lector-voraz
```

### 4. Iniciar MongoDB localmente

Debe tener instalado MongoDB localmente e iniciado.

### 5. Crear la base de datos con datos de ejemplo

Para facilitar las pruebas, puedes crear la base de datos `el-lector-voraz` con datos de ejemplo ejecutando el siguiente script:

```bash
node crear_base_el_lector_voraz.js
```

Esto eliminará los productos, proveedores y el historial de ventas existentes, y cargará datos de ejemplo automáticamente (incluye 10 ventas de prueba asociadas a productos reales).

> **Actualización importante:**
> Desde la migración a MongoDB, la aplicación utiliza una base de datos MongoDB y modelos Mongoose para almacenar y gestionar los datos. La carpeta `data/` y los archivos JSON han sido eliminados y ya no son utilizados por la aplicación.
>
> **Usuarios de prueba creados automáticamente:**
>
> **Administradores:**
>
> - **Juan Pérez** (<juan.perez@lectorvoraz.com>) - Contraseña: `1234`
> - **admin** (admin) - Contraseña: `1234` *(usuario de compatibilidad)*
>
> **Empleados:**
>
> - **Antonio Gill** (<antonio.gill@lectorvoraz.com>) - Contraseña: `1234`
> - **Cristian Descosido** (<cristian.descosido@lectorvoraz.com>) - Contraseña: `1234`
> - **Damian Clausi** (<damian.clausi@lectorvoraz.com>) - Contraseña: `1234`
>
> **Nota:** Todos los usuarios (administradores y empleados) tienen la misma contraseña: `1234`

### 6. Iniciar el servidor en modo desarrollo (con reinicio automático)

```bash
npm run dev
```

> Si prefieres iniciar el servidor en modo producción, puedes usar:
>
> ```bash
> npm start
> ```

### 7. Acceder en el navegador

```text
http://localhost:3000
```

## Objetivo del Proyecto

Desarrollar una solución backend integral con Node.js y Express que permita digitalizar la gestión administrativa y comercial de una librería, abarcando la gestión de productos, registro de ventas y administración de proveedores. Esta solución se estructura como una API RESTful que proporciona operaciones CRUD sobre los datos almacenados en una base de datos MongoDB (antes archivos JSON), garantizando una arquitectura desacoplada. Además, se implementa un cliente basado en vistas Pug y JavaScript que interactúa con la API a través de fetch. El sistema busca facilitar el control de stock, mejorar el seguimiento de las transacciones y centralizar la información relevante para la toma de decisiones.

## Tecnologías Utilizadas

- Node.js
- Express.js
- MongoDB
- Mongoose
- Pug
- JSON
- Fetch API
- Thunder Client / Postman
- Git y GitHub

## Funcionalidades Implementadas

- CRUD completo de productos, proveedores y ventas
- Reportes dinámicos:
  - Productos más vendidos
  - Ventas por semana
- Interfaz desacoplada usando `fetch`
- Vistas Pug dinámicas con render del lado del cliente
- Código modular y organizado por MVC
- Uso de programación orientada a objetos

## Estructura del Proyecto

```bash
/el-lector-voraz/
├── .env
├── .gitignore
├── app.js
├── package.json
├── README.md
├── jest.config.js
├── jest.setup.js
├── crear_base_el_lector_voraz.js
├── __tests__/
│   ├── test-helpers.js
│   ├── api.cafeteria.test.js
│   ├── api.libros.test.js
│   ├── api.libros.test.new.js
│   ├── api.productos.test.js
│   ├── api.proveedores.test.js
│   ├── api.usuarios.test.js
│   ├── api.usuarios.test.new.js
│   ├── api.utileria.test.js
│   └── api.ventas.test.js
├── controllers/
│   ├── cafeteriaController.js
│   ├── homeController.js
│   ├── librosController.js
│   ├── proveedoresController.js
│   ├── usuariosController.js
│   ├── utileriaController.js
│   └── ventasController.js
├── middleware/
│   └── auth.js
├── models/
│   ├── Cafeteria.js
│   ├── Libro.js
│   ├── Proveedor.js
│   ├── Usuario.js
│   ├── Utileria.js
│   └── Venta.js
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── img/
│   │   ├── banner-libreria.webp
│   │   └── logo-lector-voraz.png
│   └── js/
│       ├── dashboard.js
│       ├── cafeteria/
│       ├── libros/
│       ├── proveedores/
│       ├── usuarios/
│       └── utileria/
├── routes/
│   ├── apiDocs.js
│   ├── auth.js
│   ├── cafeteria.js
│   ├── home.js
│   ├── libros.js
│   ├── proveedores.js
│   ├── usuarios.js
│   ├── utileria.js
│   └── api/
│       ├── cafeteria.js
│       ├── libros.js
│       ├── proveedores.js
│       ├── usuarios.js
│       ├── utileria.js
│       └── ventas.js
└── views/
    ├── api_docs.pug
    ├── dashboard.pug
    ├── error.pug
    ├── layout.pug
    ├── login.pug
    ├── cafeteria/
    ├── libros/
    ├── proveedores/
    ├── usuarios/
    └── utileria/
```

> **Nota:** Todos los datos actuales se almacenan en MongoDB. Los modelos y controladores están adaptados para trabajar con Mongoose.

## Rutas Principales

### Autenticación

| Método | Ruta                              | Descripción                              |
|--------|------------------------------------|------------------------------------------|
| GET    | /auth/login                      | Vista de login                           |
| POST   | /auth/login                      | Procesar login                           |
| POST   | /auth/logout                     | Cerrar sesión                            |
| GET    | /auth/logout                     | Cerrar sesión (método GET)               |

### Dashboard y Principal

| Método | Ruta                              | Descripción                              |
|--------|------------------------------------|------------------------------------------|
| GET    | /                                | Dashboard principal                      |

### Libros

| Método | Ruta                              | Descripción                              |
|--------|------------------------------------|------------------------------------------|
| GET    | /libros/                         | Vista de catálogo de libros (Pug)        |
| GET    | /libros/nuevo                    | Formulario nuevo libro                   |
| GET    | /libros/editar/:id               | Formulario de edición de libro           |
| GET    | /libros/ventas                   | Historial de ventas de libros            |
| GET    | /libros/ventas/nueva             | Formulario registrar venta de libro      |
| GET    | /libros/ventas/reportes          | Vista con reportes dinámicos             |
| GET    | /libros/ventas/editar/:id        | Formulario editar venta                  |
| GET    | /libros/ventas/factura/:id       | Factura de venta de libro                |

### Proveedores

| Método | Ruta                              | Descripción                              |
|--------|------------------------------------|------------------------------------------|
| GET    | /proveedores/                    | Vista de proveedores con acciones        |
| GET    | /proveedores/nuevo               | Formulario nuevo proveedor               |
| GET    | /proveedores/editar/:id          | Formulario de edición de proveedor       |

### Usuarios

| Método | Ruta                              | Descripción                              |
|--------|------------------------------------|------------------------------------------|
| GET    | /usuarios/catalogo               | Catálogo de usuarios                     |
| GET    | /usuarios/nuevo                  | Formulario nuevo usuario                 |
| GET    | /usuarios/editar/:id             | Formulario editar usuario                |

### Cafetería

| Método | Ruta                              | Descripción                              |
|--------|------------------------------------|------------------------------------------|
| GET    | /cafeteria/                      | Catálogo de productos de cafetería       |
| GET    | /cafeteria/nuevo                 | Formulario nuevo producto de cafetería   |
| GET    | /cafeteria/editar/:id            | Formulario editar producto de cafetería  |
| GET    | /cafeteria/vender                | Formulario vender producto de cafetería  |
| GET    | /cafeteria/reportes              | Reportes de ventas de cafetería          |
| GET    | /cafeteria/factura/:ventaId      | Factura de venta de cafetería            |

### Utilería

| Método | Ruta                              | Descripción                              |
|--------|------------------------------------|------------------------------------------|
| GET    | /utileria/                       | Catálogo de productos de utilería        |
| GET    | /utileria/nuevo                  | Formulario nuevo producto de utilería    |
| GET    | /utileria/editar/:id             | Formulario editar producto de utilería   |
| GET    | /utileria/vender                 | Formulario vender producto de utilería   |
| GET    | /utileria/reportes               | Reportes de ventas de utilería           |
| GET    | /utileria/factura/:id            | Factura de venta de utilería             |

## Endpoints RESTful principales

### Autenticación API

| Método | Ruta                        | Descripción                                 |
|--------|-----------------------------|---------------------------------------------|
| POST   | /auth/login                 | Iniciar sesión en el sistema                |
| POST   | /auth/logout                | Cerrar sesión del usuario actual            |
| GET    | /auth/logout                | Cerrar sesión (método GET)                  |

### Libros API

| Método | Ruta                        | Descripción                                 |
|--------|-----------------------------|---------------------------------------------|
| GET    | /api/libros                 | Listar libros                               |
| GET    | /api/libros/:id             | Obtener un libro                            |
| POST   | /api/libros                 | Crear libro (incluye `stockMinimo`)         |
| PATCH  | /api/libros/:id             | Actualizar libro (incluye `stockMinimo`)    |
| PATCH  | /api/libros/:id/sumar-stock | Sumar 1 al stock de un libro (solo admin)   |
| DELETE | /api/libros/:id             | Eliminar libro (solo admin)                 |

### Proveedores API

| Método | Ruta                        | Descripción                                 |
|--------|-----------------------------|---------------------------------------------|
| GET    | /api/proveedores            | Listar proveedores (filtrar por tipo)       |
| GET    | /api/proveedores/:id        | Obtener proveedor                           |
| POST   | /api/proveedores            | Crear proveedor (solo admin)                |
| PATCH  | /api/proveedores/:id        | Actualizar proveedor (solo admin)           |
| DELETE | /api/proveedores/:id        | Eliminar proveedor (solo admin)             |

### Usuarios API

| Método | Ruta                        | Descripción                                 |
|--------|-----------------------------|---------------------------------------------|
| GET    | /api/usuarios               | Listar usuarios (solo admin)                |
| GET    | /api/usuarios/me            | Obtener datos del usuario actual            |
| GET    | /api/usuarios/:id           | Obtener usuario (propietario o admin)       |
| POST   | /api/usuarios               | Crear usuario (solo admin)                  |
| PUT    | /api/usuarios/:id           | Actualizar usuario (propietario o admin)    |
| DELETE | /api/usuarios/:id           | Eliminar usuario (solo admin)               |

### Ventas API

| Método | Ruta                        | Descripción                                 |
|--------|-----------------------------|---------------------------------------------|
| GET    | /api/ventas                 | Listar ventas de libros                     |
| GET    | /api/ventas/:id             | Obtener venta específica                    |
| POST   | /api/ventas                 | Registrar nueva venta de libro              |
| PUT    | /api/ventas/:id             | Editar venta existente                      |
| DELETE | /api/ventas/:id             | Eliminar venta (solo admin)                 |
| GET    | /api/ventas/mas-vendidos    | Libros más vendidos (con filtro período)    |
| GET    | /api/ventas/ventas-semana   | Ventas por día de la semana actual          |

### Utilería API

| Método | Ruta                        | Descripción                                 |
|--------|-----------------------------|---------------------------------------------|
| GET    | /api/utileria               | Listar productos de utilería                |
| GET    | /api/utileria/:id           | Obtener producto de utilería                |
| POST   | /api/utileria               | Crear producto de utilería (solo admin)     |
| PATCH  | /api/utileria/:id           | Actualizar producto de utilería (solo admin)|
| DELETE | /api/utileria/:id           | Eliminar producto de utilería (solo admin)  |
| PATCH  | /api/utileria/:id/sumar-stock | Sumar 1 al stock (solo admin)             |
| POST   | /api/utileria/vender        | Registrar venta de utilería                 |
| GET    | /api/utileria/ventas        | Historial de ventas de utilería             |
| GET    | /api/utileria/ventas/mas-vendidos | Productos más vendidos con filtro    |

### Cafetería API

| Método | Ruta                        | Descripción                                 |
|--------|-----------------------------|---------------------------------------------|
| GET    | /api/cafeteria              | Listar productos de cafetería               |
| GET    | /api/cafeteria/:id          | Obtener producto de cafetería               |
| POST   | /api/cafeteria              | Crear producto de cafetería (solo admin)    |
| PATCH  | /api/cafeteria/:id          | Actualizar producto de cafetería (solo admin)|
| DELETE | /api/cafeteria/:id          | Eliminar producto de cafetería (solo admin) |
| POST   | /api/cafeteria/vender       | Registrar venta de cafetería                |
| GET    | /api/cafeteria/ventas       | Historial de ventas de cafetería            |
| GET    | /api/cafeteria/ventas/mas-vendidos | Productos más vendidos con filtro   |

## Sistema de Permisos Basados en Roles

### Resumen del Sistema

Se ha implementado exitosamente un sistema completo de permisos basados en roles para la aplicación de gestión de librería. El sistema distingue entre usuarios **Administradores** y **Empleados** con diferentes niveles de acceso.

### Roles y Permisos Implementados

#### Administrador

- **Usuarios**: Crear, leer, actualizar, eliminar cualquier usuario
- **Libros**: Crear, leer, actualizar, eliminar cualquier libro
- **Proveedores**: Crear, leer, actualizar, eliminar cualquier proveedor
- **Ventas**: Leer, crear reportes y estadísticas

#### Empleado

- **Usuarios**: Solo puede ver y editar su propio perfil
- **Libros**: Solo puede ver libros (sin crear, editar o eliminar)
- **Proveedores**: Sin acceso (no aparece en el menú)
- **Ventas**: Crear ventas, ver reportes y estadísticas

### Funcionalidades de Seguridad Implementadas

#### Backend (API y Rutas)

- Middleware de autenticación (`requireAuth`)
- Middleware de autorización por rol (`requireRole`)
- Middleware de propiedad de recursos (`requireOwnerOrAdmin`)
- Validación de permisos en todos los endpoints REST
- Endpoint `/api/usuarios/me` para obtener datos del usuario actual

#### Frontend (Vistas y JavaScript)

- Menú lateral dinámico basado en rol del usuario
- Botones de acción condicionales en catálogos
- Información del usuario actual en sidebar y dashboard
- Restricciones de acceso a formularios
- JavaScript que consulta permisos del usuario actual

#### Testing Completo

- Suite completa de tests para todos los endpoints
- Tests de permisos para cada rol
- Tests de autenticación y autorización
- Configuración Jest para ejecución secuencial
- 123 tests pasando exitosamente

### Archivos del Sistema de Permisos

#### Backend

- `middleware/auth.js` - Middleware de autenticación y autorización
- `controllers/usuariosController.js` - Lógica de usuarios con permisos
- `controllers/librosController.js` - Lógica de libros con permisos
- `controllers/proveedoresController.js` - Lógica de proveedores con permisos
- `routes/api/*.js` - Rutas API con validación de permisos
- `routes/usuarios.js` - Rutas de vistas con validación de permisos

#### Frontend

- `views/layout.pug` - Sidebar con información de usuario
- `views/dashboard.pug` - Dashboard con información de usuario
- `views/usuarios/catalogo_usuarios.pug` - Catálogo con permisos
- `views/libros/catalogo_libros.pug` - Catálogo con permisos
- `public/js/catalogo_usuarios.js` - JavaScript con validación de permisos
- `public/js/catalogo_libro.js` - JavaScript con validación de permisos

#### Testing

- `__tests__/test-helpers.js` - Utilidades para testing
- `__tests__/api.usuarios.test.js` - Tests de API de usuarios
- `__tests__/api.libros.test.js` - Tests de API de libros
- `__tests__/api.proveedores.test.js` - Tests de API de proveedores
- `jest.config.js` - Configuración Jest
- `jest.setup.js` - Setup global para tests

### Validaciones de Seguridad

- Usuarios no autenticados no pueden acceder a recursos protegidos
- Empleados no pueden acceder a funciones de administrador
- Empleados solo pueden modificar sus propios datos
- Validación tanto en backend como frontend
- Sesiones seguras con Express Session
- Contraseñas hasheadas con bcrypt

### Estado del Sistema de Permisos

#### Completado y Funcional

- Todos los tests pasan (123/123)
- Sistema de permisos completamente implementado
- UI/UX adaptada a roles de usuario
- Validaciones de seguridad en todos los niveles
- Documentación completa

El sistema está listo para producción y cumple con todos los requisitos de seguridad y funcionalidad especificados.

### Primera parte

| Integrante               | Rol                                                        |
|-------------------------|------------------------------------------------------------|
| Clausi Damián Andrés    | CRUD de productos y modularización del backend             |
| Descosido Cristian      | Gestión de proveedores y vistas dinámicas                  |
| César Antonio Gill      | Registro de ventas, reportes y consumo de API con fetch    |

- [Google drive](https://drive.google.com/open?id=1RJ1bpW4hxbWAr_X6nghFqo8siL7cDsBN&usp=drive_fs)
- [Github](https://github.com/TDS-IFTS29/grupo1_BackEnd_El_Lector_Voraz)

### Segunda parte

| Integrante               | Rol                                                                |
|-------------------------|---------------------------------------------------------------------|
| Clausi Damián Andrés    | FRONTEND                                                            |
|                         | MODULO LIBRERIA CON REPORTES                                        |
|-------------------------|---------------------------------------------------------------------|
| Descosido Cristian      | MODULO COFFEE CON REPORTES                                          |
|                         | MODULO LOGIN CON SESION Y CIFRADO                                   |
|-------------------------|---------------------------------------------------------------------|
| César Antonio Gill      | MODULO UTILERIA CON REPORTES                                        |
|                         | MONGO ATLAS Y RENDER                                                |

- [Google drive](https://drive.google.com/open?id=1RJ1bpW4hxbWAr_X6nghFqo8siL7cDsBN&usp=drive_fs)
- [Github](https://github.com/TDS-IFTS29/El-Quinto-Elemento_Libreria-El-lector-Voraz_2_Comision-D)
