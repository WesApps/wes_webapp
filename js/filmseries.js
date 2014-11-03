$(document).ready(initialize_filmseries)


var film_data = {}
var previous_selection;

function initialize_filmseries() {
    get_films();
    //do that title fade effect
    $(".title")[0].style.textShadow = "black 0px 0px 0px";
}

function get_films() {
    var data = $.getJSON("http://104.131.29.221/api/filmseries/all", function(res) {
        if (!(res)) {
            return {};
        } else {
            return films_callback(res);
        }
    })
}


//handles successful fetch of films
function films_callback(res) {
    var result_count = res["Result Count"];
    var results = res["Results"];
    //display results
    for (i in results) {
        var name = results[i]["name"];
        var raw_data = results[i]["data"];
        var short_info = raw_data["short"] ? raw_data["short"][0] : "";
        var long_info = raw_data["long"] ? raw_data["long"][0] : "";
        var imdb = raw_data["imdb"] ? raw_data["imdb"][0] : "";
        var time = raw_data["time"] ? raw_data["time"][0] : "";
        var date = new Date(Date.parse(time));
        film_data[i] = {
            "name": name,
            "short": short_info,
            "long": long_info,
            "imdb": imdb,
            "time": time,
            "date": date
        }
    }
    populate_list(film_data);
}

function populate_list(films) {
    //Populates list based on films and initializes the display
    // area with a film
    var films_list = $("#films-list")[0];
    var today = new Date();
    var display_film;

    for (i in films) {
        var curr_film = films[i];
        var tr = document.createElement("tr");
        var entry = document.createElement("td");
        entry.setAttribute("class", "film-entry-container");
        entry.setAttribute("id", "film_" + i);
        curr_film["id"] = "film_" + i;
        tr.appendChild(entry);
        films_list.appendChild(tr);

        var name = document.createElement("div");
        name.setAttribute("class", "film-entry-name");
        name.innerHTML = curr_film["name"];
        entry.appendChild(name);

        var time = document.createElement("div");
        time.setAttribute("class", "film-entry-time");
        var filmDateString = curr_film["date"].toDateString();
        time.innerHTML = filmDateString;
        entry.appendChild(time);

        //while we're looking at each item, we might as 
        // well determine which one is closest to today
        // to figure out which one to use for display
        //base case, there is no display_film yet
        if (!(display_film)) {
            display_film = curr_film;
        }
        //if curr film is ever today, it wins!
        if (filmDateString == today.toDateString()) {
            display_film = curr_film;
        }
        //otherwise, if curr_film is closer to today than display
        //film, replace display film with curr film
        if ((Math.abs(curr_film["date"] - today)) < (Math.abs(display_film["date"] - today))) {
            display_film = curr_film;
        }

    }
    // set on click listeners
    set_on_click();

    // set listener for search
    $("#films-search").on("input", function(e) {
        if ($(this).data("lastval") != $(this).val()) {
            $(this).data("lastval", $(this).val());
            //change action
            filterEntries($(this).val())
        };
    });

    //populate film display with either today's film or if not
    //today's then the closest film to today (looking forwards)
    populate_film_display(display_film);
}

function populate_film_display(film) {
    //populates the film display area with the film data given
    $("#film-display-title")[0].innerHTML = film["name"];
    $("#film-display-time")[0].innerHTML = film["date"].toDateString();
    $("#film-display-short")[0].innerHTML = film["short"];
    $("#film-display-imdb")[0].innerHTML = film["imdb"];
    $("#film-display-imdb")[0].href = film["imdb"];
    $("#film-display-long")[0].innerHTML = film["long"];

    var current_film_element = $("#" + film["id"])[0];

    //if previously selected element, clear
    if (previous_selection) {
        console.log(previous_selection);
        previous_selection.style.background = "";
    }

    //set the class of the current film element in table to active
    current_film_element.style.background = "rgba(255, 83, 83, 0.18)";

    //scroll to film element in table
    current_film_element.scrollIntoViewIfNeeded();

    previous_selection = current_film_element;
}

function set_on_click() {
    $(".film-entry-container").click(function(ev) {
        var lookup_id = ev.currentTarget.id.split("film_")[1];
        var current_film = film_data[lookup_id];
        populate_film_display(current_film);
    })
}

function filterEntries(query) {
    // Hides entries iff !(query subset of entry name)
    var curr_entries = document.getElementsByClassName("film-entry-container");
    for (i in curr_entries) {
        if (!(curr_entries[i].children)) {
            continue;
        }
        var name = curr_entries[i].children[0].innerHTML.toLocaleLowerCase();
        //if query not in entry, hide this li element.
        if (name.indexOf(query.toLocaleLowerCase()) == -1) {
            curr_entries[i].hidden = true;
        } else {
            curr_entries[i].hidden = false;
        }
    }
}
