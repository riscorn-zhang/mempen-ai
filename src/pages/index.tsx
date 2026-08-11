import { Button } from "@/components/ui/button";
import { Plus, X, Check } from "lucide-react";
import { useState } from "react";

import type { PlanProperties } from "@/core/plan/type";

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { FieldGroup, Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Marker, MarkerContent } from "@/components/ui/marker";
import { DatePickerInput } from "@/components/common/data-picker";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";


function newPlanProps(): PlanProperties {
    return {
        id: "",
        name: "",
        description: "",
        startTime: new Date(),
        endTime: "forever",
        weight: 1,
    };
}


interface PlanConfigProps {
    plan: PlanProperties;
    type: "create" | "edit";
    onDelete: () => void;
    onSave: (plan: PlanProperties) => boolean;
    onClose: () => void;
}


function PlanConfigDialog({
    plan,
    type,
    onDelete,
    onSave,
    onClose
}: PlanConfigProps) {

    const [draft, setDraft] = useState(plan);

    const [date, setDate] = useState<Date | undefined>(
        plan.startTime
    );

    const [isForever, setIsForever] = useState(
        plan.endTime === "forever"
    );

    const [weight, setWeight] = useState([
        plan.weight
    ]);


    function update<K extends keyof PlanProperties>(
        key: K,
        value: PlanProperties[K]
    ) {
        setDraft(prev => ({
            ...prev,
            [key]: value,
        }));
    }


    function submit() {
        if (onSave({
            ...draft,
            startTime: date ?? new Date(),
            endTime: isForever
                ? "forever"
                : date ?? new Date(),
            weight: weight[0],
        }))
            onClose()
    }


    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    {type === "create" ? "新建" : "编辑"}
                    学习计划
                </DialogTitle>
            </DialogHeader>

            <FieldGroup>
                <div className="flex items-center gap-4">
                    {
                        type === "create" && <Field className="flex-1">
                            <Label>ID<span className="text-destructive">*</span></Label>
                            <Input
                                value={draft.id}
                                onChange={e =>
                                    update(
                                        "id",
                                        e.target.value
                                    )
                                }
                                placeholder="仅限英文字母和数字"
                            />
                        </Field>
                    }

                    <Field className="flex-1">
                        <Label>名字<span className="text-destructive">*</span></Label>
                        <Input
                            value={draft.name}
                            onChange={e =>
                                update(
                                    "name",
                                    e.target.value
                                )
                            }
                        />
                    </Field>
                </div>

                <Field>
                    <Label>备注</Label>
                    <Textarea
                        value={draft.description}
                        onChange={e =>
                            update(
                                "description",
                                e.target.value
                            )
                        }
                    />
                </Field>

                <Field className="flex-row">
                    <Label>永久</Label>
                    <Switch
                        checked={isForever}
                        onCheckedChange={setIsForever}
                    />
                </Field>

                {!isForever && (
                    <Field>
                        <Label>目标时间</Label>
                        <DatePickerInput
                            date={date}
                            setDate={setDate}
                        />
                    </Field>
                )}

                <Field>
                    <div className="flex items-center">
                        <Label>权重</Label>
                        <div className="flex-1" />
                        <strong>
                            {weight[0].toPrecision(2)}
                        </strong>
                    </div>

                    <Slider
                        value={weight}
                        onValueChange={setWeight}
                        min={0.6}
                        max={1}
                        step={0.01}
                    />
                </Field>
            </FieldGroup>

            <DialogFooter>
                {type === "edit" && (
                    <Button variant="destructive" onClick={onDelete}>
                        <X />
                        删除
                    </Button>
                )}

                <div className="flex-1" />

                <Button variant="link" onClick={onClose}>
                    取消
                </Button>

                <Button onClick={() => submit()}>
                    {type === "create" ? (
                        <>
                            <Plus />
                            创建
                        </>
                    ) : (
                        <>
                            <Check />
                            保存
                        </>
                    )}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}


export default function PlanPage() {

    const [
        planDialog,
        setPlanDialog
    ] = useState(false);


    const [
        plan,
        setPlan
    ] = useState<PlanProperties>(
        newPlanProps()
    );




    return (
        <div className="
            flex-1
            flex
            items-center
            justify-center
        ">
            <span className="text-ring">
                现在还没有任何学习计划
            </span>

            <Button
                variant={"default"}
                className="
                    h-18
                    w-18
                    rounded-3xl
                    absolute
                    bottom-12
                    right-12
                    shadow-primary
                    hover:shadow-xl
                    border-none
                "
                onClick={() =>
                    setPlanDialog(true)
                }
            >
                <Plus className="size-8" />
            </Button>


            <Dialog
                open={planDialog}
                onOpenChange={setPlanDialog}
            >
                <PlanConfigDialog
                    plan={plan}
                    type="create"
                    onSave={(newPlan) => {
                        console.log(newPlan);
                        setPlan(newPlan);



                        return true;
                    }}
                    onClose={() => setPlanDialog(false)}
                    onDelete={() => { }}
                />
            </Dialog>
        </div>
    );
}