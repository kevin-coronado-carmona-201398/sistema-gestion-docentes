import AppDaoBetterSQLite
    from "./DaoBetterSqlite3.mjs";


// ============================================================
// CREAR / ABRIR BASE DE DATOS
// ============================================================

const db =
    new AppDaoBetterSQLite(
        "./db/app.db"
    );


try {

    db.open();

    console.log(
        "Base de datos SQLite creada/abierta correctamente."
    );

} catch (error) {

    console.error(
        "No se pudo abrir la base de datos:",
        error.message
    );

} finally {

    db.close();

}