interface Plan {

    properties: PlanProperties;
    records: PlanRecords;

}

interface PlanProperties {
    name: string;
    id: string;
    description: string;
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