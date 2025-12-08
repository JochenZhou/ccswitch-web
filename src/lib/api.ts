import type { AppId, Provider, McpServer, Settings } from '@/types';

const STORAGE_KEY = 'ccswitch-data';

const loadStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  
  return {
    claude: {
      providers: {
        'claude-1': {
          id: 'claude-1',
          name: 'Claude Official',
          websiteUrl: 'https://claude.ai',
          settingsConfig: { env: {} },
          category: 'official',
          createdAt: Date.now(),
        },
      } as Record<string, Provider>,
      current: 'claude-1',
    },
    codex: {
      providers: {} as Record<string, Provider>,
      current: '',
    },
    gemini: {
      providers: {} as Record<string, Provider>,
      current: '',
    },
    mcp: {
      servers: {} as Record<string, McpServer>,
    },
    prompts: {
      claude: {} as Record<string, any>,
      codex: {} as Record<string, any>,
      gemini: {} as Record<string, any>,
    },
    settings: {
      language: 'zh',
      theme: 'system',
      autoSync: false,
    } as Settings,
  };
};

const saveStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (e) {}
};

const storage = loadStorage();

export const providersApi = {
  getProviders: async (app: AppId) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return storage[app].providers;
  },

  getCurrentProvider: async (app: AppId) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return storage[app].current;
  },

  addProvider: async (app: AppId, provider: Omit<Provider, 'id'>) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const id = `${app}-${Date.now()}`;
    const newProvider = { ...provider, id, createdAt: Date.now() };
    storage[app].providers[id] = newProvider;
    saveStorage();
    return true;
  },

  updateProvider: async (app: AppId, id: string, provider: Partial<Provider>) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (storage[app].providers[id]) {
      storage[app].providers[id] = { ...storage[app].providers[id], ...provider };
      saveStorage();
      return true;
    }
    return false;
  },

  deleteProvider: async (app: AppId, id: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    delete storage[app].providers[id];
    if (storage[app].current === id) {
      storage[app].current = '';
    }
    saveStorage();
    return true;
  },

  switchProvider: async (app: AppId, id: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    storage[app].current = id;
    saveStorage();
    return true;
  },

  sortProviders: async (_app: AppId, _ids: string[]) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  },
};

export const mcpApi = {
  getServers: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return storage.mcp.servers;
  },

  addServer: async (server: Omit<McpServer, 'id'>) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const id = `mcp-${Date.now()}`;
    storage.mcp.servers[id] = { ...server, id };
    saveStorage();
    return true;
  },

  updateServer: async (id: string, server: Partial<McpServer>) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (storage.mcp.servers[id]) {
      storage.mcp.servers[id] = { ...storage.mcp.servers[id], ...server };
      saveStorage();
      return true;
    }
    return false;
  },

  deleteServer: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    delete storage.mcp.servers[id];
    saveStorage();
    return true;
  },
};

