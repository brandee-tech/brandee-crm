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
  
  // Administration
  admin: {
    manageUsers: boolean;
    manageRoles: boolean;
    companySettings: boolean;
    systemSettings: boolean;
  };
}

export const DEFAULT_PERMISSIONS: Record<string, RolePermissions> = {
  'Admin': {
    leads: { view: true, create: true, edit: true, delete: true, assign: true, export: true, import: true },
    appointments: { view: true, create: true, edit: true, delete: true, viewAll: true },
    meetings: { view: true, create: true, edit: true, delete: true, moderate: true },
    tasks: { view: true, create: true, edit: true, delete: true, assign: true },
    contacts: { view: true, create: true, edit: true, delete: true },
    scripts: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, export: true, advanced: true },
    admin: { manageUsers: true, manageRoles: true, companySettings: true, systemSettings: true }
  },
  'SDR': {
    leads: { view: true, create: true, edit: true, delete: false, assign: false, export: true, import: true },
    appointments: { view: true, create: true, edit: true, delete: false, viewAll: false },
    meetings: { view: true, create: true, edit: true, delete: false, moderate: false },
    tasks: { view: true, create: true, edit: true, delete: false, assign: false },
    contacts: { view: true, create: true, edit: true, delete: false },
    scripts: { view: true, create: false, edit: false, delete: false },
    reports: { view: true, export: false, advanced: false },
    admin: { manageUsers: false, manageRoles: false, companySettings: false, systemSettings: false }
  },
  'Closer': {
    leads: { view: true, create: false, edit: true, delete: false, assign: true, export: true, import: false },
    appointments: { view: true, create: true, edit: true, delete: false, viewAll: true },
    meetings: { view: true, create: true, edit: true, delete: false, moderate: false },
    tasks: { view: true, create: true, edit: true, delete: false, assign: false },
    contacts: { view: true, create: false, edit: true, delete: false },
    scripts: { view: true, create: true, edit: true, delete: false },
    reports: { view: true, export: true, advanced: true },
    admin: { manageUsers: false, manageRoles: false, companySettings: false, systemSettings: false }
  }
};

export type PermissionModule = keyof RolePermissions;
export type PermissionAction<T extends PermissionModule> = keyof RolePermissions[T];