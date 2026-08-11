import { ChevronDown, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import useWorkspace from "@/stores/workspace"
import { Button } from "../ui/button";

export default function () {

    const workspace = useWorkspace()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={"secondary"}>
                    {workspace.workspace ? workspace.workspace : "无工作区"}
                    <ChevronDown className="ml-auto" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    <Plus />
                    载入...
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}