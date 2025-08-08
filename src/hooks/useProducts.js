import { useState, useEffect } from 'react';

// Mock data para desenvolvimento
const mockProducts = [
  {
    id: 1,
    name: 'Filtro de Óleo Bosch',
    description: 'Filtro de óleo original Bosch para motores 1.0 a 2.0',
    price: 35.90,
    oldPrice: 42.90,
    category: 'Filtros',
    brand: 'Bosch',
    inStock: true,
    stock: 25,
    image: '/api/placeholder/300/300',
    rating: 4.8,
    reviews: 127
  },
  {
    id: 2,
    name: 'Pastilha de Freio Dianteira',
    description: 'Pastilha de freio dianteira para carros populares',
    price: 89.90,
    oldPrice: null,
    category: 'Freios',
    brand: 'TRW',
    inStock: true,
    stock: 15,
    image: '/api/placeholder/300/300',
    rating: 4.6,
    reviews: 89
  },
  {
    id: 3,
    name: 'Óleo Motor Castrol 5W30',
    description: 'Óleo sintético Castrol GTX 5W30 - 1 litro',
    price: 45.90,
    oldPrice: 52.90,
    category: 'Óleos',
    brand: 'Castrol',
    inStock: true,
    stock: 30,
    image: '/api/placeholder/300/300',
    rating: 4.9,
    reviews: 203
  },
  {
    id: 4,
    name: 'Bateria 60Ah Moura',
    description: 'Bateria automotiva 60Ah com 18 meses de garantia',
    price: 299.90,
    oldPrice: 349.90,
    category: 'Baterias',
    brand: 'Moura',
    inStock: true,
    stock: 8,
    image: '/api/placeholder/300/300',
    rating: 4.7,
    reviews: 156
  },
  {
    id: 5,
    name: 'Pneu Aro 14 Michelin',
    description: 'Pneu 175/70R14 Michelin Energy XM2',
    price: 245.90,
    oldPrice: null,
    category: 'Pneus',
    brand: 'Michelin',
    inStock: false,
    stock: 0,
    image: '/api/placeholder/300/300',
    rating: 4.8,
    reviews: 78
  }
];

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      let filteredProducts = mockProducts;
      
      // Aplicar filtros se houver
      if (filters.category) {
        filteredProducts = filteredProducts.filter(p => p.category === filters.category);
      }
      
      if (filters.inStock !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.inStock === filters.inStock);
      }

      if (filters.search) {
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setProducts(filteredProducts);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  return {
    products,
    loading,
    error
  };
}

export default useProducts;