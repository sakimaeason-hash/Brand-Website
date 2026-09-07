import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";

function modelFields(modelName: string) {
  const model = Prisma.dmmf.datamodel.models.find((entry) => entry.name === modelName);
  if (!model) throw new Error(`Missing Prisma model: ${modelName}`);
  return model.fields.map((field) => field.name);
}

describe("admin content schema", () => {
  it("does not add unmigrated content ownership fields", () => {
    expect(modelFields("User")).not.toEqual(expect.arrayContaining(["products", "stories"]));
    expect(modelFields("Product")).not.toEqual(expect.arrayContaining(["User", "userId"]));
    expect(modelFields("CustomerStory")).not.toEqual(expect.arrayContaining(["User", "userId"]));
  });
});
