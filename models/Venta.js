class Venta {
  constructor(id, producto, cantidad, fecha = new Date().toISOString()) {
    this.id = id;
    this.producto = producto;
    this.cantidad = cantidad;
    this.fecha = fecha;
  }

  static desdeObjetoPlano(obj) {
    return new Venta(obj.id, obj.producto, obj.cantidad, obj.fecha);
  }
}

module.exports = Venta;
