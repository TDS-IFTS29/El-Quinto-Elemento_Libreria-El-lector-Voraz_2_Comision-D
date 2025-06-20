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

### 3. Iniciar MongoDB localmente

Debe tener instalado MongoDB localmente e iniciado.

### 4. Crear la base de datos con datos de ejemplo

Para facilitar las pruebas, puedes crear la base de datos `el-lector-voraz` con datos de ejemplo ejecutando el siguiente script:

```bash
node crear_base_el_lector_voraz.js
```

Esto eliminará los productos, proveedores y el historial de ventas existentes, y cargará datos de ejemplo automáticamente (incluye 10 ventas de prueba asociadas a productos reales).

> **Actualización importante:**
> Desde la migración a MongoDB, la aplicación utiliza una base de datos MongoDB y modelos Mongoose para almacenar y gestionar los datos. La carpeta `data/` y los archivos JSON han sido eliminados y ya no son utilizados por la aplicación.
>
> **Usuario de prueba creado automáticamente:**
>
> - Usuario: `admin`
> - Contraseña: `1234`

### 5. Iniciar el servidor en modo desarrollo (con reinicio automático)

```bash
npm run dev
```

> Si prefieres iniciar el servidor en modo producción, puedes usar:
>
> ```bash
> npm start
> ```

### 6. Acceder en el navegador

```text
http://localhost:3000
```

## Configuración del Proyecto

### Variables de Entorno (.env)

> **Nota:** En este proyecto estudiantil, el archivo `.env` se incluye en el repositorio solo con fines prácticos y educativos. En proyectos reales, nunca se debe subir `.env` a un repositorio público.

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
├── __tests__/
│   └── ...
├── controllers/
│   └── ...
├── models/
│   └── ...
├── public/
│   └── ...
├── routes/
│   └── ...
├── views/
│   └── ...
```

> **Nota:** Todos los datos actuales se almacenan en MongoDB. Los modelos y controladores están adaptados para trabajar con Mongoose.

## Rutas Principales

| Método | Ruta                              | Descripción                              |
|--------|------------------------------------|------------------------------------------|
| GET    | /                                | Página principal                         |
| GET    | /libros/catalogo                 | Vista de catálogo de libros (Pug)        |
| GET    | /libros/nuevo                    | Formulario nuevo libro                   |
| GET    | /libros/editar/:id               | Formulario de edición de libro           |
| GET    | /proveedores/catalogo_proveedores  | Vista de proveedores con acciones        |
| GET    | /proveedores/nuevo_proveedor       | Formulario nuevo proveedor               |
| GET    | /proveedores/editar_proveedor/:id  | Formulario de edición de proveedor       |
| GET    | /libros/ventas                   | Historial de ventas de libros            |
| GET    | /libros/ventas/nueva             | Formulario registrar venta de libro      |
| GET    | /libros/ventas/reportes          | Vista con reportes dinámicos             |
| GET    | /api/libros                      | Listar libros (JSON)                     |
| GET    | /api/libros/:id                  | Obtener un libro                         |
| POST   | /api/libros                      | Crear libro                              |
| PATCH  | /api/libros/:id                  | Actualizar libro                         |
| DELETE | /api/libros/:id                  | Eliminar libro                           |
| GET    | /api/proveedores                 | Listar proveedores (JSON)                |
| GET    | /api/proveedores/:id             | Obtener proveedor                        |
| POST   | /api/proveedores                 | Crear proveedor                          |
| PATCH  | /api/proveedores/:id             | Actualizar proveedor                     |
| DELETE | /api/proveedores/:id             | Eliminar proveedor                       |
| GET    | /api/libros/ventas               | Listar ventas de libros (JSON)           |
| POST   | /api/libros/ventas               | Registrar nueva venta de libro           |
| GET    | /api/libros/ventas/mas-vendidos  | JSON con los libros más vendidos         |
| GET    | /api/libros/ventas/ventas-semana | JSON con ventas de la última semana      |

## Endpoints RESTful principales

| Método | Ruta                        | Descripción                                 |
|--------|-----------------------------|---------------------------------------------|
| GET    | /api/libros                 | Listar libros                               |
| GET    | /api/libros/:id             | Obtener un libro                            |
| POST   | /api/libros                 | Crear libro (incluye `stockMinimo`)         |
| PATCH  | /api/libros/:id             | Actualizar libro (incluye `stockMinimo`)    |
| PATCH  | /api/libros/:id/sumar-stock | Sumar 1 al stock de un libro                |
| DELETE | /api/libros/:id             | Eliminar libro                              |
| GET    | /api/proveedores            | Listar proveedores                          |
| GET    | /api/proveedores/:id        | Obtener proveedor                           |
| POST   | /api/proveedores            | Crear proveedor                             |
| PATCH  | /api/proveedores/:id        | Actualizar proveedor                        |
| DELETE | /api/proveedores/:id        | Eliminar proveedor                          |
| GET    | /api/ventas                 | Listar ventas                               |
| GET    | /api/ventas/:id             | Obtener venta                               |
| POST   | /api/ventas                 | Registrar nueva venta                       |
| PUT    | /api/ventas/:id             | Editar venta                                |
| DELETE | /api/ventas/:id             | Eliminar venta                              |

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
|                         | Mongo Atlas y Vercel                                                |

- [Google drive](https://drive.google.com/open?id=1RJ1bpW4hxbWAr_X6nghFqo8siL7cDsBN&usp=drive_fs)
- [Github](https://github.com/TDS-IFTS29/El-Quinto-Elemento_Libreria-El-lector-Voraz_2_Comision-D)
