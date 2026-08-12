interface Plan {
    id: string;
    properties: PlanProperties;
    records: PlanRecords;

}

interface PlanProperties {
    name: string;
    description: string;
    startTime: Date;
    endTime: Date | 'forever';
    weight: number;

}

interface PlanRecords {


}

interface PlanContent {
    properties: PlanProperties;
    records: PlanRecords;
}

export type {
    Plan,
    PlanProperties,
    PlanRecords,
    PlanContent,
}