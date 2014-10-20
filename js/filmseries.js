$(document).ready(initialize_filmseries)

function initialize_filmseries() {
    get_films();
}

function get_film_today() {
    var data = $.getJSON("/api/filmseries/today", function(res) {
        if (!(res)) {
            return {};
        } else {
            return film_callback(res);
        }
    })
}