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
    image: '/api/placeholder/300/200'
  },
  {
    id: 2,
    name: 'Balanceamento',
    description: 'Balanceamento e alinhamento completo',
    price: 45.00,
    duration: '45 min',
    category: 'Pneus',
    available: true,
    image: '/api/placeholder/300/200'
  },
  {
    id: 3,
    name: 'Revisão Geral',
    description: 'Revisão completa do veículo com 20 pontos',
    price: 150.00,
    duration: '2 horas',
    category: 'Revisão',
    available: true,
    image: '/api/placeholder/300/200'
  }
];

export function useServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      setServices(mockServices);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return {
    services,
    loading,
    error
  };
}

export default useServices;