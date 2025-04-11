class ropa ():
    idContador= 0
    def __init__(self, name, talle,):

        ropa.idContador += 1  # Incrementa el contador global
        self.id = ropa.idContador
        self.name = name
        self.talle = talle
    
    def mostrar_detalles(self):
        raise NotImplementedError("")

    def retornarLista(self):
        return [self.id , self.name, self.talle]




#-------------------------------------------------------------------------------------------------




class Remera(ropa):
    def __init__(self, name, talle):
        super().__init__(name, talle)
    
    def mostrar_detalles(self):
        print("Remera:", self.name,  self.talle)



#--------------------------------------------------------------------------------------------------------


class Pantalon(ropa):

    def __init__(self, name, talle):
        super().__init__(name, talle)



    def mostrar_detalles(self):
        print("Pantalón:", self.name,  self.talle)