export const settingsApi = {
  getSettings: async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return storage.settings;
  },

  updateSettings: async (settings: Partial<Settings>) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    storage.settings = { ...storage.settings, ...settings };
    saveStorage();
    return true;
  },

  exportConfig: async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return JSON.stringify(storage, null, 2);
  },

  importConfig: async (config: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const parsed = JSON.parse(config);
    Object.assign(storage, parsed);
    saveStorage();
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

  importFromSql: async (sqlContent: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // 清空现有数据
      storage.claude.providers = {};
      storage.claude.current = '';
      storage.codex.providers = {};
      storage.codex.current = '';
      storage.gemini.providers = {};
      storage.gemini.current = '';
      storage.mcp.servers = {};
      if (!storage.prompts) {
        storage.prompts = { claude: {}, codex: {}, gemini: {} };
      } else {
        storage.prompts.claude = {};
        storage.prompts.codex = {};
        storage.prompts.gemini = {};
      }
      
      // 解析 SQL INSERT 语句 - 正确处理嵌套引号和逗号
      const parseInserts = (sql: string, tableName: string) => {
        const regex = new RegExp(`INSERT INTO "${tableName}" \\(([^)]+)\\) VALUES \\(`, 'g');
        const results: Record<string, string>[] = [];
        let match;
        
        while ((match = regex.exec(sql)) !== null) {
          const columns = match[1].split(',').map(c => c.trim().replace(/"/g, ''));
          const startPos = match.index + match[0].length;
          
          // 从 VALUES ( 后面开始解析到 );
          let pos = startPos;
          let inQuote = false;
          let depth = 0;
          let escaped = false;
          
          while (pos < sql.length) {
            const char = sql[pos];
            
            if (escaped) {
              escaped = false;
            } else if (char === '\\') {
              escaped = true;
            } else if (char === "'") {
              inQuote = !inQuote;
            } else if (!inQuote) {
              if (char === '(') depth++;
              else if (char === ')') {
                depth--;
                if (depth < 0) break;
              }
            }
            pos++;
          }
          
          const valuesStr = sql.substring(startPos, pos);
          const values: string[] = [];
          let current = '';
          inQuote = false;
          depth = 0;
          escaped = false;
          
          for (let i = 0; i < valuesStr.length; i++) {
            const char = valuesStr[i];
            
            if (escaped) {
              current += char;
              escaped = false;
            } else if (char === '\\') {
              escaped = true;
              current += char;
            } else if (char === "'") {
              inQuote = !inQuote;
              current += char;
            } else if (inQuote) {
              current += char;
            } else {
              if (char === '(') depth++;
              else if (char === ')') depth--;
              
              if (char === ',' && depth === 0) {
                values.push(current.trim().replace(/^'|'$/g, ''));
                current = '';
              } else {
                current += char;
              }
            }
          }
          if (current.trim()) values.push(current.trim().replace(/^'|'$/g, ''));
          
          const row: Record<string, string> = {};
          columns.forEach((col, idx) => {
            row[col] = values[idx] || '';
          });
          results.push(row);
        }
        return results;
      };

      // 导入 providers
      const providerRows = parseInserts(sqlContent, 'providers');
      console.log('Importing providers:', providerRows.length);
      for (const row of providerRows) {
        const app = row.app_type as AppId;
        if (!app || !row.id) continue;
        try {
          const config = JSON.parse(row.settings_config || '{}');
          storage[app].providers[row.id] = {
            id: row.id,
            name: row.name,
            websiteUrl: row.website_url !== 'NULL' ? row.website_url : undefined,
            settingsConfig: config,
            category: row.category || 'custom',
            createdAt: row.created_at ? parseInt(row.created_at) : Date.now(),
          };
          if (row.is_current === '1') {
            storage[app].current = row.id;
          }
        } catch (e) {
          console.error('Failed to parse provider:', row.id, e);
        }
      }

      // 导入 MCP servers
      const mcpRows = parseInserts(sqlContent, 'mcp_servers');
      console.log('Importing MCP servers:', mcpRows.length);
      for (const row of mcpRows) {
        if (!row.id) continue;
        try {
          const server = JSON.parse(row.server_config || '{}');
          const tagsList = JSON.parse(row.tags || '[]');
          storage.mcp.servers[row.id] = {
            id: row.id,
            name: row.name,
            server,
            apps: {
              claude: row.enabled_claude === '1',
              codex: row.enabled_codex === '1',
              gemini: row.enabled_gemini === '1',
            },
            description: row.description !== 'NULL' ? row.description : undefined,
            homepage: row.homepage !== 'NULL' ? row.homepage : undefined,
            docs: row.docs !== 'NULL' ? row.docs : undefined,
            tags: tagsList,
          };
        } catch (e) {
          console.error('Failed to parse MCP server:', row.id, e);
        }
      }

      // 导入 prompts
      const promptRows = parseInserts(sqlContent, 'prompts');
      console.log('Importing prompts:', promptRows.length);
      for (const row of promptRows) {
        const app = row.app_type as AppId;
        if (!app || !row.id) continue;
        try {
          storage.prompts[app][row.id] = {
            id: row.id,
            name: row.name,
            content: row.content,
            description: row.description !== 'NULL' ? row.description : undefined,
            enabled: row.enabled === '1',
            createdAt: row.created_at ? parseInt(row.created_at) : Date.now(),
            updatedAt: row.updated_at ? parseInt(row.updated_at) : Date.now(),
          };
        } catch (e) {
          console.error('Failed to parse prompt:', row.id, e);
        }
      }

      saveStorage();
      console.log('Import completed successfully');
      return { providers: providerRows.length, mcpServers: mcpRows.length, prompts: promptRows.length };
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  },
};
