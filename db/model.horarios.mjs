class ModelHorarios {

    constructor(controller) {

        this.dbController =
            controller;

    }

    getAll() {

        this.dbController.open();

        const rows =
            this.dbController.all(
                `
                SELECT
                    id,
                    clave,
                    dia,
                    hora_inicio AS horaInicio,
                    hora_fin AS horaFin
                FROM horarios
                ORDER BY id;
                `,
                []
            );

        this.dbController.close();

        return rows;

    }

}

export default ModelHorarios;