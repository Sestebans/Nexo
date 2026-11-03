import { Coffee, Bus, PartyPopper, ShoppingBag, BookOpen, Wallet, Plane, Bike, Smartphone, Car, GraduationCap, PiggyBank, House, Target } from 'lucide-react'

export const CATEGORIES = [
  { id: 'Comida', Icon: Coffee },
  { id: 'Transporte', Icon: Bus },
  { id: 'Salidas', Icon: PartyPopper },
  { id: 'Compras', Icon: ShoppingBag },
  { id: 'Educación', Icon: BookOpen },
  { id: 'Otro', Icon: Wallet },
]
export const categoryIcon = id => CATEGORIES.find(c => c.id === id)?.Icon || Wallet

// Icono de una meta según lo que escribió el usuario
export function goalIcon(name = '') {
  const n = name.toLowerCase()
  if (/moto|bici/.test(n)) return Bike
  if (/viaje|vacacion|tiquete|playa/.test(n)) return Plane
  if (/celular|tel[eé]fono|iphone|portátil|portatil|computador/.test(n)) return Smartphone
  if (/carro|auto/.test(n)) return Car
  if (/universidad|matr[ií]cula|estudio|curso/.test(n)) return GraduationCap
  if (/casa|apartamento|arriendo/.test(n)) return House
  if (/emergencia|ahorro|colch[oó]n/.test(n)) return PiggyBank
  return Target
}
