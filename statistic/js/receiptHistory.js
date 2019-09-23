$(document).ready(function () {
    $('#datatable').DataTable({
        columns: [
            null,
            null,
            null,
            null,
            null,
            null,
            {"orderable": false}
        ],
        order: [[0, 'desc'], [3, 'asc']],
        language: {
            "url": "/js/i18n/russianDatatable.json"
        }
    });
})

function openReceipt(id) {
    location = '/history/receipts/' + id
}




