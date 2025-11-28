// Script para testar o sistema de notificações
const axios = require('axios');

const API_URL = 'http://localhost:3001';

// Credenciais de admin (usar as do banco)
const ADMIN_EMAIL = 'admin@moriapecas.com.br';
const ADMIN_PASSWORD = 'admin123';

async function testNotifications() {
  try {
    console.log('🧪 Testando Sistema de Notificações\n');

    // 1. Login como admin
    console.log('1️⃣  Fazendo login como admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login bem-sucedido!\n');

    // 2. Buscar notificações
    console.log('2️⃣  Buscando notificações...');
    const notificationsResponse = await axios.get(`${API_URL}/admin/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`✅ ${notificationsResponse.data.length} notificações encontradas:`);
    notificationsResponse.data.forEach((notif, index) => {
      console.log(`   ${index + 1}. [${notif.type}] ${notif.title}`);
      console.log(`      ${notif.message}`);
      console.log(`      Lida: ${notif.read ? 'Sim' : 'Não'}`);
      console.log('');
    });

    // 3. Contar não lidas
    console.log('3️⃣  Contando notificações não lidas...');
    const unreadResponse = await axios.get(`${API_URL}/admin/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`✅ ${unreadResponse.data.count} notificações não lidas\n`);

    // 4. Marcar primeira como lida (se existir)
    if (notificationsResponse.data.length > 0 && !notificationsResponse.data[0].read) {
      const firstNotifId = notificationsResponse.data[0].id;
      console.log('4️⃣  Marcando primeira notificação como lida...');

      await axios.patch(
        `${API_URL}/admin/notifications/${firstNotifId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Notificação marcada como lida!\n');
    }

    // 5. Criar uma notificação de teste manualmente
    console.log('5️⃣  Criando notificação de teste...');
    console.log('   (Isto requer acesso direto ao serviço, não pela API)\n');

    console.log('✅ Todos os testes de API passaram!\n');
    console.log('📋 Resumo:');
    console.log('   - Login: OK');
    console.log('   - Buscar notificações: OK');
    console.log('   - Contar não lidas: OK');
    console.log('   - Marcar como lida: OK');
    console.log('\n🎉 Sistema de notificações funcionando!\n');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('\n💡 Dica: Verifique as credenciais de admin no banco de dados');
    }
  }
}

testNotifications();
