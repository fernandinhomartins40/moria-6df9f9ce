import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
} from "lucide-react";

// Mock data
const stats = [
  {
    title: "Receita Total",
    value: "R$ 45.231,89",
    change: "+20.1%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Produtos",
    value: "2.350",
    change: "+5.2%",
    trend: "up",
    icon: Package,
  },
  {
    title: "Pedidos",
    value: "1.234",
    change: "+12.5%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    title: "Clientes",
    value: "573",
    change: "-2.1%",
    trend: "down",
    icon: Users,
  },
];

const recentOrders = [
  {
    id: "#12345",
    customer: "João Silva",
    items: "Filtro de Óleo, Vela de Ignição",
    total: "R$ 89,90",
    status: "Pendente",
    date: "2025-01-07",
  },
  {
    id: "#12344",
    customer: "Maria Santos",
    items: "Kit de Freio Dianteiro",
    total: "R$ 245,50",
    status: "Confirmado",
    date: "2025-01-07",
  },
  {
    id: "#12343",
    customer: "Pedro Costa",
    items: "Óleo Motor 5W30",
    total: "R$ 67,90",
    status: "Entregue",
    date: "2025-01-06",
  },
  {
    id: "#12342",
    customer: "Ana Paula",
    items: "Bateria 60Ah, Alternador",
    total: "R$ 456,80",
    status: "Cancelado",
    date: "2025-01-06",
  },
];

const topProducts = [
  { name: "Filtro de Óleo", sales: 156, revenue: "R$ 4.680,00" },
  { name: "Óleo Motor 5W30", sales: 134, revenue: "R$ 9.096,00" },
  { name: "Vela de Ignição", sales: 98, revenue: "R$ 2.940,00" },
  { name: "Kit de Freio", sales: 87, revenue: "R$ 21.350,00" },
  { name: "Bateria 60Ah", sales: 45, revenue: "R$ 13.500,00" },
];

const AdminDashboard = () => {
  const getStatusBadge = (status: string) => {
    const variants = {
      Pendente: "default",
      Confirmado: "secondary",
      Entregue: "default",
      Cancelado: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu negócio hoje, {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={stat.trend === "up" ? "text-emerald-500" : "text-red-500"}>
                  {stat.change}
                </span>
                <span>desde o mês passado</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
            <CardDescription>
              Últimos pedidos realizados na loja
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.items}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="font-medium">{order.total}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
            <CardDescription>
              Top 5 produtos por vendas este mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.sales} vendas
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{product.revenue}</div>
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

export default AdminDashboard;