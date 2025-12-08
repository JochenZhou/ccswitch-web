import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Trash2, Plus, Edit, Power, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { AppId } from '@/types';

interface Prompt {
  id: string;
  name: string;
  content: string;
  description?: string;
  enabled: boolean;
}

interface PromptsPanelProps {
  appId: AppId;
  onBack?: () => void;
}

export function PromptsPanel({ appId, onBack }: PromptsPanelProps) {
  const { t } = useTranslation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  const loadPrompts = (): Prompt[] => {
    try {
      const saved = localStorage.getItem('ccswitch-data');
      if (saved) {
        const data = JSON.parse(saved);
        const promptsObj = data.prompts?.[appId] || {};
        return Object.values(promptsObj);
      }
    } catch (e) {}
    return [];
  };

  const [prompts, setPrompts] = useState<Prompt[]>(loadPrompts());

  const handleAdd = () => {
    setEditingPrompt(null);
    setName('');
    setDescription('');
    setContent('');
    setIsAddDialogOpen(true);
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setName(prompt.name);
    setDescription(prompt.description || '');
    setContent(prompt.content);
    setIsAddDialogOpen(true);
  };

  const savePrompts = (newPrompts: Prompt[]) => {
    try {
      const saved = localStorage.getItem('ccswitch-data');
      if (saved) {
        const data = JSON.parse(saved);
        if (!data.prompts) data.prompts = { claude: {}, codex: {}, gemini: {} };
        data.prompts[appId] = newPrompts.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
        localStorage.setItem('ccswitch-data', JSON.stringify(data));
      }
    } catch (e) {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      toast.error('请填写名称和内容');
      return;
    }

    const newPrompt: Prompt = {
      id: editingPrompt?.id || `prompt-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      content: content.trim(),
      enabled: editingPrompt?.enabled || false,
    };

    let newPrompts: Prompt[];
    if (editingPrompt) {
      newPrompts = prompts.map(p => p.id === editingPrompt.id ? newPrompt : p);
    } else {
      newPrompts = [...prompts, newPrompt];
    }
    setPrompts(newPrompts);
    savePrompts(newPrompts);

    toast.success(t('toast.success'));
    setIsAddDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确认删除此提示词？')) {
      const newPrompts = prompts.filter(p => p.id !== id);
      setPrompts(newPrompts);
      savePrompts(newPrompts);
      toast.success(t('toast.success'));
    }
  };

  const handleToggle = (id: string) => {
    const newPrompts = prompts.map(p => ({
      ...p,
      enabled: p.id === id ? !p.enabled : false,
    }));
    setPrompts(newPrompts);
    savePrompts(newPrompts);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-2xl font-bold">提示词管理</h2>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          添加提示词
        </Button>
      </div>

      {prompts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">暂无提示词</p>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            添加提示词
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {prompts.map((prompt) => (
            <Card key={prompt.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={prompt.enabled ? 'default' : 'outline'}
                      onClick={() => handleToggle(prompt.id)}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                    <span>{prompt.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(prompt)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(prompt.id)}
                      disabled={prompt.enabled}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              {prompt.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{prompt.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPrompt ? '编辑提示词' : '添加提示词'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">名称 *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="提示词名称"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">描述</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="简短描述"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">内容 *</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="# 角色定义\n\n你是一位专业的..."
                  rows={12}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">{t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}