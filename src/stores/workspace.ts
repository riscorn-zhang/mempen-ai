import { create } from "zustand";

interface WorkspaceStore {
    workspace: string;
    setWorkspace: (arg0: string) => void;
}

export default create<WorkspaceStore>((set, get) => ({
    workspace: "",
    setWorkspace: (workspace: string) => {

        set({ workspace })

    }
}))