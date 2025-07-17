export interface RolePermissions {
  // Leads
  leads: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    assign: boolean;
    export: boolean;
    import: boolean;
  };
  
  // Appointments
  appointments: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    viewAll: boolean;
  };
  
  // Meetings
  meetings: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    moderate: boolean;
  };
  
  // Tasks
  tasks: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    assign: boolean;
  };
  
  // Contacts
  contacts: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  
  // Scripts
  scripts: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  
  // Reports
  reports: {
    view: boolean;
    export: boolean;
    advanced: boolean;
  };
  
  // Schedule Blocks
  scheduleBlocks: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  
  // Partners
  partners: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  
  // Administration
  admin: {
    manageUsers: boolean;
    manageRoles: boolean;
    companySettings: boolean;
    systemSettings: boolean;
  };
}

export const DEFAULT_PERMISSIONS: Record<string, RolePermissions> = {
  'Administrador': {
    leads: { view: true, create: true, edit: true, delete: true, assign: true, export: true, import: true },
    appointments: { view: true, create: true, edit: true, delete: true, viewAll: true },
    meetings: { view: true, create: true, edit: true, delete: true, moderate: true },
    tasks: { view: true, create: true, edit: true, delete: true, assign: true },
    contacts: { view: true, create: true, edit: true, delete: true },
    scripts: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, export: true, advanced: true },
    scheduleBlocks: { view: true, create: true, edit: true, delete: true },
    partners: { view: true, create: true, edit: true, delete: true },
    admin: { manageUsers: true, manageRoles: true, companySettings: true, systemSettings: false }
  },
  'SDR': {
    leads: { view: true, create: true, edit: true, delete: false, assign: false, export: true, import: true },
    appointments: { view: true, create: true, edit: true, delete: false, viewAll: false },
    meetings: { view: true, create: true, edit: true, delete: false, moderate: false },
    tasks: { view: true, create: true, edit: true, delete: false, assign: false },
    contacts: { view: true, create: true, edit: true, delete: false },
    scripts: { view: true, create: false, edit: false, delete: false },
    reports: { view: true, export: false, advanced: false },
    scheduleBlocks: { view: true, create: true, edit: true, delete: true },
    partners: { view: true, create: false, edit: false, delete: false },
    admin: { manageUsers: false, manageRoles: false, companySettings: false, systemSettings: false }
  },
  'Closer': {
    leads: { view: true, create: false, edit: true, delete: false, assign: false, export: true, import: false },
    appointments: { view: true, create: true, edit: true, delete: false, viewAll: true },
    meetings: { view: true, create: true, edit: true, delete: false, moderate: false },
    tasks: { view: true, create: true, edit: true, delete: false, assign: false },
    contacts: { view: true, create: true, edit: true, delete: false },
    scripts: { view: true, create: true, edit: true, delete: false },
    reports: { view: true, export: true, advanced: true },
    scheduleBlocks: { view: true, create: true, edit: true, delete: true },
    partners: { view: true, create: false, edit: false, delete: false },
    admin: { manageUsers: false, manageRoles: false, companySettings: false, systemSettings: false }
  },
  'Visitante': {
    leads: { view: true, create: false, edit: false, delete: false, assign: false, export: false, import: false },
    appointments: { view: true, create: false, edit: false, delete: false, viewAll: false },
    meetings: { view: true, create: false, edit: false, delete: false, moderate: false },
    tasks: { view: true, create: false, edit: false, delete: false, assign: false },
    contacts: { view: true, create: false, edit: false, delete: false },
    scripts: { view: true, create: false, edit: false, delete: false },
    reports: { view: true, export: false, advanced: false },
    scheduleBlocks: { view: false, create: false, edit: false, delete: false },
    partners: { view: true, create: false, edit: false, delete: false },
    admin: { manageUsers: false, manageRoles: false, companySettings: false, systemSettings: false }
  },
  'Supervisor': {
    leads: { view: true, create: true, edit: true, delete: true, assign: true, export: true, import: true },
    appointments: { view: true, create: true, edit: true, delete: true, viewAll: true },
    meetings: { view: true, create: true, edit: true, delete: true, moderate: true },
    tasks: { view: true, create: true, edit: true, delete: true, assign: true },
    contacts: { view: true, create: true, edit: true, delete: true },
    scripts: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, export: true, advanced: true },
    scheduleBlocks: { view: true, create: true, edit: true, delete: true },
    partners: { view: true, create: true, edit: true, delete: true },
    admin: { manageUsers: true, manageRoles: false, companySettings: false, systemSettings: false }
  },
  'Social Seller': {
    leads: { view: true, create: true, edit: true, delete: false, assign: false, export: true, import: true },
    appointments: { view: true, create: true, edit: true, delete: false, viewAll: false },
    meetings: { view: true, create: true, edit: true, delete: false, moderate: false },
    tasks: { view: true, create: true, edit: true, delete: false, assign: false },
    contacts: { view: true, create: true, edit: true, delete: false },
    scripts: { view: true, create: true, edit: true, delete: false },
    reports: { view: true, export: true, advanced: false },
    scheduleBlocks: { view: true, create: true, edit: true, delete: true },
    partners: { view: true, create: true, edit: true, delete: false },
    admin: { manageUsers: false, manageRoles: false, companySettings: false, systemSettings: false }
  },
  'Vendedor': {
    leads: { view: true, create: true, edit: true, delete: false, assign: false, export: true, import: false },
    appointments: { view: true, create: true, edit: true, delete: false, viewAll: false },
    meetings: { view: true, create: true, edit: true, delete: false, moderate: false },
    tasks: { view: true, create: true, edit: true, delete: false, assign: false },
    contacts: { view: true, create: true, edit: true, delete: false },
    scripts: { view: true, create: true, edit: true, delete: false },
    reports: { view: true, export: true, advanced: false },
    scheduleBlocks: { view: true, create: true, edit: true, delete: true },
    partners: { view: true, create: false, edit: false, delete: false },
    admin: { manageUsers: false, manageRoles: false, companySettings: false, systemSettings: false }
  }
};

export type PermissionModule = keyof RolePermissions;
export type PermissionAction<T extends PermissionModule> = keyof RolePermissions[T];