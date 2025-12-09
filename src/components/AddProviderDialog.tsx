import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Provider, AppId } from '@/types';
import { ArrowLeft, Lightbulb } from 'lucide-react';


interface AddProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appId: AppId;
  onSubmit: (provider: Omit<Provider, 'id'>) => void;
}

export function AddProviderDialog({ open, onOpenChange, appId, onSubmit }: AddProviderDialogProps) {
  const { t } = useTranslation();

  // Common State
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  // Provider Specific State
  const [model, setModel] = useState(''); // Main model

  // Claude Specific
  const [haikuModel, setHaikuModel] = useState('');
  const [sonnetModel, setSonnetModel] = useState('');
  const [opusModel, setOpusModel] = useState('');

  // Config Editors
  const [envConfig, setEnvConfig] = useState('');
  const [jsonConfig, setJsonConfig] = useState('');
  const [tomlConfig, setTomlConfig] = useState('');

  const [writeToCommon, setWriteToCommon] = useState(false);

  // Initialize/Reset based on appId
  useEffect(() => {
    if (open) {
      setName('');
      setNotes('');
      setWebsiteUrl('');
      setApiKey('');
      setBaseUrl('');
      setModel('');
      setHaikuModel('');
      setSonnetModel('');
      setOpusModel('');
      setEnvConfig('');
      setJsonConfig('{\n  \n}');
      setTomlConfig('');
      setWriteToCommon(false);

      // Defaults based on AppId
      if (appId === 'claude') {
        setBaseUrl('');
      } else if (appId === 'codex') {
        setModel('gpt-5-codex');
        setJsonConfig('{\n  "OPENAI_API_KEY": ""\n}');
      } else if (appId === 'gemini') {
        setModel('gemini-3-pro-preview');
        setEnvConfig('GOOGLE_GEMINI_BASE_URL=https://your-api-endpoint.com/\nGEMINI_API_KEY=sk-your-api-key-here\nGEMINI_MODEL=gemini-3-pro-preview');
        setJsonConfig('{\n  \n}');
      }
    }
  }, [open, appId]);

  // Dynamic Content Generation (Simple version)
  useEffect(() => {
    if (appId === 'gemini') {
      setEnvConfig(
        `GOOGLE_GEMINI_BASE_URL=${baseUrl || 'https://your-api-endpoint.com/'}
GEMINI_API_KEY=${apiKey || 'sk-your-api-key-here'}
GEMINI_MODEL=${model || 'gemini-3-pro-preview'}`
      );

    } else if (appId === 'codex') {
      setJsonConfig(
        `{
  "OPENAI_API_KEY": "${apiKey}"
}`
      );
    } else if (appId === 'claude') {
      setJsonConfig(
        `{
  "apiKey": "${apiKey}"
}`
      );
    }
  }, [apiKey, baseUrl, model, appId]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Construct final config object loosely based on inputs
    // This is a simplification. Real app would parse the textareas.
    const config: any = {
      env: {},
      rawEnv: envConfig,
      rawJson: jsonConfig,
      rawToml: tomlConfig,
      writeToCommon,
      baseUrl: baseUrl.trim(),
      model: model.trim(),
    };

    // Add Claude-specific models
    if (appId === 'claude') {
      config.haikuModel = haikuModel.trim();
      config.sonnetModel = sonnetModel.trim();
      config.opusModel = opusModel.trim();
    }

    // ... Parsing logic could go here if we wanted to be strict ...

    onSubmit({
      name: name.trim(),
      websiteUrl: websiteUrl.trim(),
      notes: notes.trim(),
      category: 'third_party',
      settingsConfig: config,
      createdAt: Date.now(),
    });
    onOpenChange(false);
  };

  const getProviderTitle = () => {
    switch (appId) {
      case 'claude': return '添加 Claude Code 供应商';
      case 'codex': return '添加 Codex 供应商';
      case 'gemini': return '添加 Gemini 供应商';
      default: return '添加供应商';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-[#F8F9FA]">
        {/* Helper Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-bold">{getProviderTitle()}</h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
            <Lightbulb className="h-4 w-4 mt-0.5 shrink-0" />
            <span>自定义配置需手动填写所有必要字段</span>
          </div>

          {/* Avatar Placeholder - Centered */}
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl font-bold text-slate-500 shadow-inner">
              P
            </div>
          </div>

          <form id="add-provider-form" onSubmit={handleSubmit} className="space-y-6">

            {/* Row 1: Name & Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">供应商名称</label>
                <Input
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="例如: Claude 官方" className="bg-white" required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">备注</label>
                <Input
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="例如: 公司专用账号" className="bg-white"
                />
              </div>
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">官网链接</label>
              <Input
                value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)}
                placeholder="https://" className="bg-white"
              />
            </div>

            {/* API Key */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">API Key</label>
              <Input
                value={apiKey} onChange={e => setApiKey(e.target.value)}
                placeholder="只需要填这里，下方配置会自动填充" className="bg-white" type="password"
              />
            </div>

            {/* Request URL */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-700">
                  {appId === 'codex' ? 'API 请求地址' : '请求地址'}
                </label>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  ⚡ 管理与测速
                </span>
              </div>
              <Input
                value={baseUrl} onChange={e => setBaseUrl(e.target.value)}
                placeholder={
                  appId === 'codex' ? "https://your-api-endpoint.com/v1" :
                    "https://your-api-endpoint.com"
                }
                className="bg-white"
              />
            </div>

            {/* Codex Specific Alert */}
            {appId === 'codex' && (
              <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm border border-amber-100">
                <Lightbulb className="h-4 w-4 mt-0.5 shrink-0" />
                <span>填写兼容 OpenAI Response 格式的服务端点地址</span>
              </div>
            )}
            {/* Claude Specific Alert */}
            {appId === 'claude' && (
              <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm border border-amber-100">
                <Lightbulb className="h-4 w-4 mt-0.5 shrink-0" />
                <span>填写兼容 Claude API 的服务端点地址，不要以斜杠结尾</span>
              </div>
            )}


            {/* Model Input(s) */}
            {appId === 'claude' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">主模型</label>
                  <Input value={model} onChange={e => setModel(e.target.value)} className="bg-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Haiku 默认模型</label>
                  <Input value={haikuModel} onChange={e => setHaikuModel(e.target.value)} className="bg-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Sonnet 默认模型</label>
                  <Input value={sonnetModel} onChange={e => setSonnetModel(e.target.value)} className="bg-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Opus 默认模型</label>
                  <Input value={opusModel} onChange={e => setOpusModel(e.target.value)} className="bg-white" />
                </div>
                <p className="col-span-2 text-xs text-slate-400 mt-1">可选: 指定默认使用的 Claude 模型，留空则使用系统默认。</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  {appId === 'codex' ? '模型名称' : '模型'}
                </label>
                <Input
                  value={model} onChange={e => setModel(e.target.value)}
                  placeholder={appId === 'codex' ? 'gpt-5-codex' : 'gemini-3-pro-preview'}
                  className="bg-white"
                />
                {appId === 'codex' && <p className="text-xs text-slate-400 mt-1">指定该用的模型，将自动更新到 config.toml 中</p>}
              </div>
            )}

            {/* ENV / JSON Editors */}
            {appId === 'gemini' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">环境变量 (.env)</label>
                <Textarea
                  value={envConfig}
                  onChange={e => setEnvConfig(e.target.value)}
                  className="font-mono text-sm bg-slate-50 border-slate-200 min-h-[100px]"
                />
                <p className="text-xs text-slate-400 mt-1">使用 .env 格式配置 Gemini 环境变量</p>
              </div>
            )}

            {appId === 'codex' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">auth.json (JSON) *</label>
                  <Textarea
                    value={jsonConfig}
                    onChange={e => setJsonConfig(e.target.value)}
                    className="font-mono text-sm bg-slate-50 border-slate-200 min-h-[80px]"
                  />
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                    <span className="h-3 w-3"><i className="lucide-wand-2"></i></span> 格式化
                    <span className="ml-2">Codex auth.json 配置内容</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">config.toml (TOML)</label>
                  <Textarea
                    value={tomlConfig}
                    onChange={e => setTomlConfig(e.target.value)}
                    className="font-mono text-sm bg-slate-50 border-slate-200 min-h-[80px]"
                  />
                </div>
              </>
            )}

            {(appId === 'gemini' || appId === 'claude') && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  {appId === 'gemini' ? '配置文件 (config.json)' : '配置 JSON'}
                </label>
                <Textarea
                  value={jsonConfig}
                  onChange={e => setJsonConfig(e.target.value)}
                  className="font-mono text-sm bg-slate-50 border-slate-200 min-h-[80px]"
                />
              </div>
            )}

          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2">
            {/* Checkbox Placeholder since we might not have the component installed in 'ui' yet, using native for safety */}
            <input
              type="checkbox"
              id="write-common"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={writeToCommon}
              onChange={e => setWriteToCommon(e.target.checked)}
            />
            <label htmlFor="write-common" className="text-sm font-medium text-slate-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              写入通用配置
            </label>
            <a href="#" className="text-sm text-blue-500 hover:underline ml-2">编辑通用配置</a>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel') || '取消'}
            </Button>
            <Button type="submit" form="add-provider-form" className="bg-blue-500 hover:bg-blue-600 text-white gap-1">
              <span className="text-lg leading-none">+</span> {t('common.add') || '添加'}
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
