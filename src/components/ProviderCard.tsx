import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Copy, GripVertical, Play, Check } from 'lucide-react';
import type { Provider, AppId } from '@/types';
import { cn } from '@/lib/utils';

interface ProviderCardProps {
  provider: Provider;
  isCurrent: boolean;
  appId: AppId;
  onSwitch: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  id?: string;
}

export function ProviderCard({
  provider,
  isCurrent,
  onSwitch,
  onEdit,
  onDelete,
  onDuplicate,
}: ProviderCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "group relative bg-white rounded-xl border transition-all duration-200 pl-2 pr-6 py-4",
        isCurrent
          ? "bg-blue-50/50 border-blue-400 shadow-sm"
          : "border-slate-200 hover:border-slate-300 hover:shadow-md"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500">
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg border",
            isCurrent ? "bg-white border-blue-200 text-slate-800" : "bg-slate-50 border-slate-200 text-slate-500"
          )}>
            {provider.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base truncate">
              {provider.name}
            </h3>
            {isCurrent && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100/80 text-emerald-600">
                {t('provider.current') || "当前使用"}
              </span>
            )}
          </div>
          {provider.websiteUrl && (
            <a
              href={provider.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-600 hover:underline truncate block mt-0.5 font-sans"
            >
              {provider.websiteUrl}
            </a>
          )}
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-3">
          {/* Switch / Enable / In Use Button */}
          {isCurrent ? (
            <Button size="sm" variant="outline" className="bg-slate-100 text-slate-500 hover:bg-slate-100 cursor-default shadow-none gap-2 px-3">
              <Check className="h-3.5 w-3.5" />
              {t('common.inUse') || "使用中"}
            </Button>
          ) : (
            <div className="hidden group-hover:block transition-all duration-200">
              <Button size="sm" onClick={onSwitch} className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 shadow-sm gap-2">
                <Play className="h-3.5 w-3.5 fill-white" />
                {t('common.enable') || "启用"}
              </Button>
            </div>
          )}

          {/* Icons Actions */}
          <div className={cn("flex items-center gap-1", isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity")}>
            <Button size="sm" variant="ghost" onClick={onEdit} className="h-10 w-10 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100">
              <Edit className="h-6 w-6" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDuplicate} className="h-10 w-10 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100">
              <Copy className="h-6 w-6" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete} className="h-10 w-10 rounded text-slate-500 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
