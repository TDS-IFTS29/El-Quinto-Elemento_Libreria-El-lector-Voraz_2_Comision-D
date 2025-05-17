class Producto {
  constructor(id, nombre, autor, precio) {
    this.id = id;
    this.nombre = nombre;
    this.autor = autor;
    this.precio = precio;
  }

  static desdeObjetoPlano(obj) {
    return new Producto(obj.id, obj.nombre, obj.autor, obj.precio);
  }
}

module.exports = Producto;
