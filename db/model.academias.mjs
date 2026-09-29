import AppDaoBetterSQLite
    from "./daoBetterSqlite3.mjs";


// ============================================================
// MODELO DE ACADEMIAS
// ============================================================

class ModelAcademias {

    constructor(controller) {

        this.dbController =
            controller;

    }


    // ========================================================
    // OBTENER UNA ACADEMIA
    // ========================================================

    get(id) {

        const sql = `
            SELECT
                id,
                nombre,
                clave,
                descripcion
            FROM academias
            WHERE id = ?;
        `;


        this.dbController.open();


        const data =
            this.dbController.get(
                sql,
                [id]
            );


        this.dbController.close();


        return data;

    }


    // ========================================================
    // OBTENER TODAS LAS ACADEMIAS
    // ========================================================

    getAll() {

        const sql = `
            SELECT
                id,
                nombre,
                clave,
                descripcion
            FROM academias
            ORDER BY nombre;
        `;


        this.dbController.open();


        const data =
            this.dbController.all(
                sql,
                []
            );


        this.dbController.close();


        return data;

    }

}


export default ModelAcademias;