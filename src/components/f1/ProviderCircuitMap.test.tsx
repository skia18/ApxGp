import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { LiveWeekend } from "@/api/client";
import { ProviderCircuitMap } from "./ProviderCircuitMap";

const circuit: LiveWeekend["circuit"] = {
  name: "Test Circuit",
  type: "Permanent",
  location: "Test City",
  country: "Test Country",
  rotation: 20,
  path: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
  ],
  corners: [{ number: 1, x: 100, y: 0 }],
};

describe("ProviderCircuitMap", () => {
  it("renders provider geometry and numbered corners", () => {
    const { container } = render(<ProviderCircuitMap circuit={circuit} />);

    expect(
      screen.getByRole("img", { name: "Test Circuit detailed circuit layout" }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("path")).toHaveLength(2);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders nothing when provider geometry is unavailable", () => {
    const { container } = render(
      <ProviderCircuitMap circuit={{ ...circuit, path: [] }} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
