class Proveedor {
  constructor(id, nombre, contacto) {
    this.id = id;
    this.nombre = nombre;
    this.contacto = contacto;
  }

  static desdeObjetoPlano(obj) {
    return new Proveedor(obj.id, obj.nombre, obj.contacto);
  }
}

module.exports = Proveedor;
