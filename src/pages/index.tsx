import { Button } from "@/components/ui/button";
import useNavStore from "@/stores/nav"
import { Plus } from "lucide-react";
import type { Plan } from "@/core/types/plan"
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldGroup, Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function newPlan() {
    return {
        id: '',
        name: '',
        description: '',
        properties: {
            startTime: new Date(),
            endTime: 'forever',
            weight: 1,
        },
        records: {}
    } as Plan;
}

interface PlanConfigProps {
    plan: Plan;
    setPlan: React.Dispatch<React.SetStateAction<Plan>>
    type: 'create' | 'edit';
}

function PlanConfig({ plan, type }: PlanConfigProps) {
    console.debug(plan, type)
    return (
        <>
            <FieldGroup>
                <Field>
                    <Label>ID</Label>
                    <Input name="id" defaultValue="@peduarte" />
                </Field>
                <Field>
                    <Label>Name</Label>
                    <Input name="name" defaultValue="Pedro Duarte" />
                </Field>
                <Field>
                    <Label>Description</Label>
                    <Textarea></Textarea>
                </Field>

            </FieldGroup>
        </>
    )
}

export default function () {

    const [planDialog, setPlanDialog] = useState(false)

    const nav = useNavStore();

    const [plan, setPlan] = useState<Plan>(newPlan())

    return (
        <div className="flex-1 flex items-center justify-center">
            <span className="text-ring">现在还没有任何学习计划</span>
            <Button
                className="h-18 w-18 rounded-3xl absolute bottom-12 right-12 shadow-primary hover:shadow-xl"
                onClick={() => setPlanDialog(true)}
            >
                <Plus className="size-8" />
            </Button>
            <Dialog open={planDialog} onOpenChange={setPlanDialog}>
                <form>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>新建学习计划</DialogTitle>
                        </DialogHeader>
                        <PlanConfig plan={plan} type="create" setPlan={setPlan} />
                        <DialogFooter>
                            <Button type="submit">
                                创建
                            </Button>
                            <Button variant={"outline"}>
                                取消
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </form>
            </Dialog>
        </div>
    )
}