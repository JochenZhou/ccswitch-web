import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import TOML from '@iarna/toml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const CLAUDE_SETTINGS_PATH = path.join(process.env.HOME || '/root', '.claude', 'settings.json');
const CODEX_AUTH_PATH = path.join(process.env.HOME || '/root', '.codex', 'auth.json');
const CODEX_CONFIG_PATH = path.join(process.env.HOME || '/root', '.codex', 'config.toml');
const DATA_DIR = path.join(process.env.DATA_DIR || '/app/data');
const DATA_FILE = path.join(DATA_DIR, 'ccswitch-data.json');

// 读取 Claude 设置
async function readClaudeSettings() {
  try {
    const data = await fs.readFile(CLAUDE_SETTINGS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// 写入 Claude 设置
async function writeClaudeSettings(settings) {
  const dir = path.dirname(CLAUDE_SETTINGS_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(CLAUDE_SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

// 读取 Codex 设置
async function readCodexAuth() {
  try {
    const data = await fs.readFile(CODEX_AUTH_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// 写入 Codex 设置
async function writeCodexAuth(auth) {
  const dir = path.dirname(CODEX_AUTH_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(CODEX_AUTH_PATH, JSON.stringify(auth, null, 2));
}

// 读取 Codex config.toml
async function readCodexConfig() {
  try {
    const data = await fs.readFile(CODEX_CONFIG_PATH, 'utf-8');
    return TOML.parse(data);
  } catch (error) {
    return {};
  }
}

// 写入 Codex config.toml
async function writeCodexConfig(config) {
  const dir = path.dirname(CODEX_CONFIG_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(CODEX_CONFIG_PATH, TOML.stringify(config));
}

// 读取数据文件
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {
      claude: { providers: {}, current: '' },
      codex: { providers: {}, current: '' },
      gemini: { providers: {}, current: '' },
      mcp: { servers: {} },
      prompts: { claude: {}, codex: {}, gemini: {} },
      settings: { language: 'zh', theme: 'system', autoSync: false }
    };
  }
}

// 写入数据文件
async function writeData(data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// 切换供应商
app.post('/api/claude/switch-provider', async (req, res) => {
  try {
    const { provider } = req.body;
    const settings = await readClaudeSettings();

    // 确保 env 对象存在
    if (!settings.env) {
      settings.env = {};
    }

    // 从 provider.settingsConfig.env 读取配置
    const providerEnv = provider.settingsConfig?.env || {};

    // 更新 Claude 设置
    if (providerEnv.ANTHROPIC_AUTH_TOKEN) {
      settings.env.ANTHROPIC_AUTH_TOKEN = providerEnv.ANTHROPIC_AUTH_TOKEN;
    }
    if (providerEnv.ANTHROPIC_BASE_URL) {
      settings.env.ANTHROPIC_BASE_URL = providerEnv.ANTHROPIC_BASE_URL;
    }
    if (providerEnv.ANTHROPIC_MODEL) {
      settings.env.ANTHROPIC_MODEL = providerEnv.ANTHROPIC_MODEL;
    }
    if (providerEnv.ANTHROPIC_DEFAULT_HAIKU_MODEL) {
      settings.env.ANTHROPIC_DEFAULT_HAIKU_MODEL = providerEnv.ANTHROPIC_DEFAULT_HAIKU_MODEL;
    }
    if (providerEnv.ANTHROPIC_DEFAULT_OPUS_MODEL) {
      settings.env.ANTHROPIC_DEFAULT_OPUS_MODEL = providerEnv.ANTHROPIC_DEFAULT_OPUS_MODEL;
    }
    if (providerEnv.ANTHROPIC_DEFAULT_SONNET_MODEL) {
      settings.env.ANTHROPIC_DEFAULT_SONNET_MODEL = providerEnv.ANTHROPIC_DEFAULT_SONNET_MODEL;
    }

    await writeClaudeSettings(settings);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取当前 Claude 设置
app.get('/api/claude/settings', async (req, res) => {
  try {
    const settings = await readClaudeSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 切换 Codex 供应商
app.post('/api/codex/switch-provider', async (req, res) => {
  try {
    const { provider } = req.body;
    const auth = await readCodexAuth();
    const config = await readCodexConfig();

    const providerConfig = provider.settingsConfig || {};

    // 更新 auth.json
    if (providerConfig.auth) {
      Object.assign(auth, providerConfig.auth);
    }

    // 更新 config.toml
    if (providerConfig.config) {
      const newConfig = TOML.parse(providerConfig.config);
      Object.assign(config, newConfig);
    }

    await writeCodexConfig(config);
    await writeCodexAuth(auth);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取当前 Codex 设置
app.get('/api/codex/auth', async (req, res) => {
  try {
    const auth = await readCodexAuth();
    res.json(auth);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取所有供应商
app.get('/api/providers/:app', async (req, res) => {
  try {
    const data = await readData();
    res.json(data[req.params.app]?.providers || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取当前供应商
app.get('/api/providers/:app/current', async (req, res) => {
  try {
    const data = await readData();
    res.json({ current: data[req.params.app]?.current || '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 添加供应商
app.post('/api/providers/:app', async (req, res) => {
  try {
    const data = await readData();
    const { provider } = req.body;
    const id = `${req.params.app}-${Date.now()}`;
    data[req.params.app].providers[id] = { ...provider, id, createdAt: Date.now() };
    await writeData(data);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新供应商
app.put('/api/providers/:app/:id', async (req, res) => {
  try {
    const data = await readData();
    const { provider } = req.body;
    if (data[req.params.app].providers[req.params.id]) {
      data[req.params.app].providers[req.params.id] = { ...data[req.params.app].providers[req.params.id], ...provider };
      await writeData(data);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Provider not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除供应商
app.delete('/api/providers/:app/:id', async (req, res) => {
  try {
    const data = await readData();
    delete data[req.params.app].providers[req.params.id];
    if (data[req.params.app].current === req.params.id) {
      data[req.params.app].current = '';
    }
    await writeData(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 切换供应商（更新版本）
app.post('/api/providers/:app/switch', async (req, res) => {
  try {
    const data = await readData();
    const { id } = req.body;
    data[req.params.app].current = id;
    await writeData(data);

    const app = req.params.app;
    if (app === 'claude' || app === 'codex') {
      const provider = data[app].providers[id];
      if (app === 'claude') {
        const settings = await readClaudeSettings();
        if (!settings.env) settings.env = {};
        const providerEnv = provider.settingsConfig?.env || {};
        if (providerEnv.ANTHROPIC_AUTH_TOKEN) settings.env.ANTHROPIC_AUTH_TOKEN = providerEnv.ANTHROPIC_AUTH_TOKEN;
        if (providerEnv.ANTHROPIC_BASE_URL) settings.env.ANTHROPIC_BASE_URL = providerEnv.ANTHROPIC_BASE_URL;
        if (providerEnv.ANTHROPIC_MODEL) settings.env.ANTHROPIC_MODEL = providerEnv.ANTHROPIC_MODEL;
        if (providerEnv.ANTHROPIC_DEFAULT_HAIKU_MODEL) settings.env.ANTHROPIC_DEFAULT_HAIKU_MODEL = providerEnv.ANTHROPIC_DEFAULT_HAIKU_MODEL;
        if (providerEnv.ANTHROPIC_DEFAULT_OPUS_MODEL) settings.env.ANTHROPIC_DEFAULT_OPUS_MODEL = providerEnv.ANTHROPIC_DEFAULT_OPUS_MODEL;
        if (providerEnv.ANTHROPIC_DEFAULT_SONNET_MODEL) settings.env.ANTHROPIC_DEFAULT_SONNET_MODEL = providerEnv.ANTHROPIC_DEFAULT_SONNET_MODEL;
        await writeClaudeSettings(settings);
      } else if (app === 'codex') {
        const auth = await readCodexAuth();
        const config = await readCodexConfig();
        const providerConfig = provider.settingsConfig || {};
        if (providerConfig.auth) Object.assign(auth, providerConfig.auth);
        if (providerConfig.config) {
          const newConfig = TOML.parse(providerConfig.config);
          Object.assign(config, newConfig);
        }
        await writeCodexConfig(config);
        await writeCodexAuth(auth);
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MCP 服务器管理
app.get('/api/mcp/servers', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.mcp?.servers || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/mcp/servers', async (req, res) => {
  try {
    const data = await readData();
    const { server } = req.body;
    const id = `mcp-${Date.now()}`;
    data.mcp.servers[id] = { ...server, id };
    await writeData(data);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/mcp/servers/:id', async (req, res) => {
  try {
    const data = await readData();
    const { server } = req.body;
    if (data.mcp.servers[req.params.id]) {
      data.mcp.servers[req.params.id] = { ...data.mcp.servers[req.params.id], ...server };
      await writeData(data);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Server not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/mcp/servers/:id', async (req, res) => {
  try {
    const data = await readData();
    delete data.mcp.servers[req.params.id];
    await writeData(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 设置管理
app.get('/api/settings', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.settings || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const data = await readData();
    data.settings = { ...data.settings, ...req.body.settings };
    await writeData(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 配置导入导出
app.get('/api/config/export', async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/config/import', async (req, res) => {
  try {
    await writeData(req.body.config);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/config/import-sql', async (req, res) => {
  try {
    const { sqlContent } = req.body;
    const data = await readData();

    // 全覆盖模式：清空现有数据
    data.claude = { providers: {}, current: '' };
    data.codex = { providers: {}, current: '' };
    data.gemini = { providers: {}, current: '' };
    data.mcp = { servers: {} };

    const parseInserts = (sql, tableName) => {
      const patterns = [
        new RegExp(`INSERT INTO ["'\`]?${tableName}["'\`]? \\([^)]+\\) VALUES \\(([^;]+)\\);`, 'gi'),
        new RegExp(`INSERT INTO ["'\`]?${tableName}["'\`]?\\([^)]+\\) VALUES \\(([^;]+)\\);`, 'gi')
      ];
      let matches = [];
      for (const regex of patterns) {
        matches = [...sql.matchAll(regex)];
        if (matches.length > 0) break;
      }
      return matches.map(m => m[1]);
    };

    const parseValue = (val) => {
      val = val.trim();
      if (val === 'NULL') return null;
      if (val === '0' || val === '1') return val === '1';
      if (val.startsWith("'") && val.endsWith("'")) return val.slice(1, -1).replace(/''/g, "'");
      return val;
    };

    const splitValues = (str) => {
      const values = [];
      let current = '';
      let inQuote = false;
      let quoteChar = null;

      for (let i = 0; i < str.length; i++) {
        const char = str[i];

        if (!inQuote && (char === "'" || char === '"')) {
          inQuote = true;
          quoteChar = char;
          current += char;
        } else if (inQuote && char === quoteChar) {
          if (str[i + 1] === quoteChar) {
            current += char + char;
            i++;
          } else {
            inQuote = false;
            quoteChar = null;
            current += char;
          }
        } else if (!inQuote && char === ',') {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }

      if (current) values.push(current.trim());
      return values;
    };

    let counts = { providers: 0, mcpServers: 0, prompts: 0 };

    // 导入 providers
    const providerInserts = parseInserts(sqlContent, 'providers');
    providerInserts.forEach(insert => {
      const values = splitValues(insert).map(parseValue);
      const [id, appType, name, settingsConfig] = values;
      const providerId = `${appType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      if (!data[appType]) data[appType] = { providers: {}, current: '' };
      data[appType].providers[providerId] = { id: providerId, name, settingsConfig: JSON.parse(settingsConfig) };
      counts.providers++;
    });

    // 导入 mcp_servers
    const mcpInserts = parseInserts(sqlContent, 'mcp_servers');
    mcpInserts.forEach(insert => {
      const values = splitValues(insert).map(parseValue);
      const [id, name, serverConfig] = values;
      const mcpId = `mcp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const config = JSON.parse(serverConfig);
      data.mcp.servers[mcpId] = {
        id: mcpId,
        name,
        enabled: config.enabled !== false,
        apps: config.apps || { claude: false, codex: false, gemini: false },
        server: config.server || { type: 'stdio', command: '', args: [] },
        ...config
      };
      counts.mcpServers++;
    });

    await writeData(data);
    res.json({ success: true, counts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
