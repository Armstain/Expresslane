import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, UserRound } from "lucide-react";
import useAuth from "@/hooks/useAuth.jsx";
import useRole from "@/hooks/useRole.js";
import Logo from "@/components/Shared/Logo.jsx";
import UserAvatar from "@/components/Shared/UserAvatar.jsx";
import { Skeleton } from "@/components/ui/skeleton";
import MenuItem from "./Menu/MenuItem.jsx";
import { ROLE_LABEL, ROLE_NAV } from "./navigation.js";

// Sidebar contents, shared by the desktop rail and the mobile sheet
const Sidebar = ({ onNavigate }) => {
  const { user, logOut } = useAuth();
  const [role, isLoading] = useRole();
  const navigate = useNavigate();
  const items = ROLE_NAV[role] || [];

  const handleLogout = async () => {
    await logOut();
    navigate("/");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Dashboard">
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {isLoading ? "Menu" : ROLE_LABEL[role] || "Menu"}
          </p>
          <div className="space-y-1">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
              : items.map((item) => <MenuItem key={item.address} {...item} onNavigate={onNavigate} />)}
          </div>
        </div>
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </p>
          <div className="space-y-1">
            <MenuItem label="Profile" address="/dashboard/profile" icon={UserRound} onNavigate={onNavigate} />
            <MenuItem label="Back to website" address="/" icon={ArrowLeft} onNavigate={onNavigate} />
          </div>
        </div>
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <UserAvatar src={user?.photoURL} name={user?.displayName} email={user?.email} className="h-9 w-9" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.displayName || "Your account"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

Sidebar.propTypes = { onNavigate: PropTypes.func };

export default Sidebar;
