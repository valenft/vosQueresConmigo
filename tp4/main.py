from almacen import *
from ropa import *
from factory import *

if __name__ == "__main__":
    almacen = Almacen()

    # Fábricas
    remera_factory = RemeraFactory()
    pantalon_factory = PantalonFactory()

    # Agregar al almacén
    almacen.agregarRopa(remera_factory.crearRopa("remera negra", "M"))
    almacen.agregarRopa(pantalon_factory.crearRopa("jean azul", "42"))
    almacen.agregarRopa(remera_factory.crearRopa("remera violeta", "L"))
    almacen.agregarRopa(pantalon_factory.crearRopa("short", "38"))

    while True:
        print("\n--- MENU ---")
        print("1. Agregar Remera")
        print("2. Agregar Pantalón")
        print("3. Mostrar todo el almacen")
        print("4. Filtrar por prenda")
        print("5. Eliminar por id")
        print("6. Salir")

        opcion = input("Elegi una opcion: ")
        match opcion:
            case "1" | "2":
                nombre = input("Nombre: ")
                talle = input("Talle: ")
                
                if opcion == "1":
                    almacen.agregarRopa(remera_factory.crearRopa(nombre, talle))
                else:
                    almacen.agregarRopa(pantalon_factory.crearRopa(nombre, talle))

                print("Se agrego la prenda al almacen")

            case "3":
                print("\n Almacen")
                almacen.mostrar()

            case "4":
                prenda = input("escribir remera o pantalon para filtrar: ").lower()
                almacen.filtrarPorTipo(prenda)

            case "5":
                id = int(input("escribir id de la prenda "))
                almacen.eliminarPorId(id)
            
            case "6":
                print("Chau")
                break
            case _:
                print("No existe esta opcion")

    