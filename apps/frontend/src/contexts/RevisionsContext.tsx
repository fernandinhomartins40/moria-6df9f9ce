import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Customer,
  Vehicle,
  ChecklistCategory,
  ChecklistItem,
  Revision,
  DEFAULT_CHECKLIST_CATEGORIES,
  DEFAULT_CHECKLIST_ITEMS
} from '../types/revisions';

interface RevisionsContextData {
  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomer: (id: string) => Customer | undefined;

  // Vehicles
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => Vehicle;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  getVehicle: (id: string) => Vehicle | undefined;
  getVehiclesByCustomer: (customerId: string) => Vehicle[];

  // Checklist Categories & Items
  categories: ChecklistCategory[];
  addCategory: (category: Omit<ChecklistCategory, 'id' | 'createdAt'>) => ChecklistCategory;
  updateCategory: (id: string, category: Partial<ChecklistCategory>) => void;
  toggleCategoryEnabled: (id: string) => void;
  deleteCategory: (id: string) => void;
  getCategory: (id: string) => ChecklistCategory | undefined;

  addItemToCategory: (categoryId: string, item: Omit<ChecklistItem, 'id' | 'categoryId' | 'createdAt'>) => ChecklistItem;
  updateItem: (categoryId: string, itemId: string, item: Partial<ChecklistItem>) => void;
  toggleItemEnabled: (categoryId: string, itemId: string) => void;
  deleteItem: (categoryId: string, itemId: string) => void;

  // Revisions
  revisions: Revision[];
  addRevision: (revision: Omit<Revision, 'id' | 'createdAt' | 'updatedAt'>) => Revision;
  updateRevision: (id: string, revision: Partial<Revision>) => void;
  deleteRevision: (id: string) => void;
  getRevision: (id: string) => Revision | undefined;
  getRevisionsByVehicle: (vehicleId: string) => Revision[];
  getRevisionsByCustomer: (customerId: string) => Revision[];
}

const RevisionsContext = createContext<RevisionsContextData>({} as RevisionsContextData);

