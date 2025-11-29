/**
 * ContactEditor - Editor da seção de Contato
 * NOTA: Esta seção está reservada para futura implementação
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Phone, Mail } from 'lucide-react';

interface ContactEditorProps {
  config: any;
  onChange: (config: any) => void;
}

export const ContactEditor = ({ config, onChange }: ContactEditorProps) => {
  return (
    <div className="space-y-6">
      {/* Placeholder para futura implementação */}
      <Card className="p-8 text-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>

          <h3 className="text-2xl font-bold mb-3 text-gray-900">
            Seção de Contato
          </h3>

          <p className="text-gray-600 mb-6">
            Esta seção está reservada para uma futura implementação de formulário de contato
            ou informações de contato dedicadas.
          </p>

          <div className="bg-white border border-blue-200 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Informações de Contato Atuais:</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>✓ As informações de contato estão disponíveis no <strong>Footer</strong></p>
              <p>✓ Telefone, e-mail e endereço podem ser editados na aba <strong>Footer</strong></p>
              <p>✓ Links para contato estão disponíveis no <strong>Header</strong> (menu)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-white rounded-lg border">
              <Phone className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-700">Telefone</p>
              <p className="text-xs text-gray-500">Configure no Footer</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <Mail className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-700">E-mail</p>
              <p className="text-xs text-gray-500">Configure no Footer</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <MessageSquare className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-700">WhatsApp</p>
              <p className="text-xs text-gray-500">Configure no Hero</p>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>💡 Possibilidades Futuras:</strong><br />
              • Formulário de contato integrado<br />
              • Mapa de localização interativo<br />
              • Chat online / WhatsApp direto<br />
              • Horários de atendimento especiais
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
