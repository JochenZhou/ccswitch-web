import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, Database, ArrowLeft } from 'lucide-react';
import { useSettingsQuery, useUpdateSettingsMutation } from '@/lib/queries';
import { settingsApi } from '@/lib/api';
import { toast } from 'sonner';

export function SettingsPanel({ onBack }: { onBack?: () => void }) {
  const { t } = useTranslation();
  const { data: settings } = useSettingsQuery();
  const updateMutation = useUpdateSettingsMutation();

  const handleExport = async () => {
    try {
      const config = await settingsApi.exportConfig();
      const blob = new Blob([config], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ccswitch-config-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t('toast.success'));
    } catch (error) {
      toast.error(t('toast.error'));
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        await settingsApi.importConfig(text);
        toast.success(t('toast.success'));
        window.location.reload();
      } catch (error) {
        toast.error(t('toast.error'));
      }
    };
    input.click();
  };

  const handleImportSql = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.sql';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const preview = await settingsApi.previewSqlImport(text);
        
        if (!confirm(
          `即将导入以下数据（全覆盖）：\n\n` +
          `供应商: ${preview.providers} 个\n` +
          `MCP 服务器: ${preview.mcpServers} 个\n` +
          `提示词: ${preview.prompts} 个\n\n` +
          `当前数据将被完全覆盖，是否继续？`
        )) {
          return;
        }
        
        const result = await settingsApi.importFromSql(text);
        toast.success(`导入成功！供应商: ${result.providers} 个，MCP 服务器: ${result.mcpServers} 个，提示词: ${result.prompts} 个`, {
          duration: 5000,
        });
        if (onBack) {
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      } catch (error) {
        console.error('Import error:', error);
        toast.error('导入失败: ' + (error instanceof Error ? error.message : String(error)), {
          duration: 10000,
        });
      }
    };
    input.click();
  };

  const handleLanguageChange = async (lang: string) => {
    try {
      await updateMutation.mutateAsync({ language: lang });
      toast.success(t('toast.success'));
    } catch (error) {
      toast.error(t('toast.error'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h2 className="text-2xl font-bold">{t('settings.title')}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.language')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={settings?.language === 'zh' ? 'default' : 'outline'}
              onClick={() => handleLanguageChange('zh')}
            >
              中文
            </Button>
            <Button
              variant={settings?.language === 'en' ? 'default' : 'outline'}
              onClick={() => handleLanguageChange('en')}
            >
              English
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>配置管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleExport} className="justify-center sm:justify-start">
              <Download className="h-4 w-4 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">{t('settings.exportConfig')}</span>
            </Button>
            <Button onClick={handleImport} variant="outline" className="justify-center sm:justify-start">
              <Upload className="h-4 w-4 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">{t('settings.importConfig')}</span>
            </Button>
            <Button onClick={handleImportSql} variant="outline" className="justify-center sm:justify-start">
              <Database className="h-4 w-4 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">导入 SQL 备份</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
