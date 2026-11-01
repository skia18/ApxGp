import type { components } from "./schema";

export type Season = components["schemas"]["Season"];
export type Race = components["schemas"]["Race"];
export type Session = components["schemas"]["Session"];
export type Driver = components["schemas"]["Driver"];
export type Constructor = components["schemas"]["Constructor"];
export type DriverStanding = components["schemas"]["DriverStanding"];
export type ConstructorStanding = components["schemas"]["ConstructorStanding"];
export type Classification =
  components["schemas"]["ClassificationResponse"]["data"];
export type LiveTiming = components["schemas"]["LiveTiming"];

const configuredBaseUrl = import.meta.env["VITE_API_BASE_URL"] as
  string | undefined;
export const apiBaseUrl = (
  configuredBaseUrl ?? "http://localhost:8081"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code = "request_failed",
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ErrorBody = components["schemas"]["ErrorResponse"];

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { Accept: "application/json" },
    ...(signal ? { signal } : {}),
  });

  if (!response.ok) {
    let body: ErrorBody | undefined;
    try {
      body = (await response.json()) as ErrorBody;
    } catch {
      // A proxy or platform may return a non-JSON error page.
    }

    throw new ApiError(
      body?.error.message ??
        `API request failed with status ${response.status}.`,
      response.status,
      body?.error.code,
      body?.error.requestId,
    );
  }

  return (await response.json()) as T;
}

export async function getCurrentSeason(signal?: AbortSignal): Promise<Season> {
  const response = await get<{ data: Season }>(
    "/api/v1/seasons/current",
    signal,
  );
  return response.data;
}

export async function getNextRace(signal?: AbortSignal): Promise<Race> {
  const response = await get<{ data: Race }>("/api/v1/races/next", signal);
  return response.data;
}

export async function listSeasonRaces(
  year: number,
  signal?: AbortSignal,
): Promise<Race[]> {
  const response = await get<{ data: components["schemas"]["RacePage"] }>(
    `/api/v1/seasons/${year}/races`,
    signal,
  );
  return response.data.items;
}

export async function getDriverStandings(
  year: number,
  signal?: AbortSignal,
): Promise<DriverStanding[]> {
  const response = await get<components["schemas"]["DriverStandingsResponse"]>(
    `/api/v1/seasons/${year}/driver-standings`,
    signal,
  );
  return response.data.items;
}

export async function getConstructorStandings(
  year: number,
  signal?: AbortSignal,
): Promise<ConstructorStanding[]> {
  const response = await get<
    components["schemas"]["ConstructorStandingsResponse"]
  >(`/api/v1/seasons/${year}/constructor-standings`, signal);
  return response.data.items;
}

export async function listDrivers(signal?: AbortSignal): Promise<Driver[]> {
  const response = await get<components["schemas"]["DriverListResponse"]>(
    "/api/v1/drivers",
    signal,
  );
  return response.data.items;
}

export async function getDriver(
  driverId: string,
  signal?: AbortSignal,
): Promise<Driver> {
  const response = await get<{ data: Driver }>(
    `/api/v1/drivers/${encodeURIComponent(driverId)}`,
    signal,
  );
  return response.data;
}

export async function listConstructors(
  signal?: AbortSignal,
): Promise<Constructor[]> {
  const response = await get<components["schemas"]["ConstructorListResponse"]>(
    "/api/v1/teams",
    signal,
  );
  return response.data.items;
}

export async function getConstructor(
  teamId: string,
  signal?: AbortSignal,
): Promise<Constructor> {
  const response = await get<{ data: Constructor }>(
    `/api/v1/teams/${encodeURIComponent(teamId)}`,
    signal,
  );
  return response.data;
}

export async function listRaceSessions(
  raceId: string,
  signal?: AbortSignal,
): Promise<Session[]> {
  const response = await get<components["schemas"]["SessionListResponse"]>(
    `/api/v1/races/${raceId}/sessions`,
    signal,
  );
  return response.data.items;
}

export async function getClassification(
  sessionId: string,
  signal?: AbortSignal,
): Promise<Classification> {
  const response = await get<components["schemas"]["ClassificationResponse"]>(
    `/api/v1/sessions/${sessionId}/classification`,
    signal,
  );
  return response.data;
}

export async function getLiveTiming(signal?: AbortSignal): Promise<LiveTiming> {
  const response = await get<components["schemas"]["LiveTimingResponse"]>(
    "/api/v1/live/timing",
    signal,
  );
  return response.data;
}
