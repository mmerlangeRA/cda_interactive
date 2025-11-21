
export enum VideoTypeEnum {
  PHOTO = "PHOTO",
  PANORAMA = "PANORAMA"
}

export enum RecordTypeEnum {
  PHOTO = "PHOTO",
  PANORAMA = "PANORAMA",
  UNKNOWN = "UNKNOWN"
}

export type VideoType = VideoTypeEnum.PHOTO | VideoTypeEnum.PANORAMA;
export type RecordType = RecordTypeEnum.UNKNOWN | RecordTypeEnum.PHOTO | RecordTypeEnum.PANORAMA;

export interface Record {
  id: number;
  name: string;
  srid: number;
  date_time: string;
  network_uuid: string;
  network_slug?: string;
  videos: Video[];
  executions: Execution[];
  created_at: string;
  updated_at: string;
  user_email?: string;
  type: RecordType;
}

export interface Video {
  id: number;
  title: string;
  url: string;
  content_type: string;
  size: number;
  is_master: boolean;
  type: VideoType;
  date_time?: string;  // Optional date time field (matches Python model)
}

export interface Execution {
  id: number;
  type: string;
  status: string;
  start_date: string;
  end_date: string | null;
  n8n_id: number;
  tasks: Task[];
}

export interface Task {
  id: number;
  name: string;
  status: string;
  custom_status: string;
  start_date: string;
  end_date: string | null;
}

export interface ExecutionStatus {
  status: "running" | "completed" | "error" | "none";
  error?: string;
}

export type JsonSchemaType = 'string' | 'number' | 'integer' | 'boolean';

export interface JsonSchemaProperty {
  type: JsonSchemaType;
  minimum?: number;
  maximum?: number;
  description?: string;
  default?: string | number | boolean;
}

export interface JsonSchema {
  type: string;
  properties: {
    [key: string]: JsonSchemaProperty;
  };
  required?: string[];
}

export interface Workflow {
  id: number;
  name: string;
  webhook_url: string;
  workflow_specific_data?: JsonSchema;
}

export interface WorkflowParams {
  [key: string]: string | number | boolean | object | undefined;
  execution_id?: number;
  workflow_name?: string;
  webhook_url: string;
}

export interface Network {
  uuid: string;
  created_at: string;
  updated_at: string;
  name: string;
  name_long: string;
  referential: { [key: string]: unknown };
  country: string;
  slug: string;
  bounding_box: { [key: string]: unknown };
  modules: unknown[];
  role: string;
  length: string;
}

export interface PhotoCollection {
  uuid: string;
  type: "PHOTO" | "PANORAMA";
  date: string;
  layer: string;
}
