export const checkPermission = (user, permission) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return user.permissions?.includes(permission) || false;
};

export const hasRole = (user, role) => user?.role === role;

export const hasAnyRole = (user, roles) => roles.includes(user?.role);

export const hasAllRoles = (user, roles) => 
  roles.every(role => user?.roles?.includes(role));