const http = require("http");

const puerto = process.env.PORT || 3000;

let estadoFabrica = {
    puerta: {
        estado: "Cerrada",
        ultimoAcceso: "Sin datos",
        bloqueada: false
    },
    prensa: {
        estado: "Trabajando",
        ciclos: 12,
        error: false
    },
    energia: {
        nivel: 75,
        estado: "Normal",
        consumo: 35
    },
    alarmaGeneral: false
};

function actualizarEstadoEnergia(nivel) {
    estadoFabrica.energia.nivel = nivel;

    if (nivel > 50) {
        estadoFabrica.energia.estado = "Normal";
        estadoFabrica.energia.consumo = 35;
        estadoFabrica.alarmaGeneral = false;
        estadoFabrica.puerta.bloqueada = false;
        estadoFabrica.puerta.estado = "Cerrada";
    } else if (nivel >= 25) {
        estadoFabrica.energia.estado = "Bajo consumo";
        estadoFabrica.energia.consumo = 24;
        estadoFabrica.alarmaGeneral = false;
        estadoFabrica.puerta.bloqueada = false;
        estadoFabrica.puerta.estado = "Cerrada";
    } else {
        estadoFabrica.energia.estado = "Critico";
        estadoFabrica.energia.consumo = 12;
        estadoFabrica.alarmaGeneral = true;
        estadoFabrica.puerta.bloqueada = true;
        estadoFabrica.puerta.estado = "Bloqueada";
    }
}

function enviarTexto(res, texto) {
    res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
    });

    res.end(texto);
}

function enviarJSON(res, datos) {
    res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
    });

    res.end(JSON.stringify(datos, null, 2));
}

function enviarNoEncontrado(res) {
    res.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
    });

    res.end("Ruta no encontrada");
}

const servidor = http.createServer((req, res) => {
    const ruta = req.url;

    console.log("Peticion recibida: " + ruta);

    if (ruta === "/") {
        enviarTexto(res, "API Fabrica Digital Twin funcionando correctamente");
    }

    else if (ruta === "/estado") {
        enviarJSON(res, estadoFabrica);
    }

    else if (ruta === "/modo/normal") {
        actualizarEstadoEnergia(75);
        estadoFabrica.prensa.estado = "Trabajando";
        estadoFabrica.prensa.error = false;
        enviarJSON(res, estadoFabrica);
    }

    else if (ruta === "/modo/bajo-consumo") {
        actualizarEstadoEnergia(40);
        estadoFabrica.prensa.estado = "Trabajando";
        estadoFabrica.prensa.error = false;
        enviarJSON(res, estadoFabrica);
    }

    else if (ruta === "/modo/critico") {
        actualizarEstadoEnergia(15);
        estadoFabrica.prensa.estado = "Error";
        estadoFabrica.prensa.error = true;
        enviarJSON(res, estadoFabrica);
    }

    else if (ruta === "/prensa/trabajando") {
        estadoFabrica.prensa.estado = "Trabajando";
        estadoFabrica.prensa.error = false;
        enviarJSON(res, estadoFabrica);
    }

    else if (ruta === "/prensa/error") {
        estadoFabrica.prensa.estado = "Error";
        estadoFabrica.prensa.error = true;
        enviarJSON(res, estadoFabrica);
    }

    else if (ruta === "/prensa/mantenimiento") {
        estadoFabrica.prensa.estado = "Mantenimiento";
        estadoFabrica.prensa.error = false;
        enviarJSON(res, estadoFabrica);
    }

    else if (ruta === "/puerta/acceso-correcto") {
        if (estadoFabrica.alarmaGeneral) {
            estadoFabrica.puerta.estado = "Bloqueada";
            estadoFabrica.puerta.ultimoAcceso = "Acceso denegado por alarma";
        } else {
            estadoFabrica.puerta.estado = "Abierta";
            estadoFabrica.puerta.ultimoAcceso = "RFID valido";
        }

        enviarJSON(res, estadoFabrica);
    }

    else if (ruta === "/puerta/acceso-denegado") {
        estadoFabrica.puerta.estado = "Acceso denegado";
        estadoFabrica.puerta.ultimoAcceso = "RFID no autorizado";
        enviarJSON(res, estadoFabrica);
    }

    else {
        enviarNoEncontrado(res);
    }
});

servidor.listen(puerto, () => {
    console.log("API Fabrica Digital Twin funcionando en puerto " + puerto);
});
