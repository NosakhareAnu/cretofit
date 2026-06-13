import { LogOut, PlusSquare, Package, ClipboardList } from "lucide-react";

type AdminSidebarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
};

const tabs = [
  { id: "add-product", label: "Add Product", icon: PlusSquare },
  { id: "manage-products", label: "Manage Products", icon: Package },
  { id: "manage-orders", label: "Manage Orders", icon: ClipboardList },
];

export default function AdminSidebar({
  activeTab,
  onTabChange,
  onLogout,
}: AdminSidebarProps) {
  return (
    <aside className="w-full rounded-[2rem] border border-[#E5DED6] bg-white p-5 shadow-soft lg:sticky lg:top-8 lg:h-fit lg:w-72">
      <div className="mb-6 px-1">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C56A1B]">
          Cretofit
        </p>
        <h2 className="mt-1 font-display text-xl font-semibold text-[#2B2B2B]">
          Admin Panel
        </h2>
      </div>

      <div className="space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#C56A1B] text-white shadow-pop"
                  : "text-[#2B2B2B] hover:bg-[#F2E6DA]"
              }`}
            >
              <Icon size={17} className={isActive ? "text-white" : "text-[#C56A1B]"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={onLogout}
        className="mt-8 flex w-full items-center gap-2 rounded-2xl border border-[#E5DED6] px-4 py-3 text-left text-sm font-medium text-[#6F6A65] transition-all duration-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
      >
        <LogOut size={16} />
        Logout
      </button>
    </aside>
  );
}
