import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  MessageSquare,
  Eye,
  UserPlus,
  Filter,
  ShoppingBag,
} from "lucide-react";

// Mock data
const customers = [
  {
    id: 1,
    name: "João Silva",
    phone: "(11) 99999-9999",
    email: "joao.silva@email.com",
    address: "Rua das Flores, 123 - São Paulo, SP",
    totalOrders: 12,
    totalSpent: 1456.80,
    lastOrder: "2025-01-07",
    status: "Ativo",
    joinDate: "2024-03-15",
  },
  {
    id: 2,
    name: "Maria Santos",
    phone: "(11) 88888-8888",
    email: "maria.santos@email.com",
    address: "Av. Paulista, 456 - São Paulo, SP",
    totalOrders: 8,
    totalSpent: 892.45,
    lastOrder: "2025-01-06",
    status: "Ativo",
    joinDate: "2024-05-20",
  },
  {
    id: 3,
    name: "Pedro Costa",
    phone: "(11) 77777-7777",
    email: "pedro.costa@email.com",
    address: "Rua Augusta, 789 - São Paulo, SP",
    totalOrders: 15,
    totalSpent: 2134.90,
    lastOrder: "2025-01-05",
    status: "VIP",
    joinDate: "2024-01-10",
  },
  {
    id: 4,
    name: "Ana Paula",
    phone: "(11) 66666-6666",
    email: "ana.paula@email.com",
    address: "Rua da Consolação, 321 - São Paulo, SP",
    totalOrders: 3,
    totalSpent: 234.70,
    lastOrder: "2024-12-15",
    status: "Inativo",
    joinDate: "2024-11-05",
  },
  {
    id: 5,
    name: "Carlos Oliveira",
    phone: "(11) 55555-5555",
    email: "carlos.oliveira@email.com",
    address: "Av. Faria Lima, 987 - São Paulo, SP",
    totalOrders: 22,
    totalSpent: 3567.20,
    lastOrder: "2025-01-06",
    status: "VIP",
    joinDate: "2023-08-12",
  },
];

const recentOrders = [
  { id: "#12345", customer: "João Silva", total: 89.90, date: "2025-01-07" },
  { id: "#12344", customer: "Maria Santos", total: 245.50, date: "2025-01-07" },
  { id: "#12343", customer: "Pedro Costa", total: 67.90, date: "2025-01-06" },
];

const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<typeof customers[0] | null>(null);

  const getStatusBadge = (status: string) => {
    const variants = {
      Ativo: "bg-green-100 text-green-800 border-green-300",
      VIP: "bg-gradient-premium text-black border-yellow-300",
      Inativo: "bg-gray-100 text-gray-800 border-gray-300",
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const handleWhatsApp = (customer: typeof customers[0]) => {
    const message = `Olá ${customer.name}! Temos promoções especiais para você na Moria Peças e Serviços!`;
    const phone = customer.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === "Ativo" || c.status === "VIP").length;
  const vipCustomers = customers.filter(c => c.status === "VIP").length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
        <p className="text-muted-foreground">
          Gerencie seus clientes e relacionamento
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes VIP</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vipCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customers Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>
                {filteredCustomers.length} clientes encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar clientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Pedidos</TableHead>
                    <TableHead>Total Gasto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {customer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.totalOrders}</TableCell>
                      <TableCell className="font-medium">
                        R$ {customer.totalSpent.toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedCustomer(customer)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Perfil do Cliente</DialogTitle>
                                <DialogDescription>
                                  Informações detalhadas do cliente
                                </DialogDescription>
                              </DialogHeader>
                              {selectedCustomer && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium">Nome</h4>
                                      <p>{selectedCustomer.name}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium">Status</h4>
                                      {getStatusBadge(selectedCustomer.status)}
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium">Telefone</h4>
                                      <p>{selectedCustomer.phone}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium">E-mail</h4>
                                      <p>{selectedCustomer.email}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium">Endereço</h4>
                                    <p>{selectedCustomer.address}</p>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <h4 className="font-medium">Total de Pedidos</h4>
                                      <p className="text-2xl font-bold">{selectedCustomer.totalOrders}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium">Total Gasto</h4>
                                      <p className="text-2xl font-bold">R$ {selectedCustomer.totalSpent.toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium">Último Pedido</h4>
                                      <p>{new Date(selectedCustomer.lastOrder).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleWhatsApp(customer)}
                            className="text-green-600"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
            <CardDescription>
              Últimos pedidos dos clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{order.id}</div>
                    <div className="text-sm text-muted-foreground">{order.customer}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">R$ {order.total.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCustomers;