class ModelCatalogos {

    constructor(controller) {

        this.dbController =
            controller;

    }

    getLicenciaturas() {

        return this.getNames(
            "licenciaturas"
        );

    }

    getMaestrias() {

        return this.getNames(
            "maestrias"
        );

    }

    getDoctorados() {

        return this.getNames(
            "doctorados"
        );

    }

    getNivelesSNI() {

        return this.getNames(
            "niveles_sni"
        );

    }

    getEspecialidades() {

        return this.getNames(
            "especialidades"
        );

    }

    getNames(table) {

        const allowedTables = [
            "licenciaturas",
            "maestrias",
            "doctorados",
            "niveles_sni",
            "especialidades"
        ];

        if (
            !allowedTables.includes(
                table
            )
        ) {

            throw new Error(
                "Tabla de catálogo no permitida."
            );

        }

        this.dbController.open();

        try {

            const rows =
                this.dbController.all(
                    `
                    SELECT nombre
                    FROM ${table}
                    ORDER BY id;
                    `,
                    []
                );

            return rows.map(
                row =>
                    row.nombre
            );

        } finally {

            this.dbController.close();

        }

    }

}

export default ModelCatalogos;