import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase URL or Key");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default defineEventHandler(async (event) => {
  const body = await readMultipartFormData(event);
  if (!body) {
    throw new Error("No form data provided");
  }

  // Assuming file is under key 'file'
  const file = body.find((part) => part.name === "file");
  if (!file) {
    throw new Error("No file provided");
  }

  const { data, error } = await supabase.storage
    .from("uploads") // Your bucket name
    .upload(`menu/${Date.now()}_${file.filename}`, file.data, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  // Get the public URL of the uploaded file
  const { data: publicData } = supabase.storage
    .from("uploads")
    .getPublicUrl(data.path);

  return { url: publicData.publicUrl };
});
