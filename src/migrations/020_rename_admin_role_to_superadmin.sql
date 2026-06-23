BEGIN;

INSERT INTO roles (name, description)
VALUES ('superadmin', 'Super administrator')
ON CONFLICT (name) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT ur.user_id, superadmin_role.id
FROM user_roles ur
INNER JOIN roles admin_role ON admin_role.id = ur.role_id
CROSS JOIN roles superadmin_role
WHERE admin_role.name = 'admin'
  AND superadmin_role.name = 'superadmin'
ON CONFLICT DO NOTHING;

COMMIT;
