import { Card } from "@/components/ui/card";
import React from "react";
import { cn } from "@/lib/utils";

function StudyPlanCard({
    className = "",
    children,
}: {
    className?: string,
    children?: React.ReactNode
}) {
    return <Card className={cn("flex-none w-75 h-18 box-content hover:scale-105 transition-transform", className)}>
        {children}
    </Card>
}

export default function PlanPage() {
    return (
        <div className="flex flex-col gap-4 p-6 flex-1">
            <div className="h-12">
                Header
            </div>
            <div className="flex flex-wrap gap-4 box-border">
                <StudyPlanCard className="bg-lime-700/15">

                </StudyPlanCard>
            </div>
        </div>
    );
}