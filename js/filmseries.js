$(document).ready(initialize_filmseries)


var film_data = {}
var previous_selection;

function initialize_filmseries() {
    get_films();
}

function get_films() {
    var data = $.getJSON("http://wesapi.org/api/filmseries/all", function(res) {
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
    var m_names = new Array("January", "February", "March",
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December");
    //display results
    for (i in results) {
        var name = results[i]["name"];
        var raw_data = results[i]["data"];
        var short_info = raw_data["short"] ? raw_data["short"][0] : "";
        var long_info = raw_data["long"] ? raw_data["long"][0] : "";
        var imdb = raw_data["imdb"] ? raw_data["imdb"][0] : "";
        var time = raw_data["time"] ? raw_data["time"][0] : "";
        time = time.replace("T", " ");
        var date = new Date(Date.parse(time));
        var curr_day = date.toString().split(" ")[0];
        var curr_date = date.getDate();
        var curr_month = date.getMonth();
        time = curr_day + ", " + m_names[curr_month] + " " + curr_date;
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
    var dateObj = new Date();
    var day = dateObj.getDate();
    var month = dateObj.getMonth();
    var today = new Date(dateObj.getFullYear(), month, day);
    // console.log(current_date);
    var display_film;

    for (i in films) {
        var curr_film = films[i];
        var tr = document.createElement("tr");
        var entry = document.createElement("td");
        entry.setAttribute("class", "film-entry-container box-container");
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
        time.innerHTML = curr_film["time"];
        entry.appendChild(time);

        //while we're looking at each item, we might as 
        // well determine which one is closest to today
        // to figure out which one to use for display
        //base case, there is no display_film yet
        if (!(display_film)) {
            display_film = curr_film;
            continue;
        }
        //if curr film is ever today, it wins!
        if (curr_film["date"].toISOString() == today.toISOString()) {
            display_film = curr_film;
            continue;
        }
        //otherwise, if curr_film is closer to today than display
        //film, replace display film with curr film
        // console.log(curr_film["date"] - today, display_film["date"] - today)
        if ((curr_film["date"] - today) >= 0) {
            if (Math.abs((curr_film["date"] - today)) < (Math.abs((display_film["date"]) - today))) {
                display_film = curr_film;
            }
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
    $("#film-display-time")[0].innerHTML = film["time"];
    $("#film-display-short")[0].innerHTML = film["short"];
    if (!(film["imdb"])) {
        $("#film-display-imdb").hide();
    } else {
        $("#film-display-imdb")[0].innerHTML = "View on IMDb";
        $("#film-display-imdb").show();
    }
    $("#film-display-imdb")[0].href = film["imdb"];
    $("#film-display-long")[0].innerHTML = film["long"];

    var current_film_element = $("#" + film["id"])[0];

    //if previously selected element, clear
    if (previous_selection) {
        previous_selection.style.background = "";
        for (i = 0; i < previous_selection.childNodes.length; i++) {
            previous_selection.children[i].style.color = "inherit";
        }
    }

    //set the class of the current film element in table to active
    current_film_element.style.background = "rgb(226,93,64)";
    console.log(current_film_element.childNodes.length, "!")
    for (i = 0; i < current_film_element.childNodes.length; i++) {
        current_film_element.children[i].style.color = "rgb(233, 233, 228)";
    }


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
