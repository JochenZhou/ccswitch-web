import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { Provider, AppId } from '@/types';
import { ProviderCard } from './ProviderCard';
import { EditProviderDialog } from './EditProviderDialog';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import {
  useProvidersQuery,
  useAddProviderMutation,
  useUpdateProviderMutation,
  useDeleteProviderMutation,
  useSwitchProviderMutation,
} from '@/lib/queries';

export function ProviderList({ appId, onAddProvider }: { appId: AppId; onAddProvider: () => void }) {
  const { t } = useTranslation();
  // editingProvider and deletingProvider might be used for dialogs if implemented, 
  // currently we just use confirm for delete, and edit is not fully wired in my snippet but let's keep the state.
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);

  const { data, isLoading } = useProvidersQuery(appId);
  const addMutation = useAddProviderMutation(appId);
  const updateMutation = useUpdateProviderMutation(appId);
  const deleteMutation = useDeleteProviderMutation(appId);
  const switchMutation = useSwitchProviderMutation(appId);

  const providers = data?.providers || {};
  const currentProviderId = data?.currentProviderId || '';
  const providerList = Object.values(providers) as Provider[];

  const handleSwitch = async (provider: Provider) => {
    try {
      await switchMutation.mutateAsync(provider.id);
      toast.success(t('toast.providerSwitched', { name: provider.name }));
    } catch (error) {
      toast.error(t('toast.error'));
    }
  };

  const handleDelete = async (provider: Provider) => {
    if (!confirm(t('confirm.deleteProviderMessage', { name: provider.name }))) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(provider.id);
      toast.success(t('toast.providerDeleted'));
    } catch (error) {
      toast.error(t('toast.error'));
    }
  };

  const handleDuplicate = async (provider: Provider) => {
    try {
      const newProvider = {
        ...provider,
        name: `${provider.name} (Copy)`,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (newProvider as any).id;
      // We need to use the addMutation from the hook.
      // Note: addMutation was declared above.
      await addMutation.mutateAsync(newProvider);
      toast.success(t('toast.providerAdded'));
    } catch (error) {
      toast.error(t('toast.error'));
    }
  };

  const handleEdit = async (provider: Provider) => {
    try {
      await updateMutation.mutateAsync({ id: provider.id, provider });
      toast.success(t('toast.providerUpdated'));
    } catch (error) {
      toast.error(t('toast.error'));
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (providerList.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">{t('provider.empty')}</p>
        <p className="text-sm text-muted-foreground mb-6">{t('provider.emptyDesc')}</p>
        <Button onClick={onAddProvider}>
          <Plus className="h-4 w-4 mr-2" />
          {t('provider.addProvider')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {providerList.map((provider) => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          isCurrent={provider.id === currentProviderId}
          appId={appId}
          onSwitch={() => handleSwitch(provider)}
          onEdit={() => setEditingProvider(provider)}
          onDelete={() => handleDelete(provider)}
          onDuplicate={() => handleDuplicate(provider)}
        />
      ))}

      {/* Edit Provider Dialog */}
      <EditProviderDialog
        open={!!editingProvider}
        onOpenChange={(open) => !open && setEditingProvider(null)}
        provider={editingProvider}
        appId={appId}
        onSubmit={handleEdit}
      />
    </div>
  );
}
