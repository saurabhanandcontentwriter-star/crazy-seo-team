import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
try {
  await login(
    "crazyseoteam@gmail.com",
    "Crazyseoteam@#$2025"
  );

  window.location.href = "/admin/dashboard";
} catch (err) {
  alert(err instanceof Error ? err.message : "Login failed");
}
