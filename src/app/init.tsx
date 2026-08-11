import { documentDir } from "@tauri-apps/api/path"
import { useEffect } from "react";
import useWorkspace from "@/stores/workspace"



export default function AppInit() {

    const workspace = useWorkspace();

    useEffect(() => {
        documentDir().then((val: string) => {
            // console.log(val)

            // workspace.setWorkspace(val)
        })
    }, [])


    return (<></>);
}