class ModelCursos {

    constructor(controller) {

        this.dbController =
            controller;

    }

    get(id) {

        this.dbController.open();

        const data =
            this.dbController.get(
                `
                SELECT
                    id,
                    nombre,
                    descripcion,
                    academia_id AS academiaId
                FROM cursos
                WHERE id = ?;
                `,
                [id]
            );

        this.dbController.close();

        return data;

    }

    getAll() {

        this.dbController.open();

        const data =
            this.dbController.all(
                `
                SELECT
                    id,
                    nombre,
                    descripcion,
                    academia_id AS academiaId
                FROM cursos
                ORDER BY nombre;
                `,
                []
            );

        this.dbController.close();

        return data;

    }

    create(
        nombre,
        descripcion,
        academiaId
    ) {

        this.dbController.open();

        try {

            const academy =
                this.dbController.get(
                    `
                    SELECT id
                    FROM academias
                    WHERE id = ?;
                    `,
                    [academiaId]
                );

            if (!academy) {

                const error =
                    new Error(
                        "La academia seleccionada no existe."
                    );

                error.code =
                    "ACADEMY_NOT_FOUND";

                throw error;

            }

            const duplicate =
                this.dbController.get(
                    `
                    SELECT id
                    FROM cursos
                    WHERE academia_id = ?
                      AND LOWER(nombre) =
                          LOWER(?);
                    `,
                    [
                        academiaId,
                        nombre
                    ]
                );

            if (duplicate) {

                const error =
                    new Error(
                        "Ya existe un curso con ese nombre dentro de la academia seleccionada."
                    );

                error.code =
                    "DUPLICATE_COURSE";

                throw error;

            }

            const result =
                this.dbController.run(
                    `
                    INSERT INTO cursos
                    (
                        nombre,
                        descripcion,
                        academia_id
                    )
                    VALUES
                    (?, ?, ?);
                    `,
                    [
                        nombre,
                        descripcion,
                        academiaId
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
        descripcion,
        academiaId
    ) {

        this.dbController.open();

        try {

            const current =
                this.dbController.get(
                    `
                    SELECT *
                    FROM cursos
                    WHERE id = ?;
                    `,
                    [id]
                );

            if (!current) {
                return null;
            }

            const academy =
                this.dbController.get(
                    `
                    SELECT id
                    FROM academias
                    WHERE id = ?;
                    `,
                    [academiaId]
                );

            if (!academy) {

                const error =
                    new Error(
                        "La academia seleccionada no existe."
                    );

                error.code =
                    "ACADEMY_NOT_FOUND";

                throw error;

            }

            const duplicate =
                this.dbController.get(
                    `
                    SELECT id
                    FROM cursos
                    WHERE academia_id = ?
                      AND LOWER(nombre) =
                          LOWER(?)
                      AND id <> ?;
                    `,
                    [
                        academiaId,
                        nombre,
                        id
                    ]
                );

            if (duplicate) {

                const error =
                    new Error(
                        "Ya existe un curso con ese nombre dentro de la academia seleccionada."
                    );

                error.code =
                    "DUPLICATE_COURSE";

                throw error;

            }

            const academyChanged =
                Number(
                    current.academia_id
                ) !==
                Number(
                    academiaId
                );

            if (academyChanged) {

                const domains =
                    this.dbController.get(
                        `
                        SELECT COUNT(*) AS total
                        FROM dominios
                        WHERE curso_id = ?;
                        `,
                        [id]
                    );

                const assignments =
                    this.dbController.get(
                        `
                        SELECT COUNT(*) AS total
                        FROM asignaciones
                        WHERE curso_id = ?;
                        `,
                        [id]
                    );

                if (
                    domains.total > 0 ||
                    assignments.total > 0
                ) {

                    const error =
                        new Error(
                            "No se puede cambiar de academia un curso que tiene dominios o asignaciones asociadas."
                        );

                    error.code =
                        "HAS_RELATIONS";

                    throw error;

                }

            }

            this.dbController.run(
                `
                UPDATE cursos
                SET
                    nombre = ?,
                    descripcion = ?,
                    academia_id = ?
                WHERE id = ?;
                `,
                [
                    nombre,
                    descripcion,
                    academiaId,
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

            const course =
                this.dbController.get(
                    `
                    SELECT id
                    FROM cursos
                    WHERE id = ?;
                    `,
                    [id]
                );

            if (!course) {
                return false;
            }

            const domains =
                this.dbController.get(
                    `
                    SELECT COUNT(*) AS total
                    FROM dominios
                    WHERE curso_id = ?;
                    `,
                    [id]
                );

            const assignments =
                this.dbController.get(
                    `
                    SELECT COUNT(*) AS total
                    FROM asignaciones
                    WHERE curso_id = ?;
                    `,
                    [id]
                );

            if (
                domains.total > 0 ||
                assignments.total > 0
            ) {

                const error =
                    new Error(
                        "No se puede eliminar el curso porque tiene dominios o asignaciones asociadas."
                    );

                error.code =
                    "HAS_RELATIONS";

                throw error;

            }

            this.dbController.run(
                `
                DELETE FROM cursos
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

export default ModelCursos;