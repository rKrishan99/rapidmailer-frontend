import { createContext, useState } from "react";

export const SidebarExpandContext = createContext();

export function SidebarExpandProvider({children}) {

    const [isExpand, setIsExpand] = useState(true);

    return (
        <SidebarExpandContext.Provider value={{isExpand, setIsExpand}}>
            {children}
        </SidebarExpandContext.Provider>
    )
}