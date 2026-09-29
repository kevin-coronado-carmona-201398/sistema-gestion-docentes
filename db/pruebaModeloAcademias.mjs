import AppDaoBetterSQLite
    from "./DaoBetterSqlite3.mjs";

import ModelAcademias
    from "./model.academias.mjs";


// ============================================================
// CREAR DAO
// ============================================================

const controllerDB =
    new AppDaoBetterSQLite(
        "./db/app.db"
    );


// ============================================================
// CREAR MODEL
// ============================================================

const model =
    new ModelAcademias(
        controllerDB
    );


// ============================================================
// CONSULTAR TODAS
// ============================================================

const academias =
    model.getAll();


console.log(
    "Academias:"
);

console.table(
    academias
);


// ============================================================
// CONSULTAR UNA
// ============================================================

const academia =
    model.get(
        1
    );


console.log(
    "\nAcademia con ID 1:"
);

console.log(
    academia
);