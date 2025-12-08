import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';

import { useUpdateMcpServerMutation } from '@/lib/queries';
import { toast } from 'sonner';
import type { McpServer } from '@/types';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditMcpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server: McpServer | null;
}

export function EditMcpDialog({ open, onOpenChange, server }: EditMcpDialogProps) {
  const { t } = useTranslation();
  const updateMutation = useUpdateMcpServerMutation();

  const [type, setType] = useState<'stdio' | 'http'>('stdio');
  const [name, setName] = useState('');
  const [command, setCommand] = useState('');
  const [args, setArgs] = useState('');
  const [url, setUrl] = useState('');
  const [env, setEnv] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load server data when opening
  useEffect(() => {
    if (open && server) {
      setType(server.server.type);
      setName(server.name || '');

      if (server.server.type === 'stdio') {
        setCommand(server.server.command || '');
        setArgs(server.server.args?.join('\n') || '');
        setEnv('');
      } else {
        setUrl(server.server.url || '');
      }

      // Clear errors when opening
      setErrors({});
    }
  }, [open, server]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = '服务器名称不能为空';
    }

    if (type === 'stdio' && !command.trim()) {
      newErrors.command = '命令不能为空';
    }

    if (type === 'http' && !url.trim()) {
      newErrors.url = 'URL不能为空';
    }

    if (type === 'http' && url && !isValidUrl(url)) {
      newErrors.url = '请输入有效的URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !server) return;

    const updatedServer: any = { type };

    if (type === 'stdio') {
      updatedServer.command = command.trim();
      if (args.trim()) {
        updatedServer.args = args.split('\n').map(a => a.trim()).filter(Boolean);
      }
      if (env.trim()) {
        updatedServer.env = Object.fromEntries(
          env.split('\n').map(line => {
            const [k, v] = line.split('=');
            return [k?.trim(), v?.trim()];
          }).filter(([k]) => k)
        );
      }
    } else {
      updatedServer.url = url.trim();
    }

    try {
      await updateMutation.mutateAsync({
        id: server.id,
        server: updatedServer,
      });
      toast.success(t('toast.success'));
      onOpenChange(false);
    } catch (error) {
      toast.error(t('toast.error'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle>编辑 MCP 服务器</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg text-sm">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>修改 MCP 服务器配置信息，保存后立即生效</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">类型</label>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as 'stdio' | 'http')}
                disabled // Type shouldn't be changed in edit mode
              >
                <option value="stdio">stdio</option>
                <option value="http">http</option>
              </Select>
              {type === 'http' && (
                <p className="text-xs text-slate-500 mt-1">服务器类型创建后不可修改</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">服务器名称</label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="MCP 服务器名称"
                className={cn(errors.name && "border-red-500 focus:border-red-500")}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {type === 'stdio' ? (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">命令 *</label>
                  <Input
                    value={command}
                    onChange={(e) => {
                      setCommand(e.target.value);
                      if (errors.command) setErrors({ ...errors, command: '' });
                    }}
                    placeholder="npx"
                    className={cn(errors.command && "border-red-500 focus:border-red-500")}
                    required
                  />
                  {errors.command && <p className="text-xs text-red-500 mt-1">{errors.command}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">参数（每行一个）</label>
                  <Textarea
                    value={args}
                    onChange={(e) => setArgs(e.target.value)}
                    placeholder="-y\n@modelcontextprotocol/server-fetch"
                    rows={3}
                    className="font-mono text-sm bg-slate-50 border-slate-200"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">环境变量（KEY=VALUE）</label>
                  <Textarea
                    value={env}
                    onChange={(e) => setEnv(e.target.value)}
                    placeholder="API_KEY=xxx\nENV=production"
                    rows={3}
                    className="font-mono text-sm bg-slate-50 border-slate-200"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="text-sm font-medium mb-1 block">URL *</label>
                <Input
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (errors.url) setErrors({ ...errors, url: '' });
                  }}
                  placeholder="http://localhost:3000"
                  type="url"
                  className={cn(errors.url && "border-red-500 focus:border-red-500")}
                  required
                />
                {errors.url && <p className="text-xs text-red-500 mt-1">{errors.url}</p>}
              </div>
            )}
          </form>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white gap-2">
            <Save className="h-4 w-4" />
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}