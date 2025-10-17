import { useState } from 'react';
import { User, Plus, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { useRevisions } from '../../contexts/RevisionsContext';
import { Customer } from '../../types/revisions';

interface CustomerSelectorProps {
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
}

export function CustomerSelector({ selectedCustomer, onSelectCustomer }: CustomerSelectorProps) {
  const { customers, addCustomer } = useRevisions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: ''
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.cpf?.includes(searchTerm)
  );

  const handleCreateCustomer = () => {
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const customer = addCustomer(newCustomer);
    onSelectCustomer(customer);
    setIsDialogOpen(false);
    setIsCreating(false);
    setNewCustomer({ name: '', email: '', phone: '', cpf: '' });
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
              <DialogTitle>
                {isCreating ? 'Cadastrar Novo Cliente' : 'Selecionar Cliente'}
              </DialogTitle>
            </DialogHeader>

            {isCreating ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={newCustomer.cpf}
                    onChange={(e) => setNewCustomer({ ...newCustomer, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setNewCustomer({ name: '', email: '', phone: '', cpf: '' });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreateCustomer}
                    className="bg-moria-orange hover:bg-moria-orange/90"
                  >
                    Cadastrar
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por nome, email, telefone ou CPF..."
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={() => setIsCreating(true)}
                    className="bg-moria-orange hover:bg-moria-orange/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo
                  </Button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredCustomers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum cliente encontrado</p>
                      <Button
                        onClick={() => setIsCreating(true)}
                        variant="link"
                        className="text-moria-orange"
                      >
                        Cadastrar novo cliente
                      </Button>
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
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
