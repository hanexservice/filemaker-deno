import Filemaker from "./Filemaker.ts";
import { MissingRecord, StatusCodeError } from "./errors.ts";
import {
  FilemakerCreateResponse,
  FilemakerEditResponse,
  FilemakerGetResponse,
  FilemakerRecord,
  FilemakerResponse,
  FilemakerSort,
} from "./types.ts";

export class FilemakerSession {
  private server: Filemaker;
  public token: string;

  constructor(server: Filemaker, token: string) {
    this.server = server;
    this.token = token;
  }

  /**
   * Close the current session.
   */
  public async logout(): Promise<void> {
    const headers = {
      "Content-Type": "application/json",
    };

    const response = await fetch(
      `${this.server.getURL()}/sessions/${this.token}`,
      { headers, method: "DELETE" },
    );

    const data = await response.json();

    if (data.messages[0].code !== "0") {
      throw new StatusCodeError(response);
    }
  }

  public async create(
    layout: string,
    record: FilemakerRecord,
  ): Promise<FilemakerCreateResponse> {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `bearer ${this.token}`,
    };

    const response = await fetch(
      `${this.server.getURL()}/layouts/${layout}/records`,
      { headers, method: "POST", body: JSON.stringify(record) },
    );

    const data: FilemakerCreateResponse = await response.json();

    if (data.messages[0].code !== "0") {
      throw new StatusCodeError(response);
    }

    return data;
  }

  public async edit(
    layout: string,
    recordId: string,
    record: FilemakerRecord,
  ): Promise<FilemakerEditResponse> {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `bearer ${this.token}`,
    };

    const response = await fetch(
      `${this.server.getURL()}/layouts/${layout}/records/${recordId}`,
      { headers, method: "PATCH", body: JSON.stringify(record) },
    );

    const data: FilemakerEditResponse = await response.json();

    if (data.messages[0].code !== "0") {
      throw new StatusCodeError(response);
    }

    return data;
  }

  public async delete(
    layout: string,
    recordId: string,
  ): Promise<FilemakerResponse> {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `bearer ${this.token}`,
    };

    const response = await fetch(
      `${this.server.getURL()}/layouts/${layout}/records/${recordId}`,
      { headers, method: "DELETE", body: "{}" },
    );

    const data: FilemakerResponse = await response.json();

    if (data.messages[0].code !== "0") {
      throw new StatusCodeError(response);
    }

    return data;
  }

  public async get<T>(
    layout: string,
    recordId: string,
  ): Promise<FilemakerGetResponse<Record<string, string> & T>> {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `bearer ${this.token}`,
    };

    const response = await fetch(
      `${this.server.getURL()}/layouts/${layout}/records/${recordId}`,
      { headers, method: "GET" },
    );

    const data: FilemakerGetResponse<Record<string, string> & T> =
      await response.json();

    if (data.messages[0].code !== "0") {
      throw new StatusCodeError(response);
    }

    return data;
  }

  public async find<T>(
    layout: string,
    query: Partial<Record<keyof T, string>>[],
    sort?: FilemakerSort<T>[],
  ): Promise<FilemakerGetResponse<Record<string, string> & T>> {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `bearer ${this.token}`,
    };

    const response = await fetch(
      `${this.server.getURL()}/layouts/${layout}/_find`,
      { headers, method: "POST", body: JSON.stringify({ query, sort }) },
    );

    const data: FilemakerGetResponse<Record<string, string> & T> =
      await response.json();

    if (data.messages[0].code === "401") {
      throw new MissingRecord(response);
    }

    if (data.messages[0].code !== "0") {
      throw new StatusCodeError(response);
    }

    return data;
  }
}
