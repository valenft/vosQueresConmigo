class Almacen:
    def __init__(self):
        self.almacen = {}

    def agregarRopa(self, prenda):
        tipo = type(prenda).__name__.lower()  # "remera" o "pantalon"
        if tipo not in self.almacen:
            self.almacen[tipo] = []
        self.almacen[tipo].append(prenda.retornarLista())

    def mostrar(self):
        for tipo, prendas in self.almacen.items():
            for p in prendas:
                print(f"  ID: {p[0]}, Nombre: {p[1]}, Talle: {p[2]}")

    def filtrarPorTipo(self, tipo_filtrado):
        tipo_filtrado = tipo_filtrado.lower()
        if tipo_filtrado in self.almacen:
            print(f"\n{tipo_filtrado.upper()}:")
            for i in self.almacen[tipo_filtrado]:
                print(f"  ID: {i[0]}, Nombre: {i[1]}, Talle: {i[2]}")
        else:
            print("No hay este tipo de prendas")

    def eliminarPorId(self, id_buscado):
        for clave, prendas in self.almacen.items():
            for i, prenda in enumerate(prendas):
                print(prenda[0])
                if prenda[0] == id_buscado:
                    prendas.pop(i)
                    print(f"Se elimino la prenda con id {id_buscado}")
                    return
        print(f"No encontro la prenda con id: {id_buscado}")