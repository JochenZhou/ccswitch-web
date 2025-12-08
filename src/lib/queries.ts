import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providersApi, mcpApi, settingsApi } from './api';
import type { AppId, Provider, McpServer, Settings } from '@/types';

export const useProvidersQuery = (app: AppId) => {
  return useQuery({
    queryKey: ['providers', app],
    queryFn: async () => {
      const [providers, currentProviderId] = await Promise.all([
        providersApi.getProviders(app),
        providersApi.getCurrentProvider(app),
      ]);
      return { providers, currentProviderId };
    },
  });
};

export const useAddProviderMutation = (app: AppId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: Omit<Provider, 'id'>) => providersApi.addProvider(app, provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers', app] });
    },
  });
};

export const useUpdateProviderMutation = (app: AppId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, provider }: { id: string; provider: Partial<Provider> }) =>
      providersApi.updateProvider(app, id, provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers', app] });
    },
  });
};

export const useDeleteProviderMutation = (app: AppId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => providersApi.deleteProvider(app, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers', app] });
    },
  });
};

export const useSwitchProviderMutation = (app: AppId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => providersApi.switchProvider(app, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers', app] });
    },
  });
};

export const useMcpServersQuery = () => {
  return useQuery({
    queryKey: ['mcp-servers'],
    queryFn: () => mcpApi.getServers(),
  });
};

export const useAddMcpServerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (server: Omit<McpServer, 'id'>) => mcpApi.addServer(server),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers'] });
    },
  });
};

export const useUpdateMcpServerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, server }: { id: string; server: Partial<McpServer> }) =>
      mcpApi.updateServer(id, server),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers'] });
    },
  });
};

export const useDeleteMcpServerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mcpApi.deleteServer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers'] });
    },
  });
};

export const useSettingsQuery = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getSettings(),
  });
};

export const useUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Partial<Settings>) => settingsApi.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};
