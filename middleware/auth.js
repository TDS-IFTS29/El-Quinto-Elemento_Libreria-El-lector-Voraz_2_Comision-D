// Middleware de autenticación para verificar si el usuario está logueado
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    // Si es una petición AJAX/API, devolver JSON
    const isJsonRequest = req.xhr || 
                         (req.headers.accept && req.headers.accept.includes('application/json')) ||
                         (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) ||
                         req.path.startsWith('/api/') ||
                         req.originalUrl.startsWith('/api/');
    
    if (isJsonRequest) {
      return res.status(401).json({ error: 'Acceso no autorizado. Debe iniciar sesión.' });
    }
    // Si es una petición normal, redirigir al login
    return res.redirect('/login?error=2&mensaje=Debe iniciar sesión para acceder a esta página');
  }
  
  // Agregar datos del usuario a la request para usarlos en las rutas
  req.usuario = req.session.user;
  next();
}

// Middleware de autorización para verificar roles específicos
function requireRole(rolesPermitidos) {
  return function(req, res, next) {
    try {
      // Primero verificar si está autenticado
      if (!req.session || !req.session.user) {
        const isJsonRequest = req.xhr || 
                             (req.headers.accept && req.headers.accept.includes('application/json')) ||
                             (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) ||
                             req.path.startsWith('/api/') ||
                             req.originalUrl.startsWith('/api/');
        
        if (isJsonRequest) {
          return res.status(401).json({ error: 'Acceso no autorizado. Debe iniciar sesión.' });
        }
        return res.redirect('/login?error=2&mensaje=Debe iniciar sesión para acceder a esta página');
      }
      
      // Agregar datos del usuario a la request
      req.usuario = req.session.user;

      if (!rolesPermitidos.includes(req.usuario.rol)) {
        const isJsonRequest = req.xhr || 
                             (req.headers.accept && req.headers.accept.indexOf('json') > -1) ||
                             (req.headers['content-type'] && req.headers['content-type'].indexOf('json') > -1) ||
                             req.path.startsWith('/api/');

        if (isJsonRequest) {
          return res.status(403).json({ error: 'No tiene permisos para realizar esta acción.' });
        }
        return res.status(403).render('error', { 
          mensaje: 'No tiene permisos para acceder a esta página.',
          usuario: req.usuario 
        });
      }

      next();
    } catch (error) {
      console.error('Error en requireRole middleware:', error);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  };
}

// Middleware para verificar si el usuario puede acceder a datos de otro usuario
function requireOwnerOrAdmin(req, res, next) {
  try {
    // Primero verificar si está autenticado
    if (!req.session || !req.session.user) {
      const isJsonRequest = req.xhr || 
                           (req.headers.accept && req.headers.accept.includes('application/json')) ||
                           (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) ||
                           req.path.startsWith('/api/') ||
                           req.originalUrl.startsWith('/api/');
      
      if (isJsonRequest) {
        return res.status(401).json({ error: 'Acceso no autorizado. Debe iniciar sesión.' });
      }
      return res.redirect('/login?error=2&mensaje=Debe iniciar sesión para acceder a esta página');
    }
    
    // Agregar datos del usuario a la request
    req.usuario = req.session.user;
    
    const usuarioId = req.params.id;
    
    // Si es admin, puede acceder a cualquier usuario
    if (req.usuario.rol === 'admin') {
      return next();
    }
    
    // Si no es admin, solo puede acceder a sus propios datos
    if (req.usuario._id.toString() !== usuarioId.toString()) {
      const isJsonRequest = req.xhr || 
                           (req.headers.accept && req.headers.accept.indexOf('json') > -1) ||
                           (req.headers['content-type'] && req.headers['content-type'].indexOf('json') > -1) ||
                           req.path.startsWith('/api/');
      
      if (isJsonRequest) {
        return res.status(403).json({ error: 'Solo puede acceder a sus propios datos.' });
      }
      return res.status(403).render('error', { 
        mensaje: 'Solo puede acceder a sus propios datos.',
        usuario: req.usuario 
      });
    }
    
    next();
  } catch (error) {
    console.error('Error en requireOwnerOrAdmin middleware:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

module.exports = {
  requireAuth,
  requireRole,
  requireOwnerOrAdmin
};
