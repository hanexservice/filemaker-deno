import {
  assert,
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.116.0/testing/asserts.ts";
import "https://deno.land/x/dotenv/load.ts";
import { MissingRecord } from "./errors.ts";

import Filemaker from "./Filemaker.ts";
import { FilemakerSession } from "./FileMakerSession.ts";

if (Deno.env.get("FILEMAKER_PASSWORD") == undefined) {
  throw new Error("FILEMAKER_PASSWORD is missing from .env");
}

// Create a new Filemaker instances
const badServer = new Filemaker({
  host: new URL("http://127.0.0.100:9999"),
  database: "RmaDatabase",
  layout: "RmaDatabase",
  username: "rmaclient",
  password: Deno.env.get("FILEMAKER_PASSWORD")!,
});

const goodServer = new Filemaker({
  host: new URL("http://172.16.10.1:8080"),
  database: "RmaDatabase",
  layout: "RmaDatabase",
  username: "rmaclient",
  password: Deno.env.get("FILEMAKER_PASSWORD")!,
});

Deno.test("Login to bad Filemaker server", async () => {
  await badServer.login().catch((error) => {
    assert(
      error instanceof Deno.errors.ConnectionRefused,
      "Login failure did not return as Deno error.",
    );
  });
});

let session: FilemakerSession;
Deno.test("Login to Filemaker", async () => {
  session = await goodServer.login();
  assertExists(session.token, "Session token wasn't defined");
});

// Define interface for testing records
interface RmaRecord {
  "__ Id Rma": string;
  "rmaNumber": string;
  "modelName": string;
  "serialNumber": string;
  "problemDescription": string;
  "dateOfPurchase": string;
}

let recordId: string;
Deno.test("Create Record", async () => {
  recordId = (await session.create("RmaDatabase", {
    fieldData: { rmaNumber: "Deno-Test" },
  })).response.recordId;
  assertExists(session.token, "Session token wasn't defined");
});
Deno.test("Get created Record", async () => {
  const record = await session.get<RmaRecord>("RmaDatabase", recordId);
  assertEquals(
    record.response.data[0].fieldData.rmaNumber,
    "Deno-Test",
    "Found record didn't have the search string",
  );
});

Deno.test("Find created Record", async () => {
  const records = await session.find<RmaRecord>("RmaDatabase", [{
    "rmaNumber": "=Deno-Test",
  }]);
  assertEquals(
    records.response.data[0].fieldData.rmaNumber,
    "Deno-Test",
    "Found record didn't have the search string",
  );
});

Deno.test("Find missing Record", async () => {
  const records = await session.find<RmaRecord>("RmaDatabase", [{
    "rmaNumber": "=Portal 3",
  }]).catch((error) => {
    assert(
      error instanceof MissingRecord,
      "Missing record didn't respond with filemaker error",
    );
  });

  assertEquals(
    records,
    undefined,
    "Unexisting record responed with existing data.",
  );
});

Deno.test("Delete created Record", async () => {
  await session.delete("RmaDatabase", recordId);
});

Deno.test("Logout of filemaker API", async () => {
  await session.logout();
});
