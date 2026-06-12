import { User, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/lankaMetroLogo.png";

export default function Navbar({ userName, userRole, onMenuToggle, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const avatarLetter = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 shadow-sm z-40">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
          >
            <Menu size={20} />
          </button>
          <img src={logo} alt="SRMSS Logo" className="h-40 w-30" />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-4 border-l border-gray-200 hover:bg-gray-50 pr-2 py-2 rounded-md"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-600">{userRole}</p>
              </div>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                {avatarLetter}
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-100 shadow-lg overflow-hidden">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 border-t border-gray-100 text-sm"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
