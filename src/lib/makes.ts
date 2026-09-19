/**
 * The `makes` table — every manufacturer the site knows about. Loaded once at
 * start-up (src/bootstrap.ts) into src/data/cars.ts, which is what pages read.
 */
import { MakeInfo, slugify } from "@/data/cars";
import { supabase } from "@/lib/supabase";

type MakeRow = { id: number; name: string; display_name: string; country: string };

export const fetchMakes = async (): Promise<MakeInfo[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("makes")
    .select("id, name, display_name, country")
    .order("display_name");

  if (error) throw error;

  return ((data ?? []) as MakeRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    displayName: row.display_name,
    country: row.country,
    slug: slugify(row.display_name),
  }));
};
