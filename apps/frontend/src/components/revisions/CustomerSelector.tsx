import { useState, useEffect } from 'react';
import { User, Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { CreateCustomerModal } from '../admin/CreateCustomerModal';
import adminService, { ProvisionalUser } from '../../api/adminService';
import { useToast } from '../../hooks/use-toast';

// Map API customer to local customer type
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
}

interface CustomerSelectorProps {
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
}

export function CustomerSelector({ selectedCustomer, onSelectCustomer }: CustomerSelectorProps) {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load customers from API when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      loadCustomers();
    }
  }, [isDialogOpen]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getCustomers({ limit: 1000 });

      // Transform API customers to local format
      const transformedCustomers: Customer[] = response.customers.map((c: ProvisionalUser) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.whatsapp,
        cpf: c.cpf
      }));

      setCustomers(transformedCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast({
        title: 'Erro ao carregar clientes',
        description: 'Não foi possível carregar a lista de clientes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.cpf?.includes(searchTerm)
  );

  const handleCreateSuccess = (customer: any) => {
    // Transform to local format
    const newCustomer: Customer = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.whatsapp,
      cpf: customer.cpf
    };

    // Select the newly created customer
    onSelectCustomer(newCustomer);
    setIsDialogOpen(false);
    setIsCreateModalOpen(false);

    // Reload customers list
    loadCustomers();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedCustomer ? (
          <div className="bg-moria-orange/10 border border-moria-orange/30 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-lg">{selectedCustomer.name}</p>
                <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                {selectedCustomer.cpf && (
                  <p className="text-sm text-gray-600">CPF: {selectedCustomer.cpf}</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
              >
                Trocar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="w-full bg-moria-orange hover:bg-moria-orange/90"
          >
            <User className="h-4 w-4 mr-2" />
            Selecionar Cliente
          </Button>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Selecionar Cliente
                <Button
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-moria-orange hover:bg-moria-orange/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Cliente
                </Button>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, email, telefone ou CPF..."
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-moria-orange" />
                    <p className="text-gray-500">Carregando clientes...</p>
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum cliente encontrado</p>
                    <p className="text-sm mt-2">
                      {customers.length === 0
                        ? 'Não há clientes cadastrados no sistema'
                        : 'Tente buscar com outros termos'}
                    </p>
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <Card
                      key={customer.id}
                      className="cursor-pointer hover:border-moria-orange transition-colors"
                      onClick={() => {
                        onSelectCustomer(customer);
                        setIsDialogOpen(false);
                        setSearchTerm('');
                      }}
                    >
                      <CardContent className="p-4">
                        <p className="font-semibold">{customer.name}</p>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                        <p className="text-sm text-gray-600">{customer.phone}</p>
                        {customer.cpf && (
                          <p className="text-sm text-gray-600">CPF: {customer.cpf}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <CreateCustomerModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      </CardContent>
    </Card>
  );
}
