$(document).ready(function () {
    $('#datatable').DataTable({
        columns: [
            null,
            null,
            null,
            null,
            null,
            null,
            {'orderable': false,}
        ],
        order: [[0, 'desc'], [2, 'asc'], [3, 'asc']],
        language: {
            "url": "/js/i18n/russianDatatable.json"
        }
    });
})