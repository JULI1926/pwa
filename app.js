let db;
const request = indexedDB.open("MiBaseDeDatos", 1);

request.onupgradeneeded = (event) => {
  db = event.target.result;
  const objectStore = db.createObjectStore("personas", { keyPath: "id", autoIncrement: true });
  objectStore.createIndex("nombres", "nombres", { unique: false });
  objectStore.createIndex("apellidos", "apellidos", { unique: false });
  objectStore.createIndex("ciudad", "ciudad", { unique: false });
};

request.onsuccess = (event) => {
  db = event.target.result;
  mostrarDatos();
};

request.onerror = (event) => {
  console.error("Error al abrir la base de datos", event);
};

document.getElementById("dataForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const id = document.getElementById("id").value;
  const nombres = document.getElementById("nombres").value;
  const apellidos = document.getElementById("apellidos").value;
  const ciudad = document.getElementById("ciudad").value;

  const transaction = db.transaction(["personas"], "readwrite");
  const objectStore = transaction.objectStore("personas");

  const data = { nombres, apellidos, ciudad };
  if (id) {
    data.id = Number(id);
    const request = objectStore.put(data);
    request.onsuccess = () => {
      console.log("Datos actualizados");
      limpiarFormulario();
      mostrarDatos();
    };
  } else {
    const request = objectStore.add(data);
    request.onsuccess = () => {
      console.log("Datos guardados");
      limpiarFormulario();
      mostrarDatos();
    };
  }
});

function mostrarDatos() {
  const dataList = document.getElementById("dataList");
  dataList.innerHTML = ''; // Limpiar la tabla
  const transaction = db.transaction(["personas"], "readonly");
  const objectStore = transaction.objectStore("personas");

  objectStore.openCursor().onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${cursor.value.id}</td>
        <td>${cursor.value.nombres}</td>
        <td>${cursor.value.apellidos}</td>
        <td>${cursor.value.ciudad}</td>
        <td>
          <button onclick="editarDato(${cursor.value.id})">Editar</button>
          <button onclick="eliminarDato(${cursor.value.id})">Eliminar</button>
        </td>
      `;
      dataList.appendChild(row);
      cursor.continue();
    }
  };
}

function editarDato(id) {
  const transaction = db.transaction(["personas"], "readonly");
  const objectStore = transaction.objectStore("personas");
  const request = objectStore.get(id);

  request.onsuccess = (event) => {
    const data = event.target.result;
    document.getElementById("id").value = data.id;
    document.getElementById("nombres").value = data.nombres;
    document.getElementById("apellidos").value = data.apellidos;
    document.getElementById("ciudad").value = data.ciudad;
  };
}

function eliminarDato(id) {
  const transaction = db.transaction(["personas"], "readwrite");
  const objectStore = transaction.objectStore("personas");
  const request = objectStore.delete(id);

  request.onsuccess = () => {
    console.log("Datos eliminados");
    mostrarDatos();
  };
}

function limpiarFormulario() {
  document.getElementById("id").value = '';
  document.getElementById("nombres").value = '';
  document.getElementById("apellidos").value = '';
  document.getElementById("ciudad").value = '';
}