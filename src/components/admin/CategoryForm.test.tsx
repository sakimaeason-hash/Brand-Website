import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { push, refresh } = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

import { CategoryForm, type CategoryFormData } from "./CategoryForm";

function existingCategory(overrides: Partial<CategoryFormData> = {}): CategoryFormData {
  return {
    id: "cat-1",
    updatedAt: "2026-09-01T00:00:00.000Z",
    name: "Powered",
    slug: "powered",
    role: "PRODUCT",
    recommendationProfile: "NONE",
    description: null,
    sortOrder: 0,
    status: "ACTIVE",
    templateVersion: 1,
    productCount: 0,
    fields: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id: "cat-2", slug: "shower-chairs" }), { status: 201 }));
});
afterEach(() => cleanup());

describe("CategoryForm", () => {
  it("adds a custom specification field and submits the category DTO", async () => {
    render(<CategoryForm />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Shower Chairs" } });
    fireEvent.click(screen.getByRole("button", { name: "Add field" }));
    expect(screen.getByLabelText("Field key 1")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Field key 1"), { target: { value: "seatMaterial" } });
    fireEvent.change(screen.getByLabelText("Field label 1"), { target: { value: "Seat material" } });
    fireEvent.click(screen.getByRole("button", { name: "Save category" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    const request = vi.mocked(fetch).mock.calls[0][1];
    const payload = JSON.parse(String(request?.body));
    expect(payload.fields[0]).toMatchObject({ key: "seatMaterial", label: "Seat material", isProtected: false });
  });

  it("shows protected fields when a wheelchair recommendation profile is selected", () => {
    render(<CategoryForm />);
    fireEvent.change(screen.getByLabelText("Recommendation profile"), { target: { value: "POWERED_WHEELCHAIR" } });
    expect(screen.getByText(/maxUserWeight/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /remove maxUserWeight/i })).not.toBeInTheDocument();
  });

  it("collects units, options, help text, and numeric bounds for custom fields", () => {
    render(<CategoryForm />);
    fireEvent.click(screen.getByRole("button", { name: "Add field" }));

    fireEvent.change(screen.getByLabelText("Data type 1"), { target: { value: "NUMBER" } });
    fireEvent.change(screen.getByLabelText("Unit family 1"), { target: { value: "LENGTH" } });
    expect(screen.getByLabelText("Display unit 1")).toHaveValue("mm");
    expect(screen.getByLabelText("Minimum value 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Maximum value 1")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Help text 1"), { target: { value: "Measure the usable surface." } });

    fireEvent.change(screen.getByLabelText("Data type 1"), { target: { value: "SELECT" } });
    expect(screen.getByLabelText("Options 1")).toBeInTheDocument();
  });

  it("submits editable display metadata for existing protected fields", async () => {
    render(<CategoryForm initialData={{
      id: "cat-1",
      updatedAt: "2026-09-01T00:00:00.000Z",
      name: "Powered",
      slug: "powered",
      role: "PRODUCT",
      recommendationProfile: "POWERED_WHEELCHAIR",
      description: null,
      sortOrder: 0,
      status: "ACTIVE",
      templateVersion: 1,
      productCount: 0,
      fields: [{
        id: "field-weight",
        key: "maxUserWeight",
        label: "Maximum user weight",
        group: "Fit & seating",
        scope: "VARIANT",
        dataType: "NUMBER",
        unitFamily: "WEIGHT",
        defaultDisplayUnit: "kg",
        options: [],
        helpText: null,
        minValue: null,
        maxValue: null,
        requiredForPublish: false,
        requiredForRecommendation: true,
        semanticKey: "maxUserWeight",
        isProtected: true,
        status: "ACTIVE",
        sortOrder: 0,
      }],
    }} />);

    fireEvent.change(screen.getByLabelText("Protected field label maxUserWeight"), { target: { value: "Weight capacity" } });
    fireEvent.change(screen.getByLabelText("Protected field help maxUserWeight"), { target: { value: "Use verified manufacturer data." } });
    fireEvent.change(screen.getByLabelText("Protected field order maxUserWeight"), { target: { value: "9" } });
    fireEvent.click(screen.getByRole("button", { name: "Save category" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    const request = vi.mocked(fetch).mock.calls[0][1];
    const body = JSON.parse(String(request?.body));
    expect(body.payload.fields).toContainEqual(expect.objectContaining({
      key: "maxUserWeight",
      label: "Weight capacity",
      helpText: "Use verified manufacturer data.",
      sortOrder: 9,
      isProtected: true,
    }));
  });

  it("submits edits in the strict PATCH envelope", async () => {
    render(<CategoryForm initialData={existingCategory()} />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Power Chairs" } });
    fireEvent.click(screen.getByRole("button", { name: "Save category" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    const request = vi.mocked(fetch).mock.calls[0][1];
    const body = JSON.parse(String(request?.body));
    expect(body).toEqual({
      action: "save",
      updatedAt: "2026-09-01T00:00:00.000Z",
      payload: {
        name: "Power Chairs",
        slug: "powered",
        description: null,
        role: "PRODUCT",
        recommendationProfile: "NONE",
        sortOrder: 0,
        fields: [],
      },
    });
    expect(body.payload).not.toHaveProperty("updatedAt");
  });

  it("submits options, bounds, help text, and sort order in field DTOs", async () => {
    render(<CategoryForm initialData={existingCategory({
      fields: [{
        id: "field-finish",
        key: "finish",
        label: "Finish",
        group: "Appearance",
        scope: "PRODUCT",
        dataType: "SELECT",
        unitFamily: "NONE",
        defaultDisplayUnit: null,
        options: ["Matte", "Gloss"],
        helpText: "Choose the catalog finish.",
        minValue: null,
        maxValue: null,
        requiredForPublish: false,
        requiredForRecommendation: false,
        semanticKey: null,
        isProtected: false,
        status: "ACTIVE",
        sortOrder: 4,
      }, {
        id: "field-weight",
        key: "transportWeight",
        label: "Transport weight",
        group: "Transport",
        scope: "PRODUCT",
        dataType: "NUMBER",
        unitFamily: "WEIGHT",
        defaultDisplayUnit: "kg",
        options: [],
        helpText: "Without removable accessories.",
        minValue: 0,
        maxValue: 250,
        requiredForPublish: true,
        requiredForRecommendation: false,
        semanticKey: null,
        isProtected: false,
        status: "ACTIVE",
        sortOrder: 7,
      }],
    })} />);
    fireEvent.click(screen.getByRole("button", { name: "Save category" }));

    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    const request = vi.mocked(fetch).mock.calls[0][1];
    const body = JSON.parse(String(request?.body));
    expect(body).toEqual(expect.objectContaining({
      payload: expect.objectContaining({
        fields: expect.arrayContaining([
          expect.objectContaining({
            key: "finish",
            options: ["Matte", "Gloss"],
            helpText: "Choose the catalog finish.",
            sortOrder: 4,
          }),
          expect.objectContaining({
            key: "transportWeight",
            minValue: 0,
            maxValue: 250,
            helpText: "Without removable accessories.",
            sortOrder: 7,
          }),
        ]),
      }),
    }));
  });

  it("locks an established recommendation profile that already has protected fields", () => {
    render(<CategoryForm initialData={existingCategory({
      recommendationProfile: "POWERED_WHEELCHAIR",
      fields: [{
        key: "maxUserWeight",
        label: "Maximum user weight",
        group: "Fit & seating",
        scope: "VARIANT",
        dataType: "NUMBER",
        unitFamily: "WEIGHT",
        defaultDisplayUnit: "kg",
        options: [],
        helpText: null,
        minValue: null,
        maxValue: null,
        requiredForPublish: false,
        requiredForRecommendation: true,
        semanticKey: "maxUserWeight",
        isProtected: true,
        status: "ACTIVE",
        sortOrder: 0,
      }],
    })} />);

    expect(screen.getByLabelText("Recommendation profile")).toBeDisabled();
  });

  it("requires confirmation before archiving an existing category", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<CategoryForm initialData={{ id: "cat-1", updatedAt: "2026-09-01T00:00:00.000Z", name: "Powered", slug: "powered", role: "PRODUCT", recommendationProfile: "NONE", description: null, sortOrder: 0, status: "ACTIVE", templateVersion: 1, fields: [], productCount: 0 }} />);
    fireEvent.click(screen.getByRole("button", { name: "Archive category" }));
    expect(fetch).not.toHaveBeenCalled();
  });
});
