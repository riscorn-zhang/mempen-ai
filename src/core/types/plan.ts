interface Plan {
    name: string;
    id: string;
    description: string;

    properties: PlanProperties;
    records: PlanRecords;

}

interface PlanProperties {

    startTime: Date;
    endTime: Date | 'forever';
    weight: number;


}

interface PlanRecords {


}

export type {
    Plan,
    PlanProperties,
    PlanRecords
}