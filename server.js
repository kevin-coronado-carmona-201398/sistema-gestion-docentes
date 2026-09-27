const express = require("express");
const app = express();
const PORT = 3001;

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(express.json());

// ============================================================
// RUTA DE PRUEBA
// ============================================================

app.get("/", (req, res) => {

    res.send(
        "Servidor Express de Gestión Académica funcionando."
    );

});

// ============================================================
// INICIAR SERVIDOR
// ============================================================

app.listen(
    PORT,
    () => {

        console.log(
            `Servidor Express ejecutándose en http://localhost:${PORT}`
        );

    }
);