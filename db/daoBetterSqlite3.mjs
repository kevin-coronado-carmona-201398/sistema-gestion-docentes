import Database from "better-sqlite3";

// ============================================================
// DAO GENERAL PARA SQLITE
// ============================================================

class AppDaoBetterSQLite {

    constructor(dbFilePath) {

        this.dbName =
            dbFilePath;

        this.db = null;

        this.dbOpen = false;

    }


    // ========================================================
    // ABRIR BASE DE DATOS
    // ========================================================

    open() {

        if (this.dbOpen) {
            return;
        }

        this.db =
            new Database(
                this.dbName
            );

        this.db.pragma(
            "journal_mode = WAL"
        );

        this.dbOpen = true;

    }


    // ========================================================
    // EJECUTAR INSERT / UPDATE / DELETE
    // ========================================================

    run(
        sql,
        params = []
    ) {

        if (!this.dbOpen) {
            throw new Error(
                "La base de datos no está abierta."
            );
        }

        const statement =
            this.db.prepare(
                sql
            );

        return statement.run(
            ...params
        );

    }


    // ========================================================
    // OBTENER UN REGISTRO
    // ========================================================

    get(
        sql,
        params = []
    ) {

        if (!this.dbOpen) {
            throw new Error(
                "La base de datos no está abierta."
            );
        }

        const statement =
            this.db.prepare(
                sql
            );

        return statement.get(
            ...params
        );

    }


    // ========================================================
    // OBTENER VARIOS REGISTROS
    // ========================================================

    all(
        sql,
        params = []
    ) {

        if (!this.dbOpen) {
            throw new Error(
                "La base de datos no está abierta."
            );
        }

        const statement =
            this.db.prepare(
                sql
            );

        return statement.all(
            ...params
        );

    }


    // ========================================================
    // CERRAR BASE DE DATOS
    // ========================================================

    close() {

        if (
            this.dbOpen &&
            this.db
        ) {

            this.db.close();

            this.db = null;

            this.dbOpen = false;

        }

    }

}


export default AppDaoBetterSQLite;