import './style.css'
//import bcrypt from 'bcryptjs'

const usuarios = [
  { email: 'admin@example.com', password: 'admin123', rol: 'administrador' },
  { email: 'user@example.com', password: 'user123', rol: 'usuario' },
  { email: 'super@example.com', password: 'super123', rol: 'superadministrador' }
];

let productos = [
  ['001', 'Marca A', 'Proteína en polvo', 'Vainilla', 100],
  ['002', 'Marca B', 'Creatina', 'Sin sabor', 50],
  ['003', 'Marca C', 'BCAA', 'Frutas', 75]
];

let combos = [
  ['C001', 'Combo Principiante', 'Proteína + Creatina'],
  ['C002', 'Combo Avanzado', 'Proteína + Creatina + BCAA']
];

// Simple password comparison function
function compare(inputPassword, storedPassword) {
  return inputPassword === storedPassword;
}
window.checkAccess = async function() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const user = usuarios.find(u => u.email === email);

  if (user && compare(password, user.password)) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    loadMainContent(user.rol);
  } else {
    alert('Correo electrónico o contraseña incorrectos');
  }
}

let currentUser = null;

function loadMainContent(rol) {
  currentUser = { rol };
  let content = '<h1>Gestión de Inventario</h1>';
  content += '<nav class="navbar navbar-expand-lg navbar-light bg-light">';
  content += '<div class="container-fluid">';
  content += '<ul class="navbar-nav">';
  content += '<li class="nav-item"><a class="nav-link" href="#" onclick="loadProductos()">Productos</a></li>';
  
  if (rol === 'administrador' || rol === 'superadministrador') {
    content += '<li class="nav-item"><a class="nav-link" href="#" onclick="loadMovimientos()">Movimientos</a></li>';
    content += '<li class="nav-item"><a class="nav-link" href="#" onclick="loadCombos()">Combos</a></li>';
  }
  
  if (rol === 'superadministrador') {
    content += '<li class="nav-item"><a class="nav-link" href="#" onclick="loadUsuarios()">Usuarios</a></li>';
  }
  
  content += '</ul></div></nav>';
  content += '<div id="content-area"></div>';
  
  document.getElementById('main-content').innerHTML = content;
  loadProductos();
}

window.loadProductos = function() {
  let content = '<h2 class="mb-3">Lista de Productos</h2>';
  content += '<div class="table-responsive">';
  content += '<table class="table table-dark table-striped">';
  content += '<thead><tr><th>Código</th><th>Marca</th><th>Descripción</th><th>Sabor</th><th>Stock Total</th><th>Acciones</th></tr></thead>';
  content += '<tbody>';
  
  for (let i = 0; i < productos.length; i++) {
    content += '<tr>';
    content += '<td>' + productos[i][0] + '</td>';
    content += '<td>' + productos[i][1] + '</td>';
    content += '<td>' + productos[i][2] + '</td>';
    content += '<td>' + productos[i][3] + '</td>';
    content += '<td>' + productos[i][4] + '</td>';
    if (currentUser.rol === 'administrador' || currentUser.rol === 'superadministrador') {
      content += '<td><button class="btn btn-sm btn-warning" onclick="editarProducto(\'' + productos[i][0] + '\')">Editar</button></td>';
    } else {
      content += '<td>-</td>';
    }
    content += '</tr>';
  }
  
  content += '</tbody></table>';
  content += '</div>';
  if (currentUser.rol === 'administrador' || currentUser.rol === 'superadministrador') {
    content += '<button class="btn btn-primary mt-3" onclick="agregarProducto()">Agregar Producto</button>';
  }
  document.getElementById('content-area').innerHTML = content;
}

window.loadCombos = function() {
  let content = '<h2 class="mb-3">Lista de Combos</h2>';
  content += '<div class="table-responsive">';
  content += '<table class="table table-dark table-striped">';
  content += '<thead><tr><th>Código</th><th>Nombre</th><th>Descripción</th><th>Acciones</th></tr></thead>';
  content += '<tbody>';
  
  for (let i = 0; i < combos.length; i++) {
    content += '<tr>';
    content += '<td>' + combos[i][0] + '</td>';
    content += '<td>' + combos[i][1] + '</td>';
    content += '<td>' + combos[i][2] + '</td>';
    if (currentUser.rol === 'administrador' || currentUser.rol === 'superadministrador') {
      content += '<td><button class="btn btn-sm btn-warning" onclick="editarCombo(\'' + combos[i][0] + '\')">Editar</button></td>';
    } else {
      content += '<td>-</td>';
    }
    content += '</tr>';
  }
  
  content += '</tbody></table>';
  content += '</div>';
  if (currentUser.rol === 'administrador' || currentUser.rol === 'superadministrador') {
    content += '<button class="btn btn-primary mt-3" onclick="agregarCombo()">Agregar Combo</button>';
  }
  document.getElementById('content-area').innerHTML = content;
}

