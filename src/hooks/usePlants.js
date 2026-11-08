import { useContext } from 'react'
import PlantContext from '../contexts/plantContext'

export default function usePlants() {
  const context = useContext(PlantContext)
  if (!context) throw new Error('usePlants harus digunakan di dalam PlantProvider.')
  return context
}