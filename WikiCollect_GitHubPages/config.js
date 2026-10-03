// Configuration WikiCollect. Ne mets JAMAIS une clé service_role ici.
// La clé publishable/anon Supabase est conçue pour être utilisée côté navigateur,
// à condition que les politiques RLS du fichier supabase.sql soient activées.
window.WIKICOLLECT_CONFIG = {
  supabaseUrl: "https://TON-PROJET.supabase.co",
  supabaseAnonKey: "TA_CLE_PUBLISHABLE_OU_ANON"
};