window.loadUsuarios = function() {
  let content = '<h2 class="mb-3">Lista de Usuarios</h2>';
  content += '<div class="table-responsive">';
  content += '<table class="table table-dark table-striped">';
  content += '<thead><tr><th>Email</th><th>Rol</th><th>Acciones</th></tr></thead>';
  content += '<tbody>';
  
  for (let i = 0; i < usuarios.length; i++) {
    content += '<tr>';
    content += '<td>' + usuarios[i].email + '</td>';
    content += '<td>' + usuarios[i].rol + '</td>';
    content += '<td><button class="btn btn-sm btn-warning" onclick="editarUsuario(\'' + usuarios[i].email + '\')">Editar</button></td>';
    content += '</tr>';
  }
  
  content += '</tbody></table>';
  content += '</div>';
  content += '<button class="btn btn-primary mt-3" onclick="agregarUsuario()">Agregar Usuario</button>';
  document.getElementById('content-area').innerHTML = content;
}

window.editarProducto = function(codigo) {
  const producto = productos.find(p => p[0] === codigo);
  if (producto) {
    const nuevoNombre = prompt('Nuevo nombre:', producto[2]);
    if (nuevoNombre) {
      producto[2] = nuevoNombre;
      loadProductos();
    }
  }
}

window.agregarProducto = function() {
  const codigo = prompt('Código del producto:');
  const marca = prompt('Marca del producto:');
  const descripcion = prompt('Descripción del producto:');
  const sabor = prompt('Sabor del producto:');
  const stock = parseInt(prompt('Stock inicial:'));

  if (codigo && marca && descripcion && sabor && !isNaN(stock)) {
    productos.push([codigo, marca, descripcion, sabor, stock]);
    loadProductos();
  } else {
    alert('Por favor, ingrese todos los datos correctamente.');
  }
}

window.editarCombo = function(codigo) {
  const combo = combos.find(c => c[0] === codigo);
  if (combo) {
    const nuevoNombre = prompt('Nuevo nombre:', combo[1]);
    if (nuevoNombre) {
      combo[1] = nuevoNombre;
      loadCombos();
    }
  }
}

window.agregarCombo = function() {
  const codigo = prompt('Código del combo:');
  const nombre = prompt('Nombre del combo:');
  const descripcion = prompt('Descripción del combo:');

  if (codigo && nombre && descripcion) {
    combos.push([codigo, nombre, descripcion]);
    loadCombos();
  } else {
    alert('Por favor, ingrese todos los datos correctamente.');
  }
}

window.editarUsuario = function(email) {
  const usuario = usuarios.find(u => u.email === email);
  if (usuario) {
    const nuevoRol = prompt('Nuevo rol (usuario, administrador, superadministrador):', usuario.rol);
    if (nuevoRol && ['usuario', 'administrador', 'superadministrador'].includes(nuevoRol)) {
      usuario.rol = nuevoRol;
      loadUsuarios();
    } else {
      alert('Rol no válido.');
    }
  }
}

window.agregarUsuario = async function() {
  const email = prompt('Ingrese el email del nuevo usuario:');
  const password = prompt('Ingrese la contraseña del nuevo usuario:');
  const rol = prompt('Ingrese el rol del nuevo usuario (usuario, administrador, superadministrador):');

  if (email && password && ['usuario', 'administrador', 'superadministrador'].includes(rol)) {
    const hashedPassword = await bcrypt.hash(password, 10);
    usuarios.push({ email, password: hashedPassword, rol });
    loadUsuarios();
  } else {
    alert('Por favor, ingrese todos los datos correctamente.');
  }
}

window.loadMovimientos = function() {
  let content = '<h2 class="mb-3">Movimientos de Inventario</h2>';
  content += '<p>Aquí se mostrarían los movimientos de inventario.</p>';
  document.getElementById('content-area').innerHTML = content;
}