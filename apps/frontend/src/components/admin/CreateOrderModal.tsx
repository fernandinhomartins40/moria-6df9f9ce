import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import {
  Package,
  User,
  MapPin,
  CreditCard,
  Plus,
  Minus,
  Trash2,
  Search,
  Loader2,
  X,
  ShoppingCart,
  Wrench
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import adminService from "../../api/adminService";
import productService from "../../api/productService";
import serviceService from "../../api/serviceService";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  addresses?: Array<{
    id: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    type: string;
  }>;
}

interface OrderItem {
  id: string;
  name: string;
  type: 'PRODUCT' | 'SERVICE';
  price: number;
  quantity: number;
  stock?: number;
}

interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  type: 'HOME' | 'WORK' | 'OTHER';
}

export function CreateOrderModal({ isOpen, onClose, onSuccess }: CreateOrderModalProps) {
  const { toast } = useToast();

  // Estados principais
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  // Cliente
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  // Dados do cliente (para novo cliente ou edição)
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Itens
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  // Endereço
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [saveAddressToCustomer, setSaveAddressToCustomer] = useState(true);
  const [address, setAddress] = useState<Address>({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'HOME'
  });
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  // Pagamento
  const [paymentMethod, setPaymentMethod] = useState('');
  const [couponCode, setCouponCode] = useState('');

  // Carregar clientes
  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      loadProducts();
      loadServices();
    }
  }, [isOpen]);

  // Buscar clientes com debounce
  useEffect(() => {
    if (customerSearch.length >= 2) {
      const timer = setTimeout(() => {
        loadCustomers(customerSearch);
      }, 500);
      return () => clearTimeout(timer);
    } else if (customerSearch.length === 0) {
      loadCustomers();
    }
  }, [customerSearch]);

  const loadCustomers = async (search?: string) => {
    setIsLoadingCustomers(true);
    try {
      const response = await adminService.getCustomers({ search, limit: 50 });
      setCustomers(response.customers);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await productService.getProducts({ page: 1, limit: 100 });
      // Mostrar todos os produtos ativos (sem estoque ficam desabilitados visualmente)
      setProducts(response.products.filter(p => p.status === 'ACTIVE'));
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadServices = async () => {
    setIsLoadingServices(true);
    try {
      const response = await serviceService.getServices({ page: 1, limit: 100 });
      setServices(response.services.filter(s => s.status === 'ACTIVE'));
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.name);
    setCustomerEmail(customer.email);
    // Priorizar whatsapp, depois phone
    setCustomerPhone(customer.whatsapp || customer.phone || '');

    // Se cliente tem endereços, usar o primeiro
    if (customer.addresses && customer.addresses.length > 0) {
      setSelectedAddressId(customer.addresses[0].id);
      setUseExistingAddress(true);
    } else {
      // Cliente não tem endereços, forçar cadastro de novo
      setUseExistingAddress(false);
      setSelectedAddressId('');
    }
  };

  const handleAddItem = (item: any, type: 'PRODUCT' | 'SERVICE') => {
    const existingItem = selectedItems.find(i => i.id === item.id);

    if (existingItem) {
      toast({
        title: "Item já adicionado",
        description: "Este item já está no pedido. Ajuste a quantidade se necessário.",
        variant: "destructive"
      });
      return;
    }

    const newItem: OrderItem = {
      id: item.id,
      name: item.name,
      type,
      price: type === 'PRODUCT' ? Number(item.promoPrice || item.salePrice) : Number(item.basePrice || 0),
      quantity: 1,
      stock: type === 'PRODUCT' ? item.stock : undefined
    };

    setSelectedItems([...selectedItems, newItem]);
    toast({
      title: "✅ Item adicionado",
      description: `${item.name} foi adicionado ao pedido`
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter(i => i.id !== itemId));
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(1, item.quantity + delta);

        // Verificar estoque para produtos
        if (item.type === 'PRODUCT' && item.stock && newQuantity > item.stock) {
          toast({
            title: "Estoque insuficiente",
            description: `Apenas ${item.stock} unidades disponíveis`,
            variant: "destructive"
          });
          return item;
        }

        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const searchCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      return;
    }

    setIsSearchingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP e tente novamente",
          variant: "destructive"
        });
        return;
      }

      setAddress({
        ...address,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
        zipCode: cep
      });
    } catch (error) {
      toast({
        title: "Erro ao buscar CEP",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setIsSearchingCep(false);
    }
  };

  const calculateSubtotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        if (!customerName || !customerEmail || !customerPhone) {
          toast({
            title: "Dados incompletos",
            description: "Preencha todos os dados do cliente",
            variant: "destructive"
          });
          return false;
        }
        return true;

      case 2:
        if (selectedItems.length === 0) {
          toast({
            title: "Nenhum item selecionado",
            description: "Adicione pelo menos um produto ou serviço",
            variant: "destructive"
          });
          return false;
        }
        return true;

      case 3:
        if (useExistingAddress) {
          if (!selectedAddressId) {
            toast({
              title: "Endereço não selecionado",
              description: "Selecione um endereço ou cadastre um novo",
              variant: "destructive"
            });
            return false;
          }
        } else {
          if (!address.street || !address.number || !address.neighborhood ||
              !address.city || !address.state || !address.zipCode) {
            toast({
              title: "Endereço incompleto",
              description: "Preencha todos os campos do endereço",
              variant: "destructive"
            });
            return false;
          }
        }
        return true;

      case 4:
        if (!paymentMethod) {
          toast({
            title: "Forma de pagamento não selecionada",
            description: "Selecione a forma de pagamento",
            variant: "destructive"
          });
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleCreateOrder = async () => {
    if (!validateStep(4)) return;

    setIsCreating(true);
    try {
      // Preparar endereço
      let orderAddress: Address;

      if (useExistingAddress && selectedCustomer?.addresses) {
        const existingAddr = selectedCustomer.addresses.find(a => a.id === selectedAddressId);
        if (!existingAddr) {
          throw new Error('Endereço não encontrado');
        }
        orderAddress = {
          street: existingAddr.street,
          number: existingAddr.number,
          complement: existingAddr.complement,
          neighborhood: existingAddr.neighborhood,
          city: existingAddr.city,
          state: existingAddr.state,
          zipCode: existingAddr.zipCode,
          type: existingAddr.type as 'HOME' | 'WORK' | 'OTHER'
        };
      } else {
        orderAddress = address;

        // Salvar endereço no cadastro do cliente se solicitado
        if (saveAddressToCustomer && selectedCustomer) {
          try {
            await adminService.createCustomerAddress(selectedCustomer.id, address);
            toast({
              title: "Endereço salvo",
              description: "Endereço adicionado ao cadastro do cliente"
            });
          } catch (addrError: any) {
            console.error('Erro ao salvar endereço:', addrError);
            // Não interrompe a criação do pedido
          }
        }
      }

      // Preparar itens
      const items = selectedItems.map(item => ({
        productId: item.type === 'PRODUCT' ? item.id : undefined,
        serviceId: item.type === 'SERVICE' ? item.id : undefined,
        type: item.type,
        quantity: item.quantity
      }));

      // Criar pedido
      const orderData = {
        customerName,
        customerEmail,
        customerPhone: customerPhone.replace(/\D/g, ''),
        address: orderAddress,
        items,
        paymentMethod,
        couponCode: couponCode || undefined
      };

      await adminService.createAdminOrder(orderData);

      toast({
        title: "✅ Pedido criado com sucesso!",
        description: `Pedido criado para ${customerName}`
      });

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      toast({
        title: "❌ Erro ao criar pedido",
        description: error.response?.data?.error || error.message || "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedCustomer(null);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setSelectedItems([]);
    setAddress({
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      type: 'HOME'
    });
    setPaymentMethod('');
    setCouponCode('');
    setCustomerSearch('');
    setProductSearch('');
    setServiceSearch('');
    setUseExistingAddress(false);
    setSelectedAddressId('');
    setSaveAddressToCustomer(true);
    onClose();
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    s.category.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Criar Novo Pedido
          </DialogTitle>
          <DialogDescription>
            Etapa {step} de 4: {
              step === 1 ? 'Dados do Cliente' :
              step === 2 ? 'Itens do Pedido' :
              step === 3 ? 'Endereço de Entrega' :
              'Pagamento'
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 pb-6">
            {/* ETAPA 1: Cliente */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>Buscar Cliente Existente</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Digite nome, email ou telefone..."
                      className="pl-10"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                    />
                  </div>

                  {isLoadingCustomers && (
                    <div className="mt-2 text-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </div>
                  )}

                  {customerSearch.length >= 2 && !isLoadingCustomers && customers.length > 0 && (
                    <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                      {customers.map(customer => (
                        <button
                          key={customer.id}
                          className="w-full p-3 text-left hover:bg-muted flex items-center justify-between border-b last:border-b-0"
                          onClick={() => handleSelectCustomer(customer)}
                        >
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {customer.email} • {customer.whatsapp || customer.phone || 'Sem telefone'}
                            </p>
                          </div>
                          <Plus className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <Label className="text-lg font-semibold">
                    {selectedCustomer ? 'Dados do Cliente Selecionado' : 'Dados do Novo Cliente'}
                  </Label>
                  {selectedCustomer && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Cliente encontrado no sistema
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="customerName">Nome Completo *</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="João Silva"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerEmail">Email *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="joao@email.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerPhone">WhatsApp *</Label>
                    <Input
                      id="customerPhone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 2: Itens */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-lg font-semibold">Adicionar Itens ao Pedido</Label>
                  <p className="text-sm text-muted-foreground">
                    Busque e adicione produtos ou serviços ao pedido
                  </p>
                </div>

                <Tabs defaultValue="products" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="products">
                      <Package className="h-4 w-4 mr-2" />
                      Produtos
                    </TabsTrigger>
                    <TabsTrigger value="services">
                      <Wrench className="h-4 w-4 mr-2" />
                      Serviços
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="products" className="space-y-4">
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar produtos por nome ou categoria..."
                          className="pl-10"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                        />
                      </div>
                      {!isLoadingProducts && (
                        <div className="flex items-center justify-between text-sm">
                          <p className="text-muted-foreground">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                          </p>
                          {productSearch && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setProductSearch('')}
                              className="h-7 text-xs"
                            >
                              Limpar busca
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    <ScrollArea className="h-64 border rounded-lg">
                      {isLoadingProducts ? (
                        <div className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          <p className="text-sm text-muted-foreground mt-2">Carregando produtos...</p>
                        </div>
                      ) : filteredProducts.length > 0 ? (
                        <div className="p-2 space-y-2">
                          {filteredProducts.map(product => {
                            const isLowStock = product.stock < 5;
                            const isOutOfStock = product.stock === 0;
                            const isAlreadyAdded = selectedItems.some(i => i.id === product.id);

                            return (
                              <div
                                key={product.id}
                                className={`p-3 border rounded-lg transition-all ${
                                  isOutOfStock
                                    ? 'opacity-50 cursor-not-allowed bg-gray-50'
                                    : isAlreadyAdded
                                    ? 'bg-green-50 border-green-200'
                                    : 'hover:bg-muted cursor-pointer hover:border-moria-orange'
                                }`}
                                onClick={() => !isOutOfStock && !isAlreadyAdded && handleAddItem(product, 'PRODUCT')}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium">{product.name}</p>
                                      {isAlreadyAdded && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                          ✓ Adicionado
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                      {product.category}
                                    </p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="text-sm font-semibold text-moria-orange">
                                        {formatCurrency(Number(product.promoPrice || product.salePrice))}
                                      </p>
                                      <span className="text-muted-foreground">•</span>
                                      <p className={`text-sm ${
                                        isOutOfStock
                                          ? 'text-red-600 font-semibold'
                                          : isLowStock
                                          ? 'text-yellow-600 font-medium'
                                          : 'text-muted-foreground'
                                      }`}>
                                        {isOutOfStock
                                          ? '❌ Sem estoque'
                                          : isLowStock
                                          ? `⚠️ Estoque baixo: ${product.stock}`
                                          : `✓ Estoque: ${product.stock}`}
                                      </p>
                                    </div>
                                  </div>
                                  {!isOutOfStock && !isAlreadyAdded && (
                                    <Plus className="h-5 w-5 text-moria-orange flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Package className="h-16 w-16 mx-auto mb-3 opacity-20" />
                          <p className="font-medium mb-1">
                            {productSearch ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
                          </p>
                          {productSearch && (
                            <p className="text-sm">
                              Tente buscar com outros termos
                            </p>
                          )}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="services" className="space-y-4">
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar serviços por nome ou categoria..."
                          className="pl-10"
                          value={serviceSearch}
                          onChange={(e) => setServiceSearch(e.target.value)}
                        />
                      </div>
                      {!isLoadingServices && (
                        <div className="flex items-center justify-between text-sm">
                          <p className="text-muted-foreground">
                            {filteredServices.length} {filteredServices.length === 1 ? 'serviço encontrado' : 'serviços encontrados'}
                          </p>
                          {serviceSearch && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setServiceSearch('')}
                              className="h-7 text-xs"
                            >
                              Limpar busca
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    <ScrollArea className="h-64 border rounded-lg">
                      {isLoadingServices ? (
                        <div className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          <p className="text-sm text-muted-foreground mt-2">Carregando serviços...</p>
                        </div>
                      ) : filteredServices.length > 0 ? (
                        <div className="p-2 space-y-2">
                          {filteredServices.map(service => {
                            const isAlreadyAdded = selectedItems.some(i => i.id === service.id);

                            return (
                              <div
                                key={service.id}
                                className={`p-3 border rounded-lg transition-all ${
                                  isAlreadyAdded
                                    ? 'bg-green-50 border-green-200'
                                    : 'hover:bg-muted cursor-pointer hover:border-moria-orange'
                                }`}
                                onClick={() => !isAlreadyAdded && handleAddItem(service, 'SERVICE')}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium">{service.name}</p>
                                      {isAlreadyAdded && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                          ✓ Adicionado
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                      {service.category}
                                    </p>
                                    <p className="text-sm font-semibold text-moria-orange">
                                      {service.basePrice ? formatCurrency(Number(service.basePrice)) : 'Sob consulta'}
                                    </p>
                                  </div>
                                  {!isAlreadyAdded && (
                                    <Plus className="h-5 w-5 text-moria-orange flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Wrench className="h-16 w-16 mx-auto mb-3 opacity-20" />
                          <p className="font-medium mb-1">
                            {serviceSearch ? 'Nenhum serviço encontrado' : 'Nenhum serviço disponível'}
                          </p>
                          {serviceSearch && (
                            <p className="text-sm">
                              Tente buscar com outros termos
                            </p>
                          )}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>

                <Separator />

                <div>
                  <Label className="text-lg font-semibold">
                    Itens Selecionados ({selectedItems.length})
                  </Label>
                </div>

                {selectedItems.length > 0 ? (
                  <div className="space-y-2">
                    {selectedItems.map(item => (
                      <div key={item.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.type === 'PRODUCT' ? '📦 Produto' : '🔧 Serviço'} •
                              {formatCurrency(item.price)} cada
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, 1)}
                              disabled={item.type === 'PRODUCT' && item.stock ? item.quantity >= item.stock : false}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Subtotal</p>
                            <p className="font-bold text-lg">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Nenhum item adicionado ao pedido</p>
                  </div>
                )}
              </div>
            )}

            {/* ETAPA 3: Endereço */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-lg font-semibold">Endereço de Entrega</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer?.addresses && selectedCustomer.addresses.length > 0
                      ? `${customerName} possui ${selectedCustomer.addresses.length} endereço(s) cadastrado(s)`
                      : `${customerName} não possui endereços cadastrados`}
                  </p>
                </div>

                {selectedCustomer?.addresses && selectedCustomer.addresses.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selecionar Endereço</Label>
                    <Select
                      value={useExistingAddress ? selectedAddressId : 'new'}
                      onValueChange={(value) => {
                        if (value === 'new') {
                          setUseExistingAddress(false);
                          setSelectedAddressId('');
                        } else {
                          setUseExistingAddress(true);
                          setSelectedAddressId(value);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um endereço" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCustomer.addresses.map(addr => (
                          <SelectItem key={addr.id} value={addr.id}>
                            {addr.street}, {addr.number} - {addr.neighborhood}, {addr.city}/{addr.state}
                          </SelectItem>
                        ))}
                        <SelectItem value="new">+ Cadastrar Novo Endereço</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(!selectedCustomer?.addresses || selectedCustomer.addresses.length === 0) && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Este cliente não possui endereços cadastrados. Preencha os dados abaixo para criar o pedido.
                    </p>
                  </div>
                )}

                {(!useExistingAddress || !selectedCustomer?.addresses || selectedCustomer.addresses.length === 0) && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="zipCode">CEP *</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="zipCode"
                          value={address.zipCode}
                          onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                          placeholder="00000-000"
                          maxLength={9}
                        />
                        <Button
                          variant="outline"
                          onClick={() => searchCep(address.zipCode)}
                          disabled={isSearchingCep}
                        >
                          {isSearchingCep ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="street">Rua *</Label>
                        <Input
                          id="street"
                          value={address.street}
                          onChange={(e) => setAddress({ ...address, street: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="number">Número *</Label>
                        <Input
                          id="number"
                          value={address.number}
                          onChange={(e) => setAddress({ ...address, number: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        value={address.complement}
                        onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                        placeholder="Apto, bloco, etc..."
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="neighborhood">Bairro *</Label>
                        <Input
                          id="neighborhood"
                          value={address.neighborhood}
                          onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">Cidade *</Label>
                        <Input
                          id="city"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="state">Estado *</Label>
                        <Input
                          id="state"
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })}
                          placeholder="SP"
                          maxLength={2}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="addressType">Tipo</Label>
                        <Select
                          value={address.type}
                          onValueChange={(value: 'HOME' | 'WORK' | 'OTHER') => setAddress({ ...address, type: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HOME">Residencial</SelectItem>
                            <SelectItem value="WORK">Comercial</SelectItem>
                            <SelectItem value="OTHER">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {selectedCustomer && (
                      <div className="flex items-center space-x-2 pt-2 border-t">
                        <Checkbox
                          id="saveAddress"
                          checked={saveAddressToCustomer}
                          onCheckedChange={(checked) => setSaveAddressToCustomer(checked as boolean)}
                        />
                        <label
                          htmlFor="saveAddress"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Salvar este endereço no cadastro do cliente
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ETAPA 4: Pagamento */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-semibold">Forma de Pagamento *</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {[
                      { value: 'DINHEIRO', label: 'Dinheiro' },
                      { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito' },
                      { value: 'CARTAO_DEBITO', label: 'Cartão de Débito' },
                      { value: 'PIX', label: 'Pix' },
                      { value: 'TRANSFERENCIA', label: 'Transferência' },
                      { value: 'BOLETO', label: 'Boleto' }
                    ].map(method => (
                      <Button
                        key={method.value}
                        variant={paymentMethod === method.value ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => setPaymentMethod(method.value)}
                      >
                        {method.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="couponCode">Cupom de Desconto (opcional)</Label>
                  <Input
                    id="couponCode"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="DESCONTO10"
                    className="mt-1"
                  />
                </div>

                <Separator />

                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-lg">Resumo do Pedido</h3>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cliente:</span>
                      <span className="font-medium">{customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Itens:</span>
                      <span className="font-medium">{selectedItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pagamento:</span>
                      <span className="font-medium">
                        {paymentMethod ?
                          paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) :
                          'Não selecionado'}
                      </span>
                    </div>

                    <Separator className="my-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-moria-orange">
                        {formatCurrency(calculateSubtotal())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Botões de Navegação */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={step === 1 ? handleClose : handlePreviousStep}
          >
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </Button>

          {step < 4 ? (
            <Button onClick={handleNextStep}>
              Próxima Etapa
            </Button>
          ) : (
            <Button
              onClick={handleCreateOrder}
              disabled={isCreating}
              className="bg-moria-orange hover:bg-orange-600"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando Pedido...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Criar Pedido
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
