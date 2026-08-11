import { create } from "zustand";
import { documentDir } from '@tauri-apps/api/path';

interface WorkspaceStore {
    workspace: string;
    setWorkspace: (arg0: string) => void;
}

const useWorkspace = create<WorkspaceStore>((set) => ({
    workspace: "",
    setWorkspace: (workspace: string) => {

        set({ workspace })

    }
}))

export default useWorkspace;