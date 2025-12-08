import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { AppId, Provider } from '@/types';
import { ProviderList } from './components/ProviderList';
import { McpPanel } from './components/McpPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { PromptsPanel } from './components/PromptsPanel';
import { AddProviderDialog } from './components/AddProviderDialog';
import { Button } from './components/ui/button';
import { Settings, Server, Smartphone, Plus, Sparkles, Box, CircuitBoard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAddProviderMutation } from '@/lib/queries';

type View = 'providers' | 'mcp' | 'settings' | 'prompts';

function App() {
  const { t } = useTranslation();
  const [activeApp, setActiveApp] = useState<AppId>('claude');
  const [currentView, setCurrentView] = useState<View>('providers');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const addMutation = useAddProviderMutation(activeApp);

  const apps: { id: AppId; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'claude', label: t('apps.claude'), icon: <Sparkles className="h-4 w-4" />, color: "text-orange-500" },
    { id: 'codex', label: t('apps.codex'), icon: <CircuitBoard className="h-4 w-4" />, color: "text-purple-500" },
    { id: 'gemini', label: t('apps.gemini'), icon: <Box className="h-4 w-4" />, color: "text-blue-500" },
  ];


  const handleAddProvider = async (provider: Omit<Provider, 'id'>) => {
    try {
      await addMutation.mutateAsync(provider);
      toast.success(t('toast.providerAdded'));
      setIsAddDialogOpen(false);
    } catch (error) {
      toast.error(t('toast.error'));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16">
          <div className="flex items-center justify-between h-full">
            {/* Logo Area */}
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-blue-600 tracking-tight">CC Switch</h1>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-slate-600"
                onClick={() => setCurrentView('settings')}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {/* Center Toggle Group */}
            {currentView === 'providers' && (
              <div className="hidden md:flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
                {apps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => setActiveApp(app.id)}
                    className={cn(
                      "px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                      activeApp === app.id
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {app.label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-500 hover:bg-slate-100"
                onClick={() => setCurrentView('prompts')}
              >
                <Smartphone className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("text-slate-500 hover:bg-slate-100", currentView === 'mcp' && "bg-slate-100 text-slate-900")}
                onClick={() => setCurrentView(currentView === 'mcp' ? 'providers' : 'mcp')}
              >
                <Server className="h-5 w-5" />
              </Button>

              <div className="h-6 w-px bg-slate-200 mx-1" />

              <Button
                size="icon"
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg shadow-orange-500/20"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        {currentView === 'providers' && (
          <div className="space-y-6">
            <div className="md:hidden flex justify-center mb-6">
              {/* Mobile Toggle Group */}
              <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 w-full max-w-md">
                {apps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => setActiveApp(app.id)}
                    className={cn(
                      "flex-1 px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                      activeApp === app.id
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {app.label}
                  </button>
                ))}
              </div>
            </div>
            <ProviderList appId={activeApp} onAddProvider={() => setIsAddDialogOpen(true)} />
          </div>
        )}
        {currentView === 'mcp' && <McpPanel onBack={() => setCurrentView('providers')} />}
        {currentView === 'prompts' && <PromptsPanel appId={activeApp} onBack={() => setCurrentView('providers')} />}
        {currentView === 'settings' && <SettingsPanel onBack={() => setCurrentView('providers')} />}

        <AddProviderDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          appId={activeApp}
          onSubmit={handleAddProvider}
        />
      </main>
    </div>
  );
}

export default App;
