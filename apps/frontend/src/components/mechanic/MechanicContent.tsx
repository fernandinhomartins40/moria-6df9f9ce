import MechanicRevisionsView from './MechanicRevisionsView';

interface MechanicContentProps {
  activeTab: string;
}

export function MechanicContent({ activeTab }: MechanicContentProps) {
  switch (activeTab) {
    case 'revisions':
      return <MechanicRevisionsView />;
    case 'settings':
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Configurações</h2>
          <p className="text-gray-600">Configurações do mecânico em breve...</p>
        </div>
      );
    default:
      return <MechanicRevisionsView />;
  }
}
