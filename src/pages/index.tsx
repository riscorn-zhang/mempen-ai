import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Plus, X, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Plan, PlanContent, PlanProperties, PlanRecords } from "@/core/plan/type";

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
import { DatePickerInput } from "@/components/common/data-picker";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { join } from "@tauri-apps/api/path";
import { readDir, readTextFile, writeTextFile } from "@/lib/fs";
import { useConfig } from "@/app/config";
import useNavStore from "@/stores/nav";

const PATTERN_PREMITTED = /^[0-9A-Za-z_-]+$/;

function formatDate(d: Date | string): string {
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
}


function newPlanProps(): PlanProperties {
    return {
        name: "",
        description: "",
        startTime: new Date(),
        endTime: "forever",
        weight: 1,
    };
}


interface PlanConfigProps {
    id: string;
    plan: PlanProperties;
    type: "create" | "edit";
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete: () => void;
    onSave: (id: string, plan: PlanProperties) => boolean;
    onClose: () => void;
}


function PlanConfigDialog({
    id: initialId,
    plan,
    type,
    open,
    onOpenChange,
    onDelete,
    onSave,
    onClose
}: PlanConfigProps) {

    const [workspace,] = useConfig(["runtime", "workspace"])

    const [id, setId] = useState(initialId);
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

    const [idError, setIdError] = useState("");
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            checkID(id).then(([ok, msg]) => {
                setIdError(ok ? "" : (msg as string));
            });
        }, 300);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [id, type]);


    function update<K extends keyof PlanProperties>(
        key: K,
        value: PlanProperties[K]
    ) {
        setDraft(prev => ({
            ...prev,
            [key]: value,
        }));
    }


    async function submit() {
        if (idError) return;
        if (onSave(id, {
            ...draft,
            startTime: new Date(),
            endTime: isForever
                ? "forever"
                : date ?? new Date(),
            weight: weight[0],
        }))
            onClose()
    }

    async function checkID(id: string): Promise<[boolean, string]> {
        if (type === 'edit') return [true, ""];

        if (!id.trim()) return [false, "ID 不能为空"];
        if (!PATTERN_PREMITTED.test(id)) return [false, "只允许字母、数字、-、_"];

        const entries = await readDir(await join(workspace.workspace, "plans"));
        const dup = entries.some(e => e.isDirectory && e.name === id);
        if (dup) return [false, "ID 已存在"];

        return [true, ""];
    }


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {type === "create" ? "新建" : "编辑"}
                        学习计划
                    </DialogTitle>
                </DialogHeader>

                <FieldGroup>
                    <div className="flex items-start gap-4">
                        {
                            <Field className="flex-1">
                                <Label>ID<span className="text-destructive">*</span></Label>
                                <Input
                                    disabled={type === 'edit'}
                                    value={id}
                                    onChange={e =>
                                        setId(e.target.value)
                                    }

                                    onBlur={
                                        e => {
                                            if (!draft.name.trim()) {
                                                update("name", e.target.value)
                                            }
                                        }
                                    }
                                    placeholder="仅限英文字母和数字"
                                />
                                {idError && (
                                    <p className="text-destructive text-xs mt-1">{idError}</p>
                                )}
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
        </Dialog>
    );
}


export default function PlanPage() {

    const [
        planDialog,
        setPlanDialog
    ] = useState(false);

    const [resetKey, setResetKey] = useState(0);

    const [workspace,] = useConfig(["runtime", "workspace"]);
    const nav = useNavStore();


    const [planId, setPlanId] = useState("");

    const [
        plan,
        setPlan
    ] = useState<PlanProperties>(
        newPlanProps()
    );

    const handleSave = async (id: string, props: PlanProperties, records: PlanRecords) => {

        const planContent: PlanContent = {
            properties: props,
            records: records
        };

        writeTextFile(await join(workspace.workspace, "plans", id, "plan.json"), JSON.stringify(planContent, null, 2))

    }

    const [plans, setPlans] = useState<Plan[]>([]);

    const loadPlans = async () => {
        const entries = await readDir(await join(workspace.workspace, "plans"));
        const loaded: Plan[] = [];
        for (const entry of entries) {
            if (!entry.isDirectory) continue;
            try {
                const raw = await readTextFile(await join(workspace.workspace, "plans", entry.name, "plan.json"));
                const content: PlanContent = JSON.parse(raw);
                loaded.push({
                    id: entry.name,
                    properties: content.properties,
                    records: content.records,
                });
            } catch {
                // skip malformed plans
            }
        }
        setPlans(loaded);
    };

    useEffect(() => {
        loadPlans();
    }, []);



    return (
        <div className="flex-1 flex flex-col">
            {plans.length > 0 ? (
                <ScrollArea className="flex-1 min-h-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-visible p-6 mb-45">
                        {plans.map((plan) => (
                            <Card
                                key={plan.id}
                                tabIndex={0}
                                className="cursor-pointer hover:shadow-lg transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                onClick={() => nav.move(`/plans/${plan.id}`)}
                                onKeyDown={(e) => { if (e.key === "Enter") nav.move(`/plans/${plan.id}`); }}
                            >
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="font-mono text-xs">{plan.id}</Badge>
                                    </div>
                                    <CardTitle>{plan.properties.name}</CardTitle>
                                    {plan.properties.description && (
                                        <CardDescription>{plan.properties.description}</CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="flex flex-col gap-1 text-xs text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>开始</span>
                                        <span>{formatDate(plan.properties.startTime)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>结束</span>
                                        <span>
                                            {plan.properties.endTime === "forever"
                                                ? "永久"
                                                : formatDate(plan.properties.endTime)}
                                        </span>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">权重</span>
                                    <Badge variant="outline">{plan.properties.weight.toFixed(2)}</Badge>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                    <ScrollBar orientation="vertical" />
                </ScrollArea>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <span className="text-muted-foreground">现在还没有任何学习计划</span>
                </div>
            )}


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


            <PlanConfigDialog
                key={resetKey}
                id={planId}
                plan={plan}
                type="create"
                open={planDialog}
                onOpenChange={setPlanDialog}

                onSave={(id, newPlan) => {
                    handleSave(id, newPlan, {})
                    loadPlans();
                    return true;
                }}
                onClose={() => {
                    setPlanId("");
                    setPlan(newPlanProps());
                    setResetKey(k => k + 1);
                    setPlanDialog(false);
                }}
                onDelete={() => { }}

            />
        </div>
    );
}