"use client";

import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { SpecificationFieldDefinition, SpecificationInput, StoredSpecification } from "@/lib/catalog/types";
import { MediaUploader, type PendingMedia } from "./MediaUploader";
import { ProductAccessoriesEditor } from "./ProductAccessoriesEditor";
import type { ProductOverviewDraft } from "./ProductOverviewFields";
import { ProductOverviewFields } from "./ProductOverviewFields";
import { ProductSpecificationEditor } from "./ProductSpecificationEditor";
import { createBlankVariant, ProductVariantEditor } from "./ProductVariantEditor";
import type {
  AccessoryOption,
  InBoxDraft,
  ProductCategoryOption,
  ProductFieldError,
  ProductFormData,
  SpecificationDraft,
  SpecificationDraftMap,
  VariantDraft,
} from "./ProductEditorTypes";

export type { ProductFormData } from "./ProductEditorTypes";

type ProductTab = "overview" | "specifications" | "variants" | "accessories" | "media";

const tabs: Array<{ id: ProductTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "specifications", label: "Specifications" },
  { id: "variants", label: "SKUs" },
  { id: "accessories", label: "Accessories" },
  { id: "media", label: "Media" },
];

function initialOverview(record: ProductFormData | undefined, categories: readonly ProductCategoryOption[]): ProductOverviewDraft {
  return {
    name: record?.name ?? "",
    model: record?.model ?? "",
    categoryId: record?.categoryId ?? categories[0]?.id ?? "",
    tagline: record?.tagline ?? "",
    description: record?.description ?? "",
    price: record ? String(record.price) : "",
    originalPrice: record?.originalPrice == null ? "" : String(record.originalPrice),
    amazonLink: record?.amazonLink ?? "",
    features: record?.features.join("\n") ?? "",
    isFeatured: record?.isFeatured ?? false,
    sortOrder: String(record?.sortOrder ?? 0),
  };
}

function editableValue(field: SpecificationFieldDefinition, specification?: StoredSpecification): SpecificationDraft["value"] {
  const source = specification?.inputValue ?? specification?.value;
  if (field.dataType === "BOOLEAN") return typeof source === "boolean" ? source : false;
  if (field.dataType === "DIMENSIONS") {
    if (source && typeof source === "object") {
      return { length: String(source.length), width: String(source.width), height: String(source.height) };
    }
    return { length: "", width: "", height: "" };
  }
  if (typeof source === "number" || typeof source === "string") return String(source);
  return "";
}

function initialSpecifications(fields: readonly SpecificationFieldDefinition[], stored: Record<string, StoredSpecification> | undefined): SpecificationDraftMap {
  const drafts: SpecificationDraftMap = {};
  for (const field of fields) {
    const specification = stored?.[field.key];
    if (!specification) continue;
    drafts[field.key] = {
      status: specification.status,
      value: editableValue(field, specification),
      unit: specification.inputUnit ?? specification.unit ?? field.defaultDisplayUnit,
      sourceNote: specification.sourceNote ?? null,
    };
  }
  return drafts;
}

function initialVariants(record: ProductFormData | undefined, fields: readonly SpecificationFieldDefinition[]): VariantDraft[] {
  if (!record?.variants.length) return [createBlankVariant(0)];
  return record.variants
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((variant) => ({
      localKey: variant.id ?? `client-${variant.sku}`,
      id: variant.id,
      sku: variant.sku,
      factoryModel: variant.factoryModel ?? "",
      label: variant.label ?? "",
      colorName: variant.colorName ?? "",
      colorHex: variant.colorHex ?? "",
      priceOverride: variant.priceOverride == null ? "" : String(variant.priceOverride),
      originalPriceOverride: variant.originalPriceOverride == null ? "" : String(variant.originalPriceOverride),
      purchaseLinkOverride: variant.purchaseLinkOverride ?? "",
      overridePrice: variant.priceOverride != null,
      overrideOriginalPrice: variant.originalPriceOverride != null,
      overridePurchaseLink: variant.purchaseLinkOverride != null,
      specifications: initialSpecifications(fields, variant.specifications),
      isActive: variant.isActive,
      sortOrder: String(variant.sortOrder),
    }));
}

