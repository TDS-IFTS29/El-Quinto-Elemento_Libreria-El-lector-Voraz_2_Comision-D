# El Lector Voraz – Backend (Entrega Final)

Este proyecto fue desarrollado como parte del trabajo integrador de la materia Desarrollo Web Backend – Tecnicatura en Desarrollo de Software (IFTS 29).

## Objetivo del Proyecto

Desarrollar una solución backend integral con Node.js y Express que permita digitalizar la gestión administrativa y comercial de una librería, abarcando la gestión de productos, registro de ventas y administración de proveedores. Esta solución se estructura como una API RESTful que proporciona operaciones CRUD sobre los datos almacenados en archivos JSON, garantizando una arquitectura desacoplada. Además, se implementa un cliente basado en vistas Pug y JavaScript que interactúa con la API a través de fetch. El sistema busca facilitar el control de stock, mejorar el seguimiento de las transacciones y centralizar la información relevante para la toma de decisiones.

## Tecnologías Utilizadas

- Node.js
- Express.js
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
├── .gitignore
├── app.js
├── package-lock.json
├── package.json
├── README.md
├── __tests__/
│   ├── api.productos.test.js
│   ├── api.proveedores.test.js
│   └── api.ventas.test.js
├── data/
│   ├── productos.json
│   ├── proveedores.json
│   ├── usuarios.json
│   └── ventas.json
├── controllers/
│   ├── catalogoController.js
│   ├── homeController.js
│   ├── productosController.js
│   ├── proveedoresController.js
│   ├── usuariosController.js
│   └── ventasController.js
├── models/
│   ├── Producto.js
│   ├── Proveedor.js
│   └── Venta.js
├── public/
│   └── css/
│       └── estilos.css
│   └── js/
│       ├── catalogo.js
│       ├── catalogo_proveedores.js
│       ├── catalogo_ventas.js
│       ├── editar_producto.js
│       ├── editar_proveedor.js
│       ├── login.js
│       ├── nueva_venta.js
│       ├── nuevo_producto.js
│       ├── nuevo_proveedor.js
│       └── reportes_ventas.js
├── routes/
│   ├── apiDocs.js
│   ├── catalogo.js
│   ├── home.js
│   ├── productos.js
│   ├── proveedores.js
│   ├── usuarios.js
│   ├── ventas.js
│   └── api/
│       ├── productos.js
│       ├── proveedores.js
│       └── ventas.js
├── views/
│   ├── api_docs.pug
│   ├── catalogo.pug
│   ├── catalogo_proveedores.pug
│   ├── catalogo_ventas.pug
│   ├── editar_producto.pug
│   ├── editar_proveedor.pug
│   ├── index.pug
│   ├── login.pug
│   ├── nueva_venta.pug
│   ├── nuevo_producto.pug
│   ├── nuevo_proveedor.pug
│   └── reportes_ventas.pug
```

## Cómo Ejecutar el Proyecto

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Iniciar el servidor:

   ```bash
   npm start
   ```

3. Acceder en el navegador:

   ```
   http://localhost:3000
   ```

## Rutas Principales

Método | Ruta                             | Descripción
-------|----------------------------------|-------------------------------
GET    | /                                | Página principal
GET    | /catalogo                        | Vista de catálogo de productos (Pug)
GET    | /productos/catalogo              | Vista con tabla de productos y acciones
GET    | /productos/nuevo                 | Formulario nuevo producto
GET    | /productos/editar/:id            | Formulario de edición
GET    | /proveedores/catalogo            | Vista de proveedores con acciones
GET    | /proveedores/nuevo               | Formulario nuevo proveedor
GET    | /proveedores/editar/:id          | Formulario de edición proveedor
GET    | /ventas/catalogo                 | Historial de ventas
GET    | /ventas/nueva                    | Formulario registrar venta
GET    | /ventas/reportes                 | Vista con reportes dinámicos
GET    | /api/productos                   | Listar productos (JSON)
GET    | /api/productos/:id               | Obtener un producto
POST   | /api/productos                   | Crear producto
PATCH  | /api/productos/:id               | Actualizar producto
DELETE | /api/productos/:id               | Eliminar producto
GET    | /api/proveedores                 | Listar proveedores (JSON)
GET    | /api/proveedores/:id             | Obtener proveedor
POST   | /api/proveedores                 | Crear proveedor
PATCH  | /api/proveedores/:id             | Actualizar proveedor
DELETE | /api/proveedores/:id             | Eliminar proveedor
GET    | /api/ventas                      | Listar ventas (JSON)
POST   | /api/ventas                      | Registrar nueva venta
GET    | /api/ventas/mas-vendidos         | JSON con los productos más vendidos
GET    | /api/ventas/ventas-semana        | JSON con ventas de la última semana

## Grupo "El Quinto Elemento" (Ex Grupo 1) - Roles del Equipo

Integrante                    | Rol
------------------------------|--------------------------------------------------
Clausi Damián Andrés          | CRUD de productos y modularización del backend
Descosido Cristian            | Gestión de proveedores y vistas dinámicas
César Antonio Gill            | Registro de ventas, reportes y consumo de API con fetch

## Documentación Complementaria

- Google drive: https://drive.google.com/open?id=1RJ1bpW4hxbWAr_X6nghFqo8siL7cDsBN&usp=drive_fs
- Github: https://github.com/TDS-IFTS29/grupo1_BackEnd_El_Lector_Voraz
