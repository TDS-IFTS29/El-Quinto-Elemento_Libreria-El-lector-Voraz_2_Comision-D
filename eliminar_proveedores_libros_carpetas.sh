# Script para eliminar carpetas vacías si es necesario
del /f /q "views\proveedor_libro\.keep"
del /f /q "public\js\proveedor_libro\.keep"
rmdir /s /q "views\proveedor_libro"
rmdir /s /q "public\js\proveedor_libro"
