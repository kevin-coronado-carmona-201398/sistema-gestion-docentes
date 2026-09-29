class ModelAcademias {

    constructor(controller) {

        this.dbController =
            controller;

    }

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

    create(
        nombre,
        clave,
        descripcion
    ) {

        const duplicate =
            `
            SELECT id
            FROM academias
            WHERE LOWER(clave) = LOWER(?)
            LIMIT 1;
            `;

        const insert =
            `
            INSERT INTO academias
                (
                    nombre,
                    clave,
                    descripcion
                )
            VALUES
                (?, ?, ?);
            `;

        this.dbController.open();

        try {

            const exists =
                this.dbController.get(
                    duplicate,
                    [clave]
                );

            if (exists) {

                throw new Error(
                    "La clave de academia ya existe."
                );

            }

            const result =
                this.dbController.run(
                    insert,
                    [
                        nombre,
                        clave,
                        descripcion
                    ]
                );

            return this.get(
                result.lastInsertRowid
            );

        } finally {

            this.dbController.close();

        }

    }

    update(
        id,
        nombre,
        clave,
        descripcion
    ) {

        const duplicate =
            `
            SELECT id
            FROM academias
            WHERE LOWER(clave) = LOWER(?)
              AND id <> ?
            LIMIT 1;
            `;

        const update =
            `
            UPDATE academias
            SET
                nombre = ?,
                clave = ?,
                descripcion = ?
            WHERE id = ?;
            `;

        this.dbController.open();

        try {

            const current =
                this.dbController.get(
                    `
                    SELECT id
                    FROM academias
                    WHERE id = ?;
                    `,
                    [id]
                );

            if (!current) {
                return null;
            }

            const exists =
                this.dbController.get(
                    duplicate,
                    [clave, id]
                );

            if (exists) {

                throw new Error(
                    "La clave de academia ya existe."
                );

            }

            this.dbController.run(
                update,
                [
                    nombre,
                    clave,
                    descripcion,
                    id
                ]
            );

            return this.get(id);

        } finally {

            this.dbController.close();

        }

    }

    remove(id) {

        this.dbController.open();

        try {

            const academy =
                this.dbController.get(
                    `
                    SELECT id
                    FROM academias
                    WHERE id = ?;
                    `,
                    [id]
                );

            if (!academy) {
                return false;
            }

            const teachers =
                this.dbController.get(
                    `
                    SELECT COUNT(*) AS total
                    FROM docentes
                    WHERE academia_id = ?;
                    `,
                    [id]
                );

            const courses =
                this.dbController.get(
                    `
                    SELECT COUNT(*) AS total
                    FROM cursos
                    WHERE academia_id = ?;
                    `,
                    [id]
                );

            if (
                teachers.total > 0 ||
                courses.total > 0
            ) {

                const error =
                    new Error(
                        "No se puede eliminar la academia porque tiene docentes o cursos asociados."
                    );

                error.code =
                    "HAS_RELATIONS";

                throw error;

            }

            this.dbController.run(
                `
                DELETE FROM academias
                WHERE id = ?;
                `,
                [id]
            );

            return true;

        } finally {

            this.dbController.close();

        }

    }

}

export default ModelAcademias;