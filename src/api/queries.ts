import { queryOptions } from "@tanstack/react-query";
import {
  getConstructorStandings,
  getConstructor,
  getClassification,
  getCurrentSeason,
  getDriverStandings,
  getDriver,
  getNextRace,
  listRaceSessions,
  listConstructors,
  listDrivers,
  listSeasonRaces,
} from "./client";

export const currentSeasonQuery = () =>
  queryOptions({
    queryKey: ["season", "current"],
    queryFn: ({ signal }) => getCurrentSeason(signal),
    staleTime: 5 * 60_000,
  });

export const nextRaceQuery = () =>
  queryOptions({
    queryKey: ["race", "next"],
    queryFn: ({ signal }) => getNextRace(signal),
    staleTime: 60_000,
  });

export const seasonRacesQuery = (year: number) =>
  queryOptions({
    queryKey: ["season", year, "races"],
    queryFn: ({ signal }) => listSeasonRaces(year, signal),
    staleTime: 5 * 60_000,
  });

export const driverStandingsQuery = (year: number) =>
  queryOptions({
    queryKey: ["season", year, "driver-standings"],
    queryFn: ({ signal }) => getDriverStandings(year, signal),
    staleTime: 5 * 60_000,
  });

export const constructorStandingsQuery = (year: number) =>
  queryOptions({
    queryKey: ["season", year, "constructor-standings"],
    queryFn: ({ signal }) => getConstructorStandings(year, signal),
    staleTime: 5 * 60_000,
  });

export const driversQuery = () =>
  queryOptions({
    queryKey: ["drivers"],
    queryFn: ({ signal }) => listDrivers(signal),
    staleTime: 5 * 60_000,
  });

export const driverQuery = (driverId: string) =>
  queryOptions({
    queryKey: ["driver", driverId],
    queryFn: ({ signal }) => getDriver(driverId, signal),
    staleTime: 5 * 60_000,
  });

export const constructorsQuery = () =>
  queryOptions({
    queryKey: ["constructors"],
    queryFn: ({ signal }) => listConstructors(signal),
    staleTime: 5 * 60_000,
  });

export const constructorQuery = (teamId: string) =>
  queryOptions({
    queryKey: ["constructor", teamId],
    queryFn: ({ signal }) => getConstructor(teamId, signal),
    staleTime: 5 * 60_000,
  });

export const raceSessionsQuery = (raceId: string) =>
  queryOptions({
    queryKey: ["race", raceId, "sessions"],
    queryFn: ({ signal }) => listRaceSessions(raceId, signal),
    staleTime: 60_000,
  });

export const classificationQuery = (sessionId: string) =>
  queryOptions({
    queryKey: ["session", sessionId, "classification"],
    queryFn: ({ signal }) => getClassification(sessionId, signal),
    staleTime: 5 * 60_000,
  });
