import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

export default function ChatPage() {
    return (
        <div className="flex flex-col gap-4 p-6">
            <Collapsible>
                <CollapsibleTrigger>Can I use this in my project?</CollapsibleTrigger>
                <CollapsibleContent>
                    Yes. Free to use for personal and commercial projects. No attribution
                    required.
                    <Collapsible>
                        <CollapsibleTrigger>Can I use this in my project?</CollapsibleTrigger>
                        <CollapsibleContent>
                            Yes. Free to use for personal and commercial projects. No attribution
                            required.
                        </CollapsibleContent>
                    </Collapsible>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}