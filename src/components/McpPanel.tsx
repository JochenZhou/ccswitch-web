import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Trash2, Plus, ArrowLeft, Edit } from 'lucide-react';
import type { McpServer } from '@/types';
import { useMcpServersQuery, useDeleteMcpServerMutation, useUpdateMcpServerMutation } from '@/lib/queries';
import { toast } from 'sonner';
import { AddMcpDialog } from './AddMcpDialog';
import { EditMcpDialog } from './EditMcpDialog';

export function McpPanel({ onBack }: { onBack?: () => void }) {
  const { t } = useTranslation();
  const { data: servers = {}, isLoading } = useMcpServersQuery();
  const deleteMutation = useDeleteMcpServerMutation();
  const updateMutation = useUpdateMcpServerMutation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<McpServer | null>(null);

  const serverList = Object.values(servers) as McpServer[];

  const handleDelete = async (server: McpServer) => {
    if (!confirm(t('confirm.deleteMcpServerMessage', { name: server.name }))) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(server.id);
      toast.success(t('toast.success'));
    } catch (error) {
      toast.error(t('toast.error'));
    }
  };

  const handleEdit = (server: McpServer) => {
    setEditingServer(server);
  };

  const handleToggleApp = async (server: McpServer, app: 'claude' | 'codex' | 'gemini') => {
    try {
      await updateMutation.mutateAsync({
        id: server.id,
        server: {
          apps: {
            ...server.apps,
            [app]: !server.apps[app],
          },
        },
      });
    } catch (error) {
      toast.error(t('toast.error'));
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-2xl font-bold">{t('mcp.title')}</h2>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('mcp.addServer')}
        </Button>
      </div>

      {serverList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">暂无 MCP 服务器</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('mcp.addServer')}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {serverList.map((server) => (
            <Card key={server.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{server.name}</span>
                    <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">
                      {server.server.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(server)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(server)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">类型: </span>
                    <span className="text-sm text-muted-foreground">{server.server.type}</span>
                  </div>
                  {server.server.type === 'stdio' && (
                    <>
                      <div>
                        <span className="text-sm font-medium">命令: </span>
                        <span className="text-sm text-muted-foreground">{server.server.command}</span>
                      </div>
                      {server.server.args && (
                        <div>
                          <span className="text-sm font-medium">参数: </span>
                          <span className="text-sm text-muted-foreground">
                            {server.server.args.join(' ')}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {server.server.type === 'http' && (
                    <div>
                      <span className="text-sm font-medium">URL: </span>
                      <span className="text-sm text-muted-foreground">{server.server.url}</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant={server.apps.claude ? 'default' : 'outline'}
                      onClick={() => handleToggleApp(server, 'claude')}
                    >
                      Claude
                    </Button>
                    <Button
                      size="sm"
                      variant={server.apps.codex ? 'default' : 'outline'}
                      onClick={() => handleToggleApp(server, 'codex')}
                    >
                      Codex
                    </Button>
                    <Button
                      size="sm"
                      variant={server.apps.gemini ? 'default' : 'outline'}
                      onClick={() => handleToggleApp(server, 'gemini')}
                    >
                      Gemini
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <AddMcpDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} appId="claude" />
      <EditMcpDialog
        open={!!editingServer}
        onOpenChange={(open) => !open && setEditingServer(null)}
        server={editingServer}
      />
    </div>
  );
}
