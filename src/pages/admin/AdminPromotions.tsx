import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  CalendarIcon,
  Tag,
  Percent,
  Clock,
} from "lucide-react";

// Mock data
const promotions = [
  {
    id: 1,
    title: "Oferta do Dia - Filtros",
    description: "30% de desconto em todos os filtros",
    discount: 30,
    type: "percentage",
    startDate: "2025-01-07",
    endDate: "2025-01-07",
    status: "Ativa",
    products: ["Filtro de Óleo", "Filtro de Ar", "Filtro de Combustível"],
    totalSales: 45,
    revenue: 1350.00,
  },
  {
    id: 2,
    title: "Semana da Manutenção",
    description: "Kit completo com desconto especial",
    discount: 15,
    type: "percentage",
    startDate: "2025-01-06",
    endDate: "2025-01-12",
    status: "Ativa",
    products: ["Kit de Manutenção", "Óleo Motor", "Filtros"],
    totalSales: 23,
    revenue: 2890.50,
  },
  {
    id: 3,
    title: "Black Friday Automotiva",
    description: "Até 50% de desconto em peças selecionadas",
    discount: 50,
    type: "percentage",
    startDate: "2024-11-29",
    endDate: "2024-11-29",
    status: "Expirada",
    products: ["Vários produtos"],
    totalSales: 156,
    revenue: 12450.80,
  },
  {
    id: 4,
    title: "Frete Grátis Especial",
    description: "Frete grátis para compras acima de R$ 100",
    discount: 0,
    type: "shipping",
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    status: "Ativa",
    products: ["Todos os produtos"],
    totalSales: 89,
    revenue: 8950.00,
  },
];

const AdminPromotions = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const getStatusBadge = (status: string) => {
    const variants = {
      Ativa: "bg-green-100 text-green-800 border-green-300",
      Programada: "bg-blue-100 text-blue-800 border-blue-300",
      Expirada: "bg-gray-100 text-gray-800 border-gray-300",
      Pausada: "bg-yellow-100 text-yellow-800 border-yellow-300",
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const getDiscountDisplay = (promotion: typeof promotions[0]) => {
    if (promotion.type === "percentage") {
      return `${promotion.discount}% OFF`;
    }
    if (promotion.type === "shipping") {
      return "Frete Grátis";
    }
    return `R$ ${promotion.discount} OFF`;
  };

  const activePromotions = promotions.filter(p => p.status === "Ativa").length;
  const totalRevenue = promotions.reduce((sum, p) => sum + p.revenue, 0);
  const totalSales = promotions.reduce((sum, p) => sum + p.totalSales, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Promoções</h1>
          <p className="text-muted-foreground">
            Gerencie ofertas especiais e campanhas promocionais
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nova Promoção
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Promoção</DialogTitle>
              <DialogDescription>
                Configure uma nova campanha promocional
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Promoção</Label>
                <Input id="title" placeholder="Ex: Oferta do Dia - Filtros" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" placeholder="Descreva os detalhes da promoção" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount">Desconto</Label>
                  <Input id="discount" type="number" placeholder="30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de desconto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                      <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                      <SelectItem value="shipping">Frete Grátis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy") : <span>Selecionar data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Data de Fim</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy") : <span>Selecionar data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button>Criar Promoção</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promoções Ativas</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePromotions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Promocional</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversão Média</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Promoções</CardTitle>
          <CardDescription>
            Gerencie todas as campanhas promocionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Promoção</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vendas</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promotion) => (
                <TableRow key={promotion.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{promotion.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {promotion.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium">
                      {getDiscountDisplay(promotion)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(promotion.startDate).toLocaleDateString('pt-BR')}</div>
                      <div className="text-muted-foreground">
                        até {new Date(promotion.endDate).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(promotion.status)}</TableCell>
                  <TableCell className="font-medium">{promotion.totalSales}</TableCell>
                  <TableCell className="font-medium">
                    R$ {promotion.revenue.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
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

export default AdminPromotions;