Puedes acceder a cualquiera pagina de la aplicación (exceptuando la administración), para iniciar sesión tienes los usuarios siguientes (como mínimo):
usuario: usuario
rol: usuario
contraseña: abc123..
usuario: administrador
rol: administrador
contraseña: abc123..
En caso de acceder como administrador sera redireccionado al panel de administración con el CRUD de todos los objetos necesarios con la lista incluida (el CRUD usuarios, foros y comentarios usan mockapi el resto se guarda en localstorage)
Nota: 
- Se puede acceder a las otras paginas sin iniciar sesión pero si se crea un comentario, foro u otro objeto, no funcionará, es necesario loguearse
- Hay un menú que varia según el estado de la sesión, es decir, sin sesión de usuario solo existirán dos opciones o registrarse o iniciar sesión. En el otro caso, hay enlaces para las publicaciones propias del usuario, subir una publicación o acceder a administración (este ultimo no funciona si no es admin)
