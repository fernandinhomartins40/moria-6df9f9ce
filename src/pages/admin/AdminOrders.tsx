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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Eye,
  Filter,
  MessageSquare,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Mock data
const orders = [
  {
    id: "#12345",
    customer: "João Silva",
    customerPhone: "(11) 99999-9999",
    items: [
      { name: "Filtro de Óleo", quantity: 1, price: 29.90 },
      { name: "Vela de Ignição", quantity: 4, price: 15.50 },
    ],
    total: 91.90,
    status: "Pendente",
    date: "2025-01-07",
    time: "10:30",
    address: "Rua das Flores, 123 - São Paulo, SP",
  },
  {
    id: "#12344",
    customer: "Maria Santos",
    customerPhone: "(11) 88888-8888",
    items: [
      { name: "Kit de Freio Dianteiro", quantity: 1, price: 245.50 },
    ],
    total: 245.50,
    status: "Confirmado",
    date: "2025-01-07",
    time: "09:15",
    address: "Av. Paulista, 456 - São Paulo, SP",
  },
  {
    id: "#12343",
    customer: "Pedro Costa",
    customerPhone: "(11) 77777-7777",
    items: [
      { name: "Óleo Motor 5W30", quantity: 1, price: 67.90 },
    ],
    total: 67.90,
    status: "Entregue",
    date: "2025-01-06",
    time: "16:45",
    address: "Rua Augusta, 789 - São Paulo, SP",
  },
  {
    id: "#12342",
    customer: "Ana Paula",
    customerPhone: "(11) 66666-6666",
    items: [
      { name: "Bateria 60Ah", quantity: 1, price: 299.90 },
      { name: "Alternador", quantity: 1, price: 156.90 },
    ],
    total: 456.80,
    status: "Cancelado",
    date: "2025-01-06",
    time: "14:20",
    address: "Rua da Consolação, 321 - São Paulo, SP",
  },
];

const statusOptions = ["Todos", "Pendente", "Confirmado", "Entregue", "Cancelado"];

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null);

  const getStatusBadge = (status: string) => {
    const variants = {
      Pendente: "default",
      Confirmado: "secondary",
      Entregue: "default",
      Cancelado: "destructive",
    } as const;

    const colors = {
      Pendente: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Confirmado: "bg-blue-100 text-blue-800 border-blue-300",
      Entregue: "bg-green-100 text-green-800 border-green-300",
      Cancelado: "bg-red-100 text-red-800 border-red-300",
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Confirmado":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "Entregue":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Cancelado":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Truck className="h-4 w-4 text-yellow-600" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || selectedStatus === "Todos" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleWhatsApp = (order: typeof orders[0]) => {
    const message = `Olá ${order.customer}! Seu pedido ${order.id} foi atualizado. Como podemos ajudar?`;
    const phone = order.customerPhone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pedidos</h1>
        <p className="text-muted-foreground">
          Gerencie todos os pedidos realizados na sua loja
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <CardDescription>
            {filteredOrders.length} pedidos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por ID ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.customerPhone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    R$ {order.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      {getStatusBadge(order.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{new Date(order.date).toLocaleDateString('pt-BR')}</div>
                      <div className="text-sm text-muted-foreground">{order.time}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Pedido {selectedOrder?.id}</DialogTitle>
                            <DialogDescription>
                              Informações completas do pedido
                            </DialogDescription>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium">Cliente</h4>
                                  <p>{selectedOrder.customer}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedOrder.customerPhone}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium">Status</h4>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(selectedOrder.status)}
                                    {getStatusBadge(selectedOrder.status)}
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Endereço de Entrega</h4>
                                <p className="text-sm">{selectedOrder.address}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Itens do Pedido</h4>
                                <div className="space-y-2">
                                  {selectedOrder.items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                                      <div>
                                        <span className="font-medium">{item.name}</span>
                                        <span className="text-sm text-muted-foreground ml-2">
                                          Qtd: {item.quantity}
                                        </span>
                                      </div>
                                      <span className="font-medium">
                                        R$ {(item.price * item.quantity).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                  <div className="flex justify-between items-center p-2 border-t">
                                    <span className="font-bold">Total</span>
                                    <span className="font-bold text-lg">
                                      R$ {selectedOrder.total.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleWhatsApp(order)}
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
  );
};

export default AdminOrders;