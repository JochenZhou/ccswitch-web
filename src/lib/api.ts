import type { AppId, Provider, McpServer, Settings } from '@/types';

const API_URL = '';

export const providersApi = {
  getProviders: async (app: AppId) => {
    const response = await fetch(`${API_URL}/api/providers/${app}`);
    if (!response.ok) throw new Error('Failed to fetch providers');
    return await response.json();
  },

  getCurrentProvider: async (app: AppId) => {
    const response = await fetch(`${API_URL}/api/providers/${app}/current`);
    if (!response.ok) throw new Error('Failed to fetch current provider');
    const data = await response.json();
    return data.current;
  },

  addProvider: async (app: AppId, provider: Omit<Provider, 'id'>) => {
    const response = await fetch(`${API_URL}/api/providers/${app}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    });
    if (!response.ok) throw new Error('Failed to add provider');
    return true;
  },

  updateProvider: async (app: AppId, id: string, provider: Partial<Provider>) => {
    const response = await fetch(`${API_URL}/api/providers/${app}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    });
    if (!response.ok) throw new Error('Failed to update provider');
    return true;
  },

  deleteProvider: async (app: AppId, id: string) => {
    const response = await fetch(`${API_URL}/api/providers/${app}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete provider');
    return true;
  },

  switchProvider: async (app: AppId, id: string) => {
    const response = await fetch(`${API_URL}/api/providers/${app}/switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) throw new Error('Failed to switch provider');
    return true;
  },

  sortProviders: async (_app: AppId, _ids: string[]) => {
    return true;
  },
};

export const mcpApi = {
  getServers: async () => {
    const response = await fetch(`${API_URL}/api/mcp/servers`);
    if (!response.ok) throw new Error('Failed to fetch MCP servers');
    return await response.json();
  },

  addServer: async (server: Omit<McpServer, 'id'>) => {
    const response = await fetch(`${API_URL}/api/mcp/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ server }),
    });
    if (!response.ok) throw new Error('Failed to add MCP server');
    return true;
  },

  updateServer: async (id: string, server: Partial<McpServer>) => {
    const response = await fetch(`${API_URL}/api/mcp/servers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ server }),
    });
    if (!response.ok) throw new Error('Failed to update MCP server');
    return true;
  },

  deleteServer: async (id: string) => {
    const response = await fetch(`${API_URL}/api/mcp/servers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete MCP server');
    return true;
  },
};

export const settingsApi = {
  getSettings: async () => {
    const response = await fetch(`${API_URL}/api/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return await response.json();
  },

  updateSettings: async (settings: Partial<Settings>) => {
    const response = await fetch(`${API_URL}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return true;
  },

  exportConfig: async () => {
    const response = await fetch(`${API_URL}/api/config/export`);
    if (!response.ok) throw new Error('Failed to export config');
    const data = await response.json();
    return JSON.stringify(data, null, 2);
  },

  importConfig: async (config: string) => {
    const parsed = JSON.parse(config);
    const response = await fetch(`${API_URL}/api/config/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: parsed }),
    });
    if (!response.ok) throw new Error('Failed to import config');
    return true;
  },

  previewSqlImport: async (sqlContent: string) => {
    const countInserts = (sql: string, tableName: string) => {
      const regex = new RegExp(`INSERT INTO "${tableName}"`, 'g');
      return (sql.match(regex) || []).length;
    };

    return {
      providers: countInserts(sqlContent, 'providers'),
      mcpServers: countInserts(sqlContent, 'mcp_servers'),
      prompts: countInserts(sqlContent, 'prompts'),
    };
  },

  importFromSql: async (sqlContent: string): Promise<{ providers: number; mcpServers: number; prompts: number }> => {
    const response = await fetch(`${API_URL}/api/config/import-sql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sqlContent }),
    });
    if (!response.ok) throw new Error('Failed to import SQL');
    const result = await response.json();
    return result.counts;
  },
};
