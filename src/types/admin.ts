export interface Admin {
  id: string;
  email: string;
  role: 'super_admin' | 'outlet_admin';
  created_at: string;
  updated_at: string;
}

export interface Outlet {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  admin_id: string | null;
  created_at: string;
  updated_at: string;
}