function initialInBoxItems(record?: ProductFormData): InBoxDraft[] {
  return record?.inBoxItems
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({ localKey: item.id ?? `client-box-${item.name}`, id: item.id, name: item.name, quantity: String(item.quantity), note: item.note ?? "", sortOrder: String(item.sortOrder) })) ?? [];
}

function initialMedia(record?: ProductFormData): PendingMedia[] {
  return record?.images
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => ({ id: image.id, preview: image.publicUrl, name: image.originalName, persisted: true, altText: image.altText ?? "", sourceNote: image.sourceNote ?? "" })) ?? [];
}

function nullableText(value: string): string | null {
  return value.trim() || null;
}

function optionalNumber(value: string, enabled = true): number | null {
  if (!enabled || value.trim() === "") return null;
  return Number(value);
}

function serializeSpecifications(fields: readonly SpecificationFieldDefinition[], value: SpecificationDraftMap): Record<string, SpecificationInput> {
  const output: Record<string, SpecificationInput> = {};
  for (const field of fields) {
    const draft = value[field.key];
    if (!draft) continue;
    const common = { status: draft.status, unit: draft.unit ?? field.defaultDisplayUnit, sourceNote: nullableText(draft.sourceNote ?? "") };
    if (draft.status === "NOT_PROVIDED") {
      output[field.key] = { ...common, value: null };
      continue;
    }
    if (field.dataType === "NUMBER") {
      output[field.key] = { ...common, value: typeof draft.value === "string" && draft.value.trim() !== "" ? Number(draft.value) : null };
    } else if (field.dataType === "DIMENSIONS") {
      const dimensions = draft.value && typeof draft.value === "object" ? draft.value : null;
      output[field.key] = {
        ...common,
        value: dimensions && Object.values(dimensions).every((part) => part.trim() !== "")
          ? { length: Number(dimensions.length), width: Number(dimensions.width), height: Number(dimensions.height) }
          : null,
      };
    } else if (field.dataType === "BOOLEAN") {
      output[field.key] = { ...common, value: draft.value === true };
    } else {
      output[field.key] = { ...common, value: typeof draft.value === "string" ? draft.value : "" };
    }
  }
  return output;
}

function isProductFieldError(value: unknown): value is ProductFieldError {
  if (!value || typeof value !== "object") return false;
  const error = value as Partial<ProductFieldError>;
  return ["overview", "specifications", "variants", "accessories", "media"].includes(error.tab ?? "")
    && typeof error.fieldKey === "string" && typeof error.message === "string";
}

