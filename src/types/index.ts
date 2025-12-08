export type AppId = 'claude' | 'codex' | 'gemini';

export interface Provider {
  id: string;
  name: string;
  websiteUrl?: string;
  notes?: string;
  settingsConfig: Record<string, any>;
  category?: string;
  meta?: ProviderMeta;
  icon?: string;
  iconColor?: string;
  createdAt?: number;
}

export interface ProviderMeta {
  custom_endpoints?: CustomEndpoint[];
  partner_promotion_key?: string;
}

export interface CustomEndpoint {
  url: string;
  addedAt: number;
  lastUsed?: number;
}

export interface McpServer {
  id: string;
  name: string;
  enabled: boolean;
  apps: {
    claude: boolean;
    codex: boolean;
    gemini: boolean;
  };
  server: {
    type: 'stdio' | 'http';
    command?: string;
    args?: string[];
    url?: string;
  };
  description?: string;
  homepage?: string;
  docs?: string;
  tags?: string[];
}

export interface AppConfig {
  providers: Record<string, Provider>;
  current: string;
}

export interface Settings {
  language: string;
  theme: string;
  autoSync: boolean;
}
