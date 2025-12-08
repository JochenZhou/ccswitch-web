import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Textarea } from './ui/textarea';
import { useAddMcpServerMutation } from '@/lib/queries';
import { toast } from 'sonner';
import type { AppId } from '@/types';

interface AddMcpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appId: AppId;
}

export function AddMcpDialog({ open, onOpenChange, appId }: AddMcpDialogProps) {
  const { t } = useTranslation();
  const addMutation = useAddMcpServerMutation();
  const [type, setType] = useState<'stdio' | 'http'>('stdio');
  const [name, setName] = useState('');
  const [command, setCommand] = useState('');
  const [args, setArgs] = useState('');
  const [url, setUrl] = useState('');
  const [env, setEnv] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const id = `mcp-${Date.now()}`;
    const server: any = { type };
    
    if (type === 'stdio') {
      if (!command.trim()) {
        toast.error('请输入命令');
        return;
      }
      server.command = command.trim();
      if (args.trim()) {
        server.args = args.split('\n').map(a => a.trim()).filter(Boolean);
      }
      if (env.trim()) {
        server.env = Object.fromEntries(
          env.split('\n').map(line => {
            const [k, v] = line.split('=');
            return [k?.trim(), v?.trim()];
          }).filter(([k]) => k)
        );
      }
    } else {
      if (!url.trim()) {
        toast.error('请输入 URL');
        return;
      }
      server.url = url.trim();
    }

    try {
      await addMutation.mutateAsync({
        name: name.trim() || id,
        server,
        enabled: true,
        apps: {
          claude: appId === 'claude',
          codex: appId === 'codex',
          gemini: appId === 'gemini',
        },
      });
      toast.success(t('toast.success'));
      onOpenChange(false);
      setName('');
      setCommand('');
      setArgs('');
      setUrl('');
      setEnv('');
    } catch (error) {
      toast.error(t('toast.error'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('mcp.addServer')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">类型</label>
              <Select value={type} onChange={(e) => setType(e.target.value as 'stdio' | 'http')}>
                <option value="stdio">stdio</option>
                <option value="http">http</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">名称</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="MCP 服务器名称"
              />
            </div>
            {type === 'stdio' ? (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">命令 *</label>
                  <Input
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="npx"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">参数（每行一个）</label>
                  <Textarea
                    value={args}
                    onChange={(e) => setArgs(e.target.value)}
                    placeholder="-y\n@modelcontextprotocol/server-fetch"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">环境变量（KEY=VALUE）</label>
                  <Textarea
                    value={env}
                    onChange={(e) => setEnv(e.target.value)}
                    placeholder="API_KEY=xxx\nENV=production"
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="text-sm font-medium mb-1 block">URL *</label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="http://localhost:3000"
                  type="url"
                  required
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">{t('common.add')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}