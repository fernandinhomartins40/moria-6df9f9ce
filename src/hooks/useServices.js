import { useState, useEffect } from 'react';

// Mock data para desenvolvimento
const mockServices = [
  {
    id: 1,
    name: 'Troca de Óleo',
    description: 'Troca completa do óleo do motor com filtro',
    price: 89.90,
    duration: '30 min',
    category: 'Manutenção',
    available: true,
    image: '/placeholder.svg'
  },
  {
    id: 2,
    name: 'Balanceamento',
    description: 'Balanceamento e alinhamento completo',
    price: 45.00,
    duration: '45 min',
    category: 'Pneus',
    available: true,
    image: '/placeholder.svg'
  },
  {
    id: 3,
    name: 'Revisão Geral',
    description: 'Revisão completa do veículo com 20 pontos',
    price: 150.00,
    duration: '2 horas',
    category: 'Revisão',
    available: true,
    image: '/placeholder.svg'
  }
];

export function useServices(initialFilters = {}) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const loadServices = (currentFilters) => {
    setLoading(true);
    
    // Simular carregamento
    const timer = setTimeout(() => {
      try {
        let filteredServices = mockServices;
        
        // Aplicar filtros se houver
        if (currentFilters.category) {
          filteredServices = filteredServices.filter(s => s.category === currentFilters.category);
        }
        
        if (currentFilters.available !== undefined) {
          filteredServices = filteredServices.filter(s => s.available === currentFilters.available);
        }

        if (currentFilters.search) {
          filteredServices = filteredServices.filter(s => 
            s.name.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
            s.description.toLowerCase().includes(currentFilters.search.toLowerCase())
          );
        }

        setServices(filteredServices);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar serviços:', err);
        setError(err);
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  };

  useEffect(() => {
    const cleanup = loadServices(filters);
    return cleanup;
  }, [filters]);

  const updateFilters = (newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };

  return {
    services,
    loading,
    error,
    updateFilters,
    clearError: () => setError(null)
  };
}

export default useServices;