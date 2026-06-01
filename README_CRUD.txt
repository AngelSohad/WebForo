PARCHE: CRUD COMPLETO DE USUARIO Y ADMINISTRADOR

Archivos modificados:
- server/index.js
- src/pages/Admin.jsx
- src/components/windows/LoginWindow.jsx
- src/components/windows/RegisterWindow.jsx

Cómo ponerlo:
1) Copia cada archivo del parche en la misma ruta de tu proyecto.
2) Ejecuta el proyecto:
   npm run dev
3) Si tu tabla usuarios no tiene las columnas rol/estado/plan, puedes ejecutar CRUD_USUARIOS_ADMIN.sql.
   Nota: server/index.js también intenta agregar esas columnas automáticamente al iniciar.
4) Crea un administrador inicial desde PowerShell:

Invoke-RestMethod -Uri "http://localhost:3001/api/usuarios" `
-Method POST `
-Headers @{"Content-Type"="application/json"} `
-Body '{
"nombre":"Admin",
"email":"admin@gmail.com",
"password":"123456",
"rol":"admin",
"estado":"activo",
"plan":"vip"
}'

5) Inicia sesión en la app con:
   email: admin@gmail.com
   password: 123456

6) Al iniciar sesión como admin, la app te manda a /admin.

Qué incluye:
- Crear usuario/admin
- Ver usuario/admin
- Editar usuario/admin
- Eliminar usuario/admin
- Buscar por nombre/email
- Filtrar por rol
- Filtrar por estado
- Login de administrador desde MySQL, ya no por admin/admin123 en localStorage.
