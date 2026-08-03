import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type AuthUser = {
  id: string;
  email: string;
};

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return { id: data.user.id, email: data.user.email! };
}

export async function signUp(email: string, password: string): Promise<{ message: string }> {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  return { message: "Conta criada! Verifique seu email para confirmar." };
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;
  return {
    id: data.session.user.id,
    email: data.session.user.email!,
  };
}
