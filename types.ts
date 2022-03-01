interface FilemakerMessages {
  code: string;
  message: string;
}

interface LoginResponse {
  token: string;
}

interface CreateResponse {
  recordId: string;
  modId: string;
}

interface EditResponse {
  modId: string;
}

export interface FilemakerLoginResponse extends FilemakerResponse {
  response: LoginResponse;
}

export interface FilemakerCreateResponse extends FilemakerResponse {
  response: CreateResponse;
}

export interface FilemakerEditResponse extends FilemakerResponse {
  response: EditResponse;
}

export interface FilemakerGetResponse<T extends Record<string, string>>
  extends FilemakerResponse {
  response: {
    dataInfo: {
      database: string;
      layout: string;
      table: string;
      totalRecordCount: number;
      foundCount: number;
      returnedCount: number;
    };
    data: FilemakerRecord<T>[];
  };
}

export interface FilemakerResponse {
  response: Record<never, never>;
  messages: FilemakerMessages[];
}

export interface FilemakerRecord<
  T extends Record<string, string> = Record<string, string>,
> {
  fieldData: T;
  recordId: string;
}

export interface FilemakerSort<T> {
  fieldName: keyof T;
  sortOrder: "ascend" | "descend";
}

export type FilemakerQuery<T> = Partial<Record<keyof T, string>>;
