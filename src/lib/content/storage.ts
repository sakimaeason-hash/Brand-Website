import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { sanitizeFileName, validateImage } from "./validation";

export type ContentImageScope = "products" | "stories";

function getStorageClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase Storage is not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function bucketName() {
  return process.env.SUPABASE_STORAGE_BUCKET || "content-media";
}

export async function uploadContentImage(scope: ContentImageScope, recordId: string, file: File, index: number) {
  if (!/^[a-z]+$/.test(scope) || !/^[a-zA-Z0-9_-]+$/.test(recordId) || !Number.isInteger(index) || index < 0) throw new Error("Invalid content image path");
  validateImage(file);
  const path = `${scope}/${recordId}/${randomUUID()}-${index}-${sanitizeFileName(file.name)}`;
  const client = getStorageClient();
  const body = new Uint8Array(await file.arrayBuffer());
  const result = await client.storage.from(bucketName()).upload(path, body, { contentType: file.type, upsert: false });
  if (result.error) throw result.error;
  const { data } = client.storage.from(bucketName()).getPublicUrl(path);
  return { storagePath: path, publicUrl: data.publicUrl, originalName: file.name };
}

export async function removeContentImage(path: string) {
  if (!/^(products|stories)\/[a-zA-Z0-9_-]+\/[a-f0-9-]+-\d+-[a-zA-Z0-9._-]+$/.test(path)) throw new Error("Invalid content image path");
  const { error } = await getStorageClient().storage.from(bucketName()).remove([path]);
  if (error) throw error;
}
