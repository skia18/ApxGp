import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  getCurrentSeason,
  getDriver,
  listConstructors,
  listDrivers,
} from "./client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("API client", () => {
  it("unwraps successful data envelopes", async () => {
    const season = {
      id: "4f603735-ef8c-4894-8df2-a9ef98df38ba",
      year: 2026,
      isCurrent: true,
      updatedAt: "2026-10-27T00:00:00Z",
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: season }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getCurrentSeason()).resolves.toEqual(season);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8081/api/v1/seasons/current",
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
  });

  it("preserves structured API errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: "not_found",
              message: "The requested season was not found.",
              requestId: "apx-123",
            },
          }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const error = await getCurrentSeason().catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 404,
      code: "not_found",
      requestId: "apx-123",
      message: "The requested season was not found.",
    });
  });

  it("reads grid collections and encodes profile identifiers", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ data: { items: [{ slug: "norris" }], total: 1 } }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ data: { items: [{ slug: "mclaren" }], total: 1 } }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { slug: "norris" } })),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(listDrivers()).resolves.toEqual([{ slug: "norris" }]);
    await expect(listConstructors()).resolves.toEqual([{ slug: "mclaren" }]);
    await getDriver("name/with space");

    expect(fetchMock.mock.calls[2]?.[0]).toBe(
      "http://localhost:8081/api/v1/drivers/name%2Fwith%20space",
    );
  });
});
