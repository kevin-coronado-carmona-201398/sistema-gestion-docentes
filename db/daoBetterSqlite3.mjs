import Database from "better-sqlite3";

class AppDaoBetterSQLite {

    constructor(dbFilePath) {

        this.dbName = dbFilePath;
        this.db = null;
        this.dbOpen = false;

    }

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

        this.db.pragma(
            "foreign_keys = ON"
        );

        this.dbOpen = true;

    }

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
            this.db.prepare(sql);

        return statement.run(
            ...params
        );

    }

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
            this.db.prepare(sql);

        return statement.get(
            ...params
        );

    }

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
            this.db.prepare(sql);

        return statement.all(
            ...params
        );

    }

    transaction(
        callback
    ) {

        if (!this.dbOpen) {

            throw new Error(
                "La base de datos no está abierta."
            );

        }

        const transaction =
            this.db.transaction(
                callback
            );

        return transaction();

    }

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