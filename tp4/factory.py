from ropa import *

class RopaFactory():
    def crearRopa(self, name,talle):
        raise NotImplementedError("")


class RemeraFactory(RopaFactory):
    def crearRopa(self,name,talle):
        return Remera(name,talle)


class PantalonFactory(RopaFactory):
    def crearRopa(self,name,talle):
        return Pantalon(name,talle)