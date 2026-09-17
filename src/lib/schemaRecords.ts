import { supabase } from "@/integrations/supabase/client";

export type SchemaRecord = {
  id: string;
  user_id: string | null;
  schema_type: string;
  name: string;
  description: string;
  url: string;
  image_url: string;
  author: string;
  schema_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export async function fetchSchemaRecords() {
  const { data, error } = await supabase
    .from("crm_schema_records")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) throw error;
  return (data ?? []) as SchemaRecord[];
}

export async function saveSchemaRecord(input: {
  id?: string;
  schema_type: string;
  name: string;
  description?: string;
  url?: string;
  image_url?: string;
  author?: string;
  schema_json: Record<string, unknown>;
}) {
  const { data: auth } = await supabase.auth.getUser();
  const payload = {
    user_id: auth.user?.id ?? null,
    schema_type: input.schema_type,
    name: input.name,
    description: input.description ?? "",
    url: input.url ?? "",
    image_url: input.image_url ?? "",
    author: input.author ?? "Crazy SEO Team",
    schema_json: input.schema_json,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("crm_schema_records")
      .update(payload)
      .eq("id", input.id)
      .select("*")
      .single();
    if (error) throw error;
    return data as SchemaRecord;
  }

  const { data, error } = await supabase
    .from("crm_schema_records")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as SchemaRecord;
}

export async function deleteSchemaRecord(id: string) {
  const { error } = await supabase.from("crm_schema_records").delete().eq("id", id);
  if (error) throw error;
}
