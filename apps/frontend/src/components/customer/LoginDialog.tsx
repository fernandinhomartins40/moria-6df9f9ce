import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Loader2, User, Mail, Phone, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { PasswordInput } from "../ui/password-input";
import { isPasswordStrong } from "@/lib/passwordUtils";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({
    phone: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    password: "",
    confirmPassword: "",
  });

  // Funções de formatação (copiadas do CreateCustomerModal)
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setRegisterForm({ ...registerForm, phone: value });
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setRegisterForm({ ...registerForm, cpf: value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginForm.phone || !loginForm.password) {
      toast.error("Preencha todos os campos");
      return;
    }

    const result = await login(loginForm.phone, loginForm.password);

    if (result.success) {
      toast.success("Login realizado com sucesso!");
      onOpenChange(false);
      setLoginForm({ phone: "", password: "" });
      navigate("/customer");
    } else {
      toast.error("Telefone ou senha incorretos");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerForm.name || !registerForm.email || !registerForm.phone || !registerForm.password) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (!isPasswordStrong(registerForm.password)) {
      toast.error("A senha não atende aos requisitos mínimos de segurança");
      return;
    }

    // Sanitizar telefone e CPF antes de enviar (apenas dígitos)
    const cleanPhone = registerForm.phone.replace(/\D/g, '');
    const cleanCpf = registerForm.cpf ? registerForm.cpf.replace(/\D/g, '') : '';

    const result = await register({
      name: registerForm.name,
      email: registerForm.email,
      phone: cleanPhone,
      cpf: cleanCpf || undefined,
      password: registerForm.password,
    });

    if (result.success) {
      toast.success("Conta criada com sucesso!");
      onOpenChange(false);
      setRegisterForm({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        password: "",
        confirmPassword: "",
      });
      navigate("/customer");
    } else {
      toast.error(result.error || "Erro ao criar conta");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Área do Cliente
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Cadastrar</TabsTrigger>
          </TabsList>
          
          {/* Login Tab */}
          <TabsContent value="login">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Fazer Login</CardTitle>
                <CardDescription>
                  Entre com suas credenciais para acessar sua conta
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        className="pl-10"
                        value={loginForm.phone}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <PasswordInput
                      id="login-password"
                      placeholder="Digite sua senha"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    <p className="font-medium">Dados para teste:</p>
                    <p>Telefone: (11) 99999-9999</p>
                    <p>Senha: joa (3 primeiras letras do nome)</p>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-moria-orange hover:bg-moria-orange/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Criar Conta</CardTitle>
                <CardDescription>
                  Cadastre-se para acompanhar seus pedidos e muito mais
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nome Completo *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        placeholder="Seu nome completo"
                        className="pl-10"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="register-phone">Telefone *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-phone"
                          placeholder="(11) 99999-9999"
                          className="pl-10"
                          value={formatPhone(registerForm.phone)}
                          onChange={handlePhoneChange}
                          disabled={isLoading}
                          maxLength={15}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-cpf">CPF</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-cpf"
                          placeholder="000.000.000-00"
                          className="pl-10"
                          value={formatCPF(registerForm.cpf)}
                          onChange={handleCPFChange}
                          disabled={isLoading}
                          maxLength={14}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha *</Label>
                    <PasswordInput
                      id="register-password"
                      placeholder="Crie uma senha forte"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                      disabled={isLoading}
                      showStrengthIndicator
                      showRequirements
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirmar Senha *</Label>
                    <PasswordInput
                      id="register-confirm-password"
                      placeholder="Digite a senha novamente"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      disabled={isLoading}
                    />
                    {registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword && (
                      <p className="text-xs text-red-600">As senhas não coincidem</p>
                    )}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-moria-orange hover:bg-moria-orange/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      "Criar Conta"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}