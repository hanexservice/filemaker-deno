import { FilemakerLoginResponse } from "./types.ts";
import { FilemakerSession } from "./FilemakerSession.ts";
import { LoginError, StatusCodeError } from "./errors.ts";

type FilemakerAPIVersion = "v1" | "v2";

export interface ConnectionOptions {
  host: URL;
  database: string;
  layout: string;
  version?: FilemakerAPIVersion;
  username: string;
  password: string;
}

export class Filemaker {
  private host: URL;
  private database: string;
  private layout: string;
  private version: FilemakerAPIVersion;
  private username: string;
  private password: string;

  constructor(options: ConnectionOptions) {
    this.host = options.host;
    this.database = options.database;
    this.layout = options.layout;
    this.version = options.version || "v2";
    this.username = options.username;
    this.password = options.password;
  }

  public getURL() {
    return `${this.host}fmi/data/${this.version}/databases/${this.database}`;
  }

  public async login(): Promise<FilemakerSession> {
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Basic ${btoa(`${this.username}:${this.password}`)}`,
    };

    const response = await fetch(this.getURL() + "/sessions", {
      headers,
      body: "{}",
      method: "POST",
    }).catch((error) => {
      if (error instanceof TypeError) {
        if (error.message.includes("Connection refused")) {
          throw new Deno.errors.ConnectionRefused();
        }
      }
      throw error;
    });

    const data: FilemakerLoginResponse = await response.json();

    if (data.messages[0].code === "212") {
      throw new LoginError(response);
    }

    if (data.messages[0].code !== "0") {
      throw new StatusCodeError(response);
    }

    return new FilemakerSession(this, data.response.token);
  }
}