export function RevisionsProvider({ children }: { children: ReactNode }) {
  // Load from localStorage
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const stored = localStorage.getItem('moria_customers');
    return stored ? JSON.parse(stored) : [];
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const stored = localStorage.getItem('moria_vehicles');
    return stored ? JSON.parse(stored) : [];
  });

  const [categories, setCategories] = useState<ChecklistCategory[]>(() => {
    const stored = localStorage.getItem('moria_checklist_categories');
    if (stored) {
      return JSON.parse(stored);
    }

    // Initialize with default categories
    const defaultCategories: ChecklistCategory[] = DEFAULT_CHECKLIST_CATEGORIES.map((cat, index) => {
      const categoryId = `cat-${Date.now()}-${index}`;
      const categoryName = cat.name;
      const defaultItems = DEFAULT_CHECKLIST_ITEMS[categoryName] || [];

      return {
        ...cat,
        id: categoryId,
        createdAt: new Date(),
        items: defaultItems.map((item, itemIndex) => ({
          ...item,
          id: `item-${Date.now()}-${index}-${itemIndex}`,
          categoryId: categoryId,
          createdAt: new Date()
        }))
      };
    });

    return defaultCategories;
  });

  const [revisions, setRevisions] = useState<Revision[]>(() => {
    const stored = localStorage.getItem('moria_revisions');
    return stored ? JSON.parse(stored) : [];
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('moria_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('moria_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('moria_checklist_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('moria_revisions', JSON.stringify(revisions));
  }, [revisions]);

  // Customer methods
  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCustomer: Customer = {
      ...customer,
      id: `customer-${Date.now()}`,
      createdAt: new Date()
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev =>
      prev.map(customer =>
        customer.id === id ? { ...customer, ...updates } : customer
      )
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  const getCustomer = (id: string) => {
    return customers.find(customer => customer.id === id);
  };

  // Vehicle methods
  const addVehicle = (vehicle: Omit<Vehicle, 'id' | 'createdAt'>): Vehicle => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `vehicle-${Date.now()}`,
      createdAt: new Date()
    };
    setVehicles(prev => [...prev, newVehicle]);
    return newVehicle;
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev =>
      prev.map(vehicle =>
        vehicle.id === id ? { ...vehicle, ...updates } : vehicle
      )
    );
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
  };

  const getVehicle = (id: string) => {
    return vehicles.find(vehicle => vehicle.id === id);
  };

  const getVehiclesByCustomer = (customerId: string) => {
    return vehicles.filter(vehicle => vehicle.customerId === customerId);
  };

  // Category methods
  const addCategory = (category: Omit<ChecklistCategory, 'id' | 'createdAt'>): ChecklistCategory => {
    const newCategory: ChecklistCategory = {
      ...category,
      id: `cat-${Date.now()}`,
      createdAt: new Date()
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = (id: string, updates: Partial<ChecklistCategory>) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === id ? { ...category, ...updates } : category
      )
    );
  };

  const toggleCategoryEnabled = (id: string) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === id
          ? { ...category, isEnabled: !category.isEnabled }
          : category
      )
    );
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(category => category.id !== id));
  };

  const getCategory = (id: string) => {
    return categories.find(category => category.id === id);
  };

  // Item methods
  const addItemToCategory = (
    categoryId: string,
    item: Omit<ChecklistItem, 'id' | 'categoryId' | 'createdAt'>
  ): ChecklistItem => {
    const newItem: ChecklistItem = {
      ...item,
      id: `item-${Date.now()}`,
      categoryId,
      createdAt: new Date()
    };

    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? { ...category, items: [...category.items, newItem] }
          : category
      )
    );

    return newItem;
  };

  const updateItem = (categoryId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
              )
            }
          : category
      )
    );
  };

  const toggleItemEnabled = (categoryId: string, itemId: string) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map(item =>
                item.id === itemId
                  ? { ...item, isEnabled: !item.isEnabled }
                  : item
              )
            }
          : category
      )
    );
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.filter(item => item.id !== itemId)
            }
          : category
      )
    );
  };

  // Revision methods
  const addRevision = (revision: Omit<Revision, 'id' | 'createdAt' | 'updatedAt'>): Revision => {
    const newRevision: Revision = {
      ...revision,
      id: `revision-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setRevisions(prev => [...prev, newRevision]);
    return newRevision;
  };

  const updateRevision = (id: string, updates: Partial<Revision>) => {
    setRevisions(prev =>
      prev.map(revision =>
        revision.id === id
          ? { ...revision, ...updates, updatedAt: new Date() }
          : revision
      )
    );
  };

  const deleteRevision = (id: string) => {
    setRevisions(prev => prev.filter(revision => revision.id !== id));
  };

  const getRevision = (id: string) => {
    return revisions.find(revision => revision.id === id);
  };

  const getRevisionsByVehicle = (vehicleId: string) => {
    return revisions.filter(revision => revision.vehicleId === vehicleId);
  };

  const getRevisionsByCustomer = (customerId: string) => {
    return revisions.filter(revision => revision.customerId === customerId);
  };

  return (
    <RevisionsContext.Provider
      value={{
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomer,
        vehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        getVehicle,
        getVehiclesByCustomer,
        categories,
        addCategory,
        updateCategory,
        toggleCategoryEnabled,
        deleteCategory,
        getCategory,
        addItemToCategory,
        updateItem,
        toggleItemEnabled,
        deleteItem,
        revisions,
        addRevision,
        updateRevision,
        deleteRevision,
        getRevision,
        getRevisionsByVehicle,
        getRevisionsByCustomer
      }}
    >
      {children}
    </RevisionsContext.Provider>
  );
}

export function useRevisions() {
  const context = useContext(RevisionsContext);
  if (!context) {
    throw new Error('useRevisions must be used within a RevisionsProvider');
  }
  return context;
}
