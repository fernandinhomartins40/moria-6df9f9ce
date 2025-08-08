// Componente de Empty State robusto e informativo
import React from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Filter,
  ShoppingCart,
  Settings,
  Database,
  Inbox
} from 'lucide-react';
import { Button } from '../ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  type?: 'default' | 'search' | 'filter' | 'create' | 'cart';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = 'Nenhum item encontrado',
  message = 'Não há dados para exibir no momento.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
  size = 'md',
  type = 'default'
}) => {
  const sizeClasses = {
    sm: { icon: 'w-12 h-12', title: 'text-lg', text: 'text-sm', spacing: 'p-4' },
    md: { icon: 'w-16 h-16', title: 'text-xl', text: 'text-base', spacing: 'p-8' },
    lg: { icon: 'w-20 h-20', title: 'text-2xl', text: 'text-lg', spacing: 'p-12' }
  };

  const classes = sizeClasses[size];

  // Ícones padrão por tipo
  const getDefaultIcon = () => {
    switch (type) {
      case 'search': return <Search className={`${classes.icon} text-blue-400`} />;
      case 'filter': return <Filter className={`${classes.icon} text-purple-400`} />;
      case 'create': return <Plus className={`${classes.icon} text-green-400`} />;
      case 'cart': return <ShoppingCart className={`${classes.icon} text-orange-400`} />;
      default: return <Inbox className={`${classes.icon} text-gray-400`} />;
    }
  };

  // Textos padrão por tipo
  const getDefaultContent = () => {
    switch (type) {
      case 'search':
        return {
          title: 'Nenhum resultado encontrado',
          message: 'Tente ajustar sua busca ou usar termos diferentes.'
        };
      case 'filter':
        return {
          title: 'Nenhum item corresponde aos filtros',
          message: 'Tente remover alguns filtros ou usar critérios diferentes.'
        };
      case 'create':
        return {
          title: 'Pronto para começar?',
          message: 'Crie seu primeiro item clicando no botão abaixo.'
        };
      case 'cart':
        return {
          title: 'Seu carrinho está vazio',
          message: 'Adicione alguns produtos para continuar suas compras.'
        };
      default:
        return { title, message };
    }
  };

  const defaultContent = getDefaultContent();
  const finalTitle = title === 'Nenhum item encontrado' ? defaultContent.title : title;
  const finalMessage = message === 'Não há dados para exibir no momento.' ? defaultContent.message : message;

  return (
    <div className={`flex flex-col items-center justify-center text-center ${classes.spacing} ${className}`}>
      {icon || getDefaultIcon()}
      
      <h3 className={`font-semibold mb-2 ${classes.title} text-gray-800 mt-4`}>
        {finalTitle}
      </h3>
      
      <p className={`${classes.text} text-gray-600 mb-6 max-w-md`}>
        {finalMessage}
      </p>

      {/* Ações */}
      {(onAction || onSecondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onAction && actionLabel && (
            <Button
              onClick={onAction}
              size={size}
              className="flex items-center gap-2"
            >
              {type === 'create' && <Plus className="w-4 h-4" />}
              {actionLabel}
            </Button>
          )}
          
          {onSecondaryAction && secondaryActionLabel && (
            <Button
              onClick={onSecondaryAction}
              variant="outline"
              size={size}
              className="flex items-center gap-2"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Componentes específicos para diferentes contextos

export const EmptyProductsState: React.FC<Omit<EmptyStateProps, 'icon' | 'title' | 'message'>> = (props) => {
  return (
    <EmptyState
      {...props}
      icon={<Package className="w-16 h-16 text-blue-400" />}
      title="Nenhum produto encontrado"
      message="Não há produtos disponíveis no momento. Volte em breve para conferir novidades!"
    />
  );
};

export const EmptyServicesState: React.FC<Omit<EmptyStateProps, 'icon' | 'title' | 'message'>> = (props) => {
  return (
    <EmptyState
      {...props}
      icon={<Settings className="w-16 h-16 text-green-400" />}
      title="Nenhum serviço encontrado"
      message="Não há serviços disponíveis no momento. Entre em contato para mais informações!"
    />
  );
};

export const EmptySearchState: React.FC<Omit<EmptyStateProps, 'title' | 'message'> & {
  searchTerm?: string;
}> = ({ searchTerm, ...props }) => {
  return (
    <EmptyState
      {...props}
      type="search"
      title={searchTerm ? `Nenhum resultado para "${searchTerm}"` : 'Nenhum resultado encontrado'}
      message="Tente usar palavras-chave diferentes ou verifique a ortografia."
    />
  );
};

export const EmptyFilterState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => {
  return (
    <EmptyState
      {...props}
      type="filter"
    />
  );
};

export const EmptyCartState: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => {
  return (
    <EmptyState
      {...props}
      type="cart"
    />
  );
};

export const EmptyDataState: React.FC<Omit<EmptyStateProps, 'icon' | 'title' | 'message'>> = (props) => {
  return (
    <EmptyState
      {...props}
      icon={<Database className="w-16 h-16 text-gray-400" />}
      title="Sem dados disponíveis"
      message="Os dados ainda não foram carregados ou não existem no sistema."
    />
  );
};

export default EmptyState;