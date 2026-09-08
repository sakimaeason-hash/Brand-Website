import { del, put } from "@vercel/blob";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { sanitizeFileName, validateImage } from "./validation";

export type ContentImageScope = "products" | "stories";

export async function uploadContentImage(scope: ContentImageScope, recordId: string, file: File, index: number) {
  if (!/^[a-z]+$/.test(scope) || !/^[a-zA-Z0-9_-]+$/.test(recordId) || !Number.isInteger(index) || index < 0) throw new Error("Invalid content image path");
  validateImage(file);
  const path = `${scope}/${recordId}/${randomUUID()}-${index}-${sanitizeFileName(file.name)}`;
  const blob = await put(path, file, { access: "public", addRandomSuffix: false, contentType: file.type });
  return { storagePath: blob.url, publicUrl: blob.url, originalName: file.name };
}

export async function removeContentImage(path: string) {
  if (/^https:\/\/[a-zA-Z0-9.-]+\.public\.blob\.vercel-storage\.com\/(products|stories)\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9-]+-\d+-[a-zA-Z0-9._-]+$/.test(path)) {
    await del(path);
    return;
  }
  if (!/^(products|stories)\/[a-zA-Z0-9_-]+\/[a-f0-9-]+-\d+-[a-zA-Z0-9._-]+$/.test(path)) throw new Error("Invalid content image path");
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Legacy Supabase Storage is not configured");
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "content-media";
  const { error } = await createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }).storage.from(bucket).remove([path]);
  if (error) throw error;
}
