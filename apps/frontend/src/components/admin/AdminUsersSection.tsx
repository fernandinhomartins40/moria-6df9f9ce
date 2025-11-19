import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useToast,
  Spinner,
  Text,
  HStack,
  Input,
  Select,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { adminService } from '@api/adminService';
import { useAdminPermissions } from '@hooks/useAdminPermissions';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'STAFF' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

const ROLE_LABELS = {
  STAFF: 'Mecânico',
  MANAGER: 'Gerente',
  ADMIN: 'Administrador',
  SUPER_ADMIN: 'Super Admin',
};

const ROLE_COLORS = {
  STAFF: 'blue',
  MANAGER: 'green',
  ADMIN: 'orange',
  SUPER_ADMIN: 'red',
};

const STATUS_COLORS = {
  ACTIVE: 'green',
  INACTIVE: 'gray',
};

export default function AdminUsersSection() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const toast = useToast();
  const permissions = useAdminPermissions();

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const filters: any = {};

      if (searchEmail) filters.email = searchEmail;
      if (filterRole) filters.role = filterRole;
      if (filterStatus) filters.status = filterStatus;

      const response = await adminService.getAdminUsers(filters);
      setUsers(response.data.admins);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar usuários',
        description: error.response?.data?.message || 'Erro desconhecido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchEmail, filterRole, filterStatus]);

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    onEditOpen();
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${userName}?`)) {
      return;
    }

    try {
      await adminService.deleteAdminUser(userId);
      toast({
        title: 'Usuário excluído com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir usuário',
        description: error.response?.data?.message || 'Erro desconhecido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCreateSuccess = () => {
    onCreateClose();
    fetchUsers();
  };

  const handleEditSuccess = () => {
    onEditClose();
    setSelectedUser(null);
    fetchUsers();
  };

  if (!permissions.canManageAdmins) {
    return (
      <Box p={8} textAlign="center">
        <Text color="red.500">Você não tem permissão para acessar esta seção.</Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with filters */}
      <VStack spacing={4} mb={6} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">
            Gestão de Usuários
          </Text>
          {permissions.canCreateAdmins && (
            <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onCreateOpen}>
              Novo Usuário
            </Button>
          )}
        </HStack>

        <HStack spacing={4}>
          <Input
            placeholder="Buscar por email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            maxW="300px"
          />
          <Select
            placeholder="Filtrar por cargo"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            maxW="200px"
          >
            <option value="STAFF">Mecânico</option>
            <option value="MANAGER">Gerente</option>
            <option value="ADMIN">Administrador</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </Select>
          <Select
            placeholder="Filtrar por status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            maxW="200px"
          >
            <option value="ACTIVE">Ativo</option>
            <option value="INACTIVE">Inativo</option>
          </Select>
          {(searchEmail || filterRole || filterStatus) && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchEmail('');
                setFilterRole('');
                setFilterStatus('');
              }}
            >
              Limpar Filtros
            </Button>
          )}
        </HStack>
      </VStack>

      {/* Users Table */}
      {loading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
        </Box>
      ) : users.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text color="gray.500">Nenhum usuário encontrado.</Text>
        </Box>
      ) : (
        <Box overflowX="auto" borderWidth="1px" borderRadius="lg">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Nome</Th>
                <Th>Email</Th>
                <Th>Cargo</Th>
                <Th>Status</Th>
                <Th>Criado em</Th>
                <Th textAlign="center">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user.id}>
                  <Td fontWeight="medium">{user.name}</Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <Badge colorScheme={ROLE_COLORS[user.role]}>
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={STATUS_COLORS[user.status]}>
                      {user.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </Td>
                  <Td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</Td>
                  <Td>
                    <HStack spacing={2} justify="center">
                      {permissions.canUpdateAdmins && (
                        <IconButton
                          aria-label="Editar usuário"
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => handleEdit(user)}
                        />
                      )}
                      {permissions.canDeleteAdmins && (
                        <IconButton
                          aria-label="Excluir usuário"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDelete(user.id, user.name)}
                        />
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onSuccess={handleCreateSuccess}
      />

      {selectedUser && (
        <EditUserModal
          isOpen={isEditOpen}
          onClose={() => {
            onEditClose();
            setSelectedUser(null);
          }}
          onSuccess={handleEditSuccess}
          user={selectedUser}
        />
      )}
    </Box>
  );
}
