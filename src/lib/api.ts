import { supabase } from "@/integrations/supabase/client";

export type LedgerRow = {
  id: string;
  type: "contribution" | "disbursement" | "overhead";
  amount: number;
  recipient_business: string | null;
  vendor_name: string | null;
  description: string | null;
  reference: string | null;
  occurred_at: string;
};

export const ledgerQuery = {
  queryKey: ["ledger"],
  queryFn: async (): Promise<LedgerRow[]> => {
    const { data, error } = await supabase
      .from("fund_transactions")
      .select("id, type, amount, recipient_business, vendor_name, description, reference, occurred_at")
      .order("occurred_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as LedgerRow[];
  },
};

export const myBusinessesQuery = {
  queryKey: ["businesses"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

export const myApplicationsQuery = {
  queryKey: ["grant_applications"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("grant_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

export const approvalsQuery = {
  queryKey: ["trustee_approvals"],
  queryFn: async () => {
    const { data, error } = await supabase.from("trustee_approvals").select("*");
    if (error) throw error;
    return data ?? [];
  },
};

export const myRolesQuery = {
  queryKey: ["user_roles"],
  queryFn: async () => {
    const { data, error } = await supabase.from("user_roles").select("role");
    if (error) throw error;
    return (data ?? []).map((r) => r.role as string);
  },
};

export const myProfileQuery = {
  queryKey: ["profile"],
  queryFn: async () => {
    const { data, error } = await supabase.from("profiles").select("*").maybeSingle();
    if (error) throw error;
    return data;
  },
};
