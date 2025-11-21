import { Execution, Record } from "../types";

export type RecordsExecutionsSummary = {
    executionName: string;
    nbRecords: number;
    nbRecordsCompleted: number;
    nbRecordsInError: number;
    nbRecordsRunning: number;
};

export const getExecutionStatus = (record: Record, executionName?: string): string => {
    const executions = executionName
        ? record.executions.filter(e => e.type === executionName)
        : record.executions;

    if (executions.length === 0) return "none";

    const sorted = [...executions].sort((a, b) => a.id - b.id); // ascending by id
    const lastExecution = sorted.at(-1); // get the last (highest id)

    return lastExecution?.status?.toLowerCase() ?? "none";
};


export const isRecordExecutionCompleted = (record: Record, executionName?: string): boolean => {
    return getExecutionStatus(record, executionName) === "completed";
};

export const isRecordExecutionRunning = (record: Record, executionName?: string): boolean => {
    const status = getExecutionStatus(record, executionName);
    return status === "running" || status === "started";
};

export const isRecordExecutionInError = (record: Record, executionName?: string): boolean => {
    return getExecutionStatus(record, executionName) === "error";
};

export const nbExecutionsInError = (records: Record[], executionName?: string): number => {
    return records.reduce((count, record) => {
        return isRecordExecutionInError(record, executionName) ? count + 1 : count;
    }, 0);
};

export const nbExecutionsCompleted = (records: Record[], executionName?: string): number => {
    return records.reduce((count, record) => {
        return isRecordExecutionCompleted(record, executionName) ? count + 1 : count;
    }, 0);
};

export const nbExecutionsRunning = (records: Record[], executionName?: string): number => {
    return records.reduce((count, record) => {
        return isRecordExecutionCompleted(record, executionName) ? count + 1 : count;
    }, 0);
};



export const summarizeExecutions = (records: Record[]): RecordsExecutionsSummary[] => {
    const executionStats: { [key: string]: RecordsExecutionsSummary } = {};

    records.forEach(record => {
        const latestExecutionsByType: { [key: string]: Execution } = {};

        // Sort executions by id, then take the latest per executionName
        const sortedExecutions = [...record.executions].sort((a, b) => a.id - b.id);
        sortedExecutions.forEach(exe => {
            latestExecutionsByType[exe.type] = exe; // override to keep latest
        });

        Object.entries(latestExecutionsByType).forEach(([type, execution]) => {
            if (!executionStats[type]) {
                executionStats[type] = {
                    executionName: type,
                    nbRecords: 0,
                    nbRecordsCompleted: 0,
                    nbRecordsInError: 0,
                    nbRecordsRunning: 0
                };
            }

            const summary = executionStats[type];
            summary.nbRecords++;

            const status = execution.status.toLowerCase();
            if (status === "completed") summary.nbRecordsCompleted++;
            else if (status === "error") summary.nbRecordsInError++;
            else if (status === "running" || status === "started") summary.nbRecordsRunning++;
        });
    });

    return Object.values(executionStats);
};