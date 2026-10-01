"use client"

import {
    ChevronRight,
    Folder,
    Home,
    Plus,
    Projector,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-amber-800 text-white">
                                    Z
                                </div>

                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        Zento
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        Dashboard
                                    </span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>

                <SidebarGroup>
                    <SidebarGroupLabel>ERP System</SidebarGroupLabel>



                    <SidebarGroupContent>
                        <SidebarMenu>

                            {/* Home */}
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a href="/dashboard">
                                        <Home />
                                        <span>Home</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>


                            {/* Dropdown */}
                            <Collapsible
                                defaultOpen
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>

                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton>
                                            <Folder />
                                            <span>Projects</span>

                                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent className="ml-4">
                                        <SidebarMenu>

                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild>

                                                    <a href="/projects/project1">
                                                        <span>Project 1</span>
                                                    </a>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>

                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild>
                                                    <a href="/projects/project2">
                                                        <span>Project 2</span>
                                                    </a>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>

                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild>
                                                    <a href="/projects/project3">
                                                        <span>Project 3</span>
                                                    </a>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>

                                        </SidebarMenu>
                                    </CollapsibleContent>

                                </SidebarMenuItem>
                            </Collapsible>

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

            </SidebarContent>

            <SidebarFooter />
        </Sidebar>
    )
}