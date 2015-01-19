$(document).ready(initialize_filmseries);
$(window).resize(on_resize);

var film_data = {}
var previous_selection;
var mobile = false;


function on_resize() {
    mobile = is_mobile();
    // hide the film display if mobile
    if (mobile) {
        $('#film-display-container').hide();
        $(".back-btn").show();
    } else {
        $(".back-btn").hide();
        $('#film-display-container').show();
    }
    adjust_table_heights();

    //if mobile display, hide the list, create the back button, show the film display
    if (mobile) {
        $("#films-list-container").show();
        $("#film-display-container").hide();
    } else {
        //if mobile display, hide the list, create the back button, show the film display
        $("#films-list-container").show();
    }
}

function is_mobile() {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight || e.clientHeight || g.clientHeight;
    return (x < 875);
}

function adjust_table_heights() {
    var viewport_height = $(window).height();
    var element_top = $("#films-table-scroll")[0].getBoundingClientRect().top;
    var new_height = viewport_height - element_top - 50;
    $("#films-table-scroll").height(new_height);

    var target_height = $("#films-list-container").height();
    $("#film-display-container").height(target_height);
}

function initialize_filmseries() {
    //adjust table heights
    mobile = is_mobile();
    get_films();
    document.querySelector(".calSpan").addEventListener("click", function() {
        var c = document.querySelector('.cal-options-holder');
        c.hidden = !(c.hidden);
    });
    document.querySelector(".back-btn").addEventListener("click", function() {
        $('#film-display-container').hide();
        $('#films-list-container').show();
    });
    // hide the film display if mobile
    if (mobile) {
        $('#film-display-container').hide();
    } else {
        $(".back-btn").hide();
    }
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
        var date = new Date(Date.parse(time));
        if (!(date)){
            time = time.replace("T", " ");
            var date = new Date(Date.parse(time));
        }
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
        name.setAttribute("class", "event-entry-name");
        name.innerHTML = curr_film["name"];
        entry.appendChild(name);

        var time = document.createElement("div");
        time.setAttribute("class", "event-entry-time");
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
    if (!mobile) {
        populate_film_display(display_film);
    }
    adjust_table_heights();
}

function makeCal(title, start, duration, end, address, description) {
    var myCalendar = createCalendar({
        options: {
            class: 'my-class',
            id: 'my-id' // You need to pass an ID. If you don't, one will be generated for you.
        },
        data: {
            title: title, // Event title
            start: start, // Event start date
            duration: duration, // Event duration (IN MINUTES)
            end: end, // You can also choose to set an end time.
            // If an end time is set, this will take precedence over duration
            address: address,
            description: description
        }
    });
    // if old cal, remove.
    var cal_options_holder = document.querySelector('.cal-options-holder');
    if (document.querySelector('.cal-options')) {
        cal_options_holder.innerHTML = "";
    }
    cal_options_holder.appendChild(myCalendar);
    cal_options_holder.hidden = "true"
}



function populate_film_display(film) {
    var cal_title;
    var cal_start;
    var cal_end;
    var cal_duration;
    var cal_address = "Center for Film Studies Wesleyan University Washington Terrace Middletown, CT 06457";
    var cal_description;

    //populates the film display area with the film data given
    $("#film-display-title")[0].innerHTML = film["name"];
    cal_title = "Film Series: " + film["name"]
    $("#film-display-time")[0].innerHTML = film["time"];
    cal_start = film["date"];
    cal_start.setHours(20); //set time to 8 o'clock
    cal_duration = 150; //guestimate about 150 minutes avg film
    $("#film-display-short")[0].innerHTML = film["short"];
    cal_description = film["short"];
    if (!(film["imdb"])) {
        $("#film-display-imdb").hide();
    } else {
        cal_description += "\n" + film["imdb"];
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
    for (i = 0; i < current_film_element.childNodes.length; i++) {
        current_film_element.children[i].style.color = "rgb(255, 249, 232)";
    }


    //scroll to film element in table
    // current_film_element.scrollIntoViewIfNeeded();

    previous_selection = current_film_element;

    //repopulate calendar
    makeCal(cal_title, cal_start, cal_duration, cal_end, cal_address, cal_description);

    //if mobile display, hide the list, create the back button, show the film display
    if (mobile) {
        $("#films-list-container").hide();
        $("#film-display-container").show();
    }
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