export function ProductForm({ initialData, categories = [], accessories = [] }: {
  initialData?: ProductFormData;
  categories?: readonly ProductCategoryOption[];
  accessories?: readonly AccessoryOption[];
}) {
  const router = useRouter();
  const [overview, setOverview] = useState(() => initialOverview(initialData, categories));
  const initialCategory = categories.find((category) => category.id === (initialData?.categoryId ?? categories[0]?.id));
  const [productSpecifications, setProductSpecifications] = useState<SpecificationDraftMap>(() => initialSpecifications(initialCategory?.fields.filter((field) => field.scope === "PRODUCT") ?? [], initialData?.specifications));
  const [variants, setVariants] = useState<VariantDraft[]>(() => initialVariants(initialData, initialCategory?.fields.filter((field) => field.scope === "VARIANT") ?? []));
  const [inBoxItems, setInBoxItems] = useState<InBoxDraft[]>(() => initialInBoxItems(initialData));
  const [accessoryProductIds, setAccessoryProductIds] = useState<string[]>(() => initialData?.accessoryProductIds ?? []);
  const [images, setImages] = useState<PendingMedia[]>(() => initialMedia(initialData));
  const [activeTab, setActiveTab] = useState<ProductTab>("overview");
  const [fieldErrors, setFieldErrors] = useState<ProductFieldError[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const category = useMemo(() => categories.find((item) => item.id === overview.categoryId), [categories, overview.categoryId]);
  const productFields = category?.fields.filter((field) => field.scope === "PRODUCT") ?? [];
  const variantFields = category?.fields.filter((field) => field.scope === "VARIANT") ?? [];

  function changeCategory(categoryId: string) {
    setOverview((current) => ({ ...current, categoryId }));
    setProductSpecifications({});
    setVariants((current) => current.map((variant) => ({ ...variant, specifications: {} })));
    setFieldErrors([]);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setFieldErrors([]);
    try {
      if (!category) {
        setActiveTab("overview");
        setMessage("Select a product category before saving.");
        return;
      }
      const persisted = images.filter((item) => item.persisted);
      const pending = images.filter((item) => item.file && !item.persisted);
      const legacyCategory = category.recommendationProfile === "POWERED_WHEELCHAIR" || category.recommendationProfile === "MANUAL_WHEELCHAIR"
        ? "wheelchair"
        : category.slug;
      const payload: Record<string, unknown> = {
        name: overview.name,
        model: overview.model,
        category: initialData?.categoryId === category.id ? initialData.category : legacyCategory,
        categoryId: category.id,
        categoryTemplateVersion: category.templateVersion,
        tagline: nullableText(overview.tagline),
        description: nullableText(overview.description),
        price: Number(overview.price),
        originalPrice: optionalNumber(overview.originalPrice),
        amazonLink: nullableText(overview.amazonLink),
        weightCapacity: initialData?.weightCapacity ?? null,
        seatWidth: initialData?.seatWidth ?? null,
        range: initialData?.range ?? null,
        maxSpeed: initialData?.maxSpeed ?? null,
        productWeight: initialData?.productWeight ?? null,
        features: overview.features.split("\n").map((item) => item.trim()).filter(Boolean),
        isFeatured: overview.isFeatured,
        sortOrder: Number(overview.sortOrder),
        specifications: serializeSpecifications(productFields, productSpecifications),
        variants: variants.map((variant, sortOrder) => ({
          id: variant.id ?? variant.localKey,
          sku: variant.sku,
          factoryModel: nullableText(variant.factoryModel),
          label: nullableText(variant.label),
          colorName: nullableText(variant.colorName),
          colorHex: nullableText(variant.colorHex),
          priceOverride: optionalNumber(variant.priceOverride, variant.overridePrice),
          originalPriceOverride: optionalNumber(variant.originalPriceOverride, variant.overrideOriginalPrice),
          purchaseLinkOverride: variant.overridePurchaseLink ? nullableText(variant.purchaseLinkOverride) : null,
          specifications: serializeSpecifications(variantFields, variant.specifications),
          isActive: variant.isActive,
          sortOrder,
        })),
        inBoxItems: inBoxItems.map((item, sortOrder) => ({ id: item.id, name: item.name, quantity: Number(item.quantity), note: nullableText(item.note), sortOrder })),
        accessoryProductIds,
      };
      if (initialData) {
        payload.images = persisted.map((item, sortOrder) => ({ id: item.id, sortOrder, altText: nullableText(item.altText ?? ""), sourceNote: nullableText(item.sourceNote ?? "") }));
      }

      const body = new FormData();
      body.set("payload", JSON.stringify(payload));
      body.set("imageMetadata", JSON.stringify(pending.map((item) => ({ altText: nullableText(item.altText ?? ""), sourceNote: nullableText(item.sourceNote ?? "") }))));
      pending.forEach((item) => body.append("images", item.file as File));
      if (initialData) {
        body.set("action", "save-draft");
        body.set("updatedAt", initialData.updatedAt);
        const keptIds = new Set(persisted.map((item) => item.id));
        body.set("removeImageIds", JSON.stringify(initialData.images.filter((image) => !keptIds.has(image.id)).map((image) => image.id)));
      }

      const response = await fetch(initialData ? `/api/admin/products/${initialData.id}` : "/api/admin/products", { method: initialData ? "PATCH" : "POST", body });
      const result = await response.json();
      if (!response.ok) {
        const errors = Array.isArray(result.fields) ? result.fields.filter(isProductFieldError) : [];
        setFieldErrors(errors);
        if (errors[0]) {
          setActiveTab(errors[0].tab);
          window.setTimeout(() => document.getElementById(errors[0].variantId ? `variant-${errors[0].variantId}-${errors[0].fieldKey}` : `spec-${errors[0].fieldKey}`)?.focus(), 0);
        }
        setMessage(result.error || "Unable to save draft");
        return;
      }
      setMessage(initialData ? "Changes saved." : "Draft saved.");
      if (initialData) router.refresh();
      else if (typeof result.id === "string") router.push(`/admin/products/${result.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save draft");
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className="max-w-6xl space-y-6">
    <div role="tablist" aria-label="Product editor" className="flex max-w-full gap-1 overflow-x-auto border-b border-[#D9D0C9]">
      {tabs.map((tab) => {
        const label = tab.id === "variants" ? `${tab.label} (${variants.length})` : tab.label;
        return <button key={tab.id} id={`product-tab-${tab.id}`} type="button" role="tab" aria-selected={activeTab === tab.id} aria-controls={`product-panel-${tab.id}`} onClick={() => setActiveTab(tab.id)} className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold ${activeTab === tab.id ? "border-[#A66D45] text-[#6E4328]" : "border-transparent text-[#6B625D] hover:text-[#3D3330]"}`}>{label}</button>;
      })}
    </div>

    {tabs.map((tab) => {
      if (tab.id !== activeTab) return null;
      const label = tab.id === "variants" ? `${tab.label} (${variants.length})` : tab.label;
      return <section key={tab.id} id={`product-panel-${tab.id}`} role="tabpanel" aria-labelledby={`product-tab-${tab.id}`} aria-label={label} className="min-h-80 py-2">
        {tab.id === "overview" && <ProductOverviewFields value={overview} categories={categories} onChange={setOverview} onCategoryChange={changeCategory} />}
        {tab.id === "specifications" && <ProductSpecificationEditor fields={productFields} value={productSpecifications} onChange={setProductSpecifications} errors={fieldErrors.filter((error) => error.tab === "specifications")} />}
        {tab.id === "variants" && <ProductVariantEditor variants={variants} fields={variantFields} errors={fieldErrors.filter((error) => error.tab === "variants")} onChange={setVariants} />}
        {tab.id === "accessories" && <ProductAccessoriesEditor inBoxItems={inBoxItems} onInBoxItemsChange={setInBoxItems} accessoryProductIds={accessoryProductIds} onAccessoryProductIdsChange={setAccessoryProductIds} accessories={accessories} errors={fieldErrors.filter((error) => error.tab === "accessories")} />}
        {tab.id === "media" && <MediaUploader value={images} onChange={setImages} />}
      </section>;
    })}

    <div className="sticky bottom-0 flex flex-wrap items-center gap-4 border-t border-[#E1D8D1] bg-[#FFFCFA]/95 py-4 backdrop-blur">
      <button disabled={busy || images.some((item) => item.error)} className="inline-flex items-center gap-2 rounded bg-[#A66D45] px-5 py-3 font-semibold text-white hover:bg-[#8D5935] disabled:opacity-50"><Save aria-hidden="true" className="h-4 w-4" />{busy ? "Saving..." : initialData ? "Save changes" : "Save draft"}</button>
      {message && <p role="status" className="text-sm text-[#5C534E]">{message}</p>}
    </div>
  </form>;
}
