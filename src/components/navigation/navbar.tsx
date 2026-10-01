
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "./theme-toggler";

const NavBar = ({ className }: { className: string }) => {
    return (
        <div className={`flex items-center justify-between px-4 ${className}`}>
            <SidebarTrigger />
            <div className="items-end">
                <ModeToggle />
            </div>

        </div>
    )
}

export default NavBar
