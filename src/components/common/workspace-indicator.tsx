import { ChevronDown, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useConfig } from "@/app/config";
import { Button } from "../ui/button";
import { documentDir } from "@tauri-apps/api/path";
import { join } from "@tauri-apps/api/path";
import { useEffect } from "react";

export default function () {

    const [s, update] = useConfig(["runtime", "workspace"])

    const defaultWorkspace = async () => {
        const docdir = await documentDir();
        const path = await join(docdir, "MempenVault");
        update(s => {
            s.workspace = path;
        });
    }

    useEffect(
        () => {
            if (!s.workspace)
                defaultWorkspace();
        },
        []
    )



    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={"link"}>
                    {s.workspace ? s.workspace : "无工作区"}
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