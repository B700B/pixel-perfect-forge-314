import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Mail, NotebookPen, CalendarCheck, BookOpenText, MessagesSquare, History, Settings, Scale,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

export const TOOLS = [
  { title: "Email Generator", url: "/email", icon: Mail, desc: "Draft polished emails in any tone." },
  { title: "Meeting Summarizer", url: "/meetings", icon: NotebookPen, desc: "Turn raw notes into minutes & action items." },
  { title: "Task Planner", url: "/planner", icon: CalendarCheck, desc: "Prioritize and time-block your work." },
  { title: "Research Assistant", url: "/research", icon: BookOpenText, desc: "Simplify reports and extract insights." },
  { title: "AI Chatbot", url: "/chat", icon: MessagesSquare, desc: "Ask anything about your workday." },
] as const;

const groups = [
  { label: "Workspace", items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }] },
  { label: "AI Tools", items: TOOLS },
  {
    label: "More",
    items: [
      { title: "History", url: "/history", icon: History },
      { title: "Settings", url: "/settings", icon: Settings },
      { title: "Responsible AI", url: "/responsible-ai", icon: Scale },
    ],
  },
] as const;

export function AppSidebar() {
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-1.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            W
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-bold">Workplace AI</div>
              <div className="text-xs text-muted-foreground">Productivity Assistant</div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={path === item.url} tooltip={item.title}>
                      <Link to={item.url} onClick={() => setOpenMobile(false)}>
                        <item.icon aria-hidden />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
