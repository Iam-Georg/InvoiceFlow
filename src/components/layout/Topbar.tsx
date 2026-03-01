"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface TopbarProps {
  title: string;
  actions?: ReactNode;
}

export default function Topbar({ title, actions }: TopbarProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header
      className="fixed right-0 top-0 z-30 flex items-center justify-between px-4 md:px-6"
      style={{
        left: "0",
        background: "var(--topbar-bg)",
        borderBottom: "1px solid var(--border)",
        height: "52px",
      }}
    >
      <h1
        className="text-sm font-semibold"
        style={{ color: "var(--foreground)" }}
      >
        {title}
      </h1>

      <div className="flex items-center gap-2">
        {actions}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-8 h-8 flex items-center justify-center text-xs font-semibold"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              M
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="p-1.5 min-w-[180px]"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <DropdownMenuItem asChild>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-3 py-2"
              >
                <Settings
                  className="w-4 h-4"
                  style={{ color: "var(--muted-foreground)" }}
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--foreground)" }}
                >
                  Einstellungen
                </span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator
              style={{ background: "var(--border)", margin: "6px 8px" }}
            />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2"
              style={{ color: "var(--destructive)" }}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Abmelden</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
