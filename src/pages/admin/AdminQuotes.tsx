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
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Link,
} from "lucide-react";

// Mock data para demonstração
const quotes = [
  {
    id: "O1704634800000",
    sessionId: "1704634800000",
    customer: "Carlos Silva",
    customerPhone: "(11) 91234-5678",
    items: [
      { name: "Troca de Óleo", quantity: 1, description: "Troca de óleo sintético 5W30" },
      { name: "Balanceamento", quantity: 4, description: "Balanceamento das 4 rodas" },
    ],
    status: "Pendente",
    hasLinkedOrder: true,
    date: "2025-01-07",
    time: "14:30",
  },
  {
    id: "O1704634700000",
    sessionId: "1704634700000",
    customer: "Maria Santos",
    customerPhone: "(11) 98765-4321",
    items: [
      { name: "Revisão Completa", quantity: 1, description: "Revisão geral do motor e suspensão" },
    ],
    status: "Em Análise",
    hasLinkedOrder: false,
    date: "2025-01-07",
    time: "13:15",
  },
  {
    id: "O1704634600000",
    sessionId: "1704634600000",
    customer: "João Costa",
    customerPhone: "(11) 95555-5555",
    items: [
      { name: "Pintura Completa", quantity: 1, description: "Pintura completa do veículo cor prata" },
    ],
    status: "Orçado",
    hasLinkedOrder: false,
    date: "2025-01-06",
    time: "10:45",
  },
];

const statusOptions = ["Todos", "Pendente", "Em Análise", "Orçado", "Aprovado", "Rejeitado"];

const AdminQuotes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<typeof quotes[0] | null>(null);

  // Simular busca de pedidos vinculados
  const getLinkedOrder = (sessionId: string) => {
    const orders = JSON.parse(localStorage.getItem('store_orders') || '[]');
    return orders.find((order: any) => order.sessionId === sessionId);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Pendente: "bg-yellow-100 text-yellow-800 border-yellow-300",
      "Em Análise": "bg-blue-100 text-blue-800 border-blue-300",
      Orçado: "bg-purple-100 text-purple-800 border-purple-300",
      Aprovado: "bg-green-100 text-green-800 border-green-300",
      Rejeitado: "bg-red-100 text-red-800 border-red-300",
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Em Análise":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "Orçado":
        return <FileText className="h-4 w-4 text-purple-600" />;
      case "Aprovado":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Rejeitado":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || selectedStatus === "Todos" || quote.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleWhatsApp = (quote: typeof quotes[0]) => {
    const message = `Olá ${quote.customer}! Sobre seu orçamento ${quote.id}, como podemos ajudar?`;
    const phone = quote.customerPhone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orçamentos</h1>
        <p className="text-muted-foreground">
          Gerencie todas as solicitações de orçamento da sua loja
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Orçamentos</CardTitle>
          <CardDescription>
            {filteredQuotes.length} orçamentos encontrados
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
                <TableHead>Orçamento</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviços</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Vinculação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">#{quote.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{quote.customer}</div>
                      <div className="text-sm text-muted-foreground">
                        {quote.customerPhone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {quote.items.length} {quote.items.length === 1 ? 'serviço' : 'serviços'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(quote.status)}
                      {getStatusBadge(quote.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{new Date(quote.date).toLocaleDateString('pt-BR')}</div>
                      <div className="text-sm text-muted-foreground">{quote.time}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {quote.hasLinkedOrder ? (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Link className="h-3 w-3" />
                        <span className="text-xs">Com pedido</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Independente</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedQuote(quote)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Orçamento #{selectedQuote?.id}</DialogTitle>
                            <DialogDescription>
                              Informações completas do orçamento
                            </DialogDescription>
                          </DialogHeader>
                          {selectedQuote && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium">Cliente</h4>
                                  <p>{selectedQuote.customer}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedQuote.customerPhone}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium">Status</h4>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(selectedQuote.status)}
                                    {getStatusBadge(selectedQuote.status)}
                                  </div>
                                </div>
                              </div>
                              
                              {selectedQuote.hasLinkedOrder && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="flex items-center gap-2 text-blue-700">
                                    <Link className="h-4 w-4" />
                                    <span className="font-medium text-sm">
                                      Este cliente também possui um pedido vinculado: #P{selectedQuote.sessionId}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <h4 className="font-medium mb-2">Serviços Solicitados</h4>
                                <div className="space-y-2">
                                  {selectedQuote.items.map((item, index) => (
                                    <div key={index} className="p-3 bg-muted rounded border">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <span className="font-medium">{item.name}</span>
                                          <span className="text-sm text-muted-foreground ml-2">
                                            Qtd: {item.quantity}
                                          </span>
                                          {item.description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                              {item.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleWhatsApp(quote)}
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

export default AdminQuotes;