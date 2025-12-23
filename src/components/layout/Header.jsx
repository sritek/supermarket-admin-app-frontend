import useAuthStore from '@/store/authStore';

export default function Header() {
  const { user } = useAuthStore();

  return (
    <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-medium text-foreground">Admin Panel</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.role}</p>
        </div>
      </div>
    </header>
  );
}

