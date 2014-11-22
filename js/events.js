$(document).ready(initialize_events);

var event_data = {}
var previous_selection;
var filter = {};
filter.today = false;
filter.past = true;
filter.query = "";

function initialize_events() {
    get_events();
}

function get_events() {
    var data = $.getJSON("http://104.131.29.221/api/events/latest", function(res) {
        if (!(res)) {
            return {};
        } else {
            return events_callback(res);
        }
    })
}

//handles successful fetch of events
function events_callback(res) {
    var result_count = res["Result Count"];
    var results = res["Results"];
    var m_names = new Array("January", "February", "March",
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December");
    //display results
    for (i in results) {
        var name = results[i]["name"];
        var category = results[i]["category"];
        var description = results[i]["description"];
        var link = results[i]["link"];
        var source = results[i]["source"];
        var time = results[i]["time"];
        var location = results[i]["location"];

        time = time.replace("T", " ");
        var date = new Date(Date.parse(time));
        var curr_day = date.toString().split(" ")[0];
        var curr_date = date.getDate();
        var curr_month = date.getMonth();
        var time_str = date.toLocaleString().split(" ");
        time_str.splice(0, 1);
        tmp_time = time_str[0];
        tmp_time = tmp_time.split(":")
        tmp_time.splice(2, 1);
        time_str[0] = tmp_time.join(":");
        time = curr_day + ", " + m_names[curr_month] + " " +
            curr_date + ", " + time_str.join(" ");
        date_tomorrow = new Date(date);
        date_tomorrow.setDate(date.getDate()+1);

        event_data[i] = {
            "name": name,
            "category": category,
            "description": description,
            "link": link,
            "source": source,
            "time": time,
            "date": date,
            "date_tomorrow":date_tomorrow,
            "location": location
        };
    }
    populate_list(event_data);
}

function populate_list(events) {
    //Populates list with events and initializes
    //events display with an event
    var events_list = $("#events-list")[0];
    var dateObj = new Date();
    var day = dateObj.getDate();
    var month = dateObj.getMonth();
    var today = new Date(dateObj.getFullYear(), month, day);
    var display_event;

    for (i in events) {
        var curr_event = events[i];
        var tr = document.createElement("tr");
        var entry = document.createElement("td");
        entry.setAttribute("class", "event-entry-container");
        entry.setAttribute("id", "event_" + i);
        curr_event["id"] = "event_" + i;
        tr.appendChild(entry);
        events_list.appendChild(tr);

        var name = document.createElement("div");
        name.setAttribute("class", "event-entry-name");
        name.innerHTML = curr_event["name"];
        entry.appendChild(name);

        var time = document.createElement("div");
        time.setAttribute("class", "event-entry-time");
        time.innerHTML = curr_event["time"];
        entry.appendChild(time);

        //Grab first event
        if (!(display_event)) {
            display_event = curr_event;
        }

        //If curr event is more than a day old, hide it.
        if (curr_event["date_tomorrow"] < today) {
            entry.hidden = true;
        }

        //if curr event is ever today, it wins!
        if (curr_event["date"].toDateString() == today.toDateString()) {
            display_event = curr_event;
            continue;
        }
        //otherwise get the closest event
        if ((curr_event["date"] - today) >= 0) {
            if (Math.abs((curr_event["date"] - today)) < (Math.abs((display_event["date"]) - today))) {
                display_event = curr_event;
            }
        }


        //Add an id to event-entry-time to indicate
        //if today, previous, or upcoming. This will
        //be used to toggle hidden status
    }
    // set listeners
    set_listeners();


    //populate event display with either today's event or if not
    //today's then the closest event to today (looking forwards)
    populate_event_display(display_event);
}

function populate_event_display(d_event) {
    //populates the event display area with the event data given
    $("#event-display-title")[0].innerHTML = d_event["name"];
    $("#event-display-time")[0].innerHTML = "<b>When: </b>" + d_event["time"];
    if (d_event["link"]) {
        $("#event-display-link")[0].hidden = false;
        $("#event-display-link")[0].innerHTML = "Read on " + d_event["source"];
        $("#event-display-link")[0].href = d_event["link"];
    } else {
        $("#event-display-link")[0].hidden = true;
        $("#event-display-link")[0].href = "";
        $("#event-display-link")[0].innerHTML = "";
    }
    $("#event-display-category")[0].innerHTML = "<b>Category: </b>" + d_event["category"];
    if (d_event["location"]) {
        $("#event-display-location")[0].hidden = false;
        $("#event-display-location")[0].innerHTML = "<b>Where: </b>" + d_event["location"];
    } else {
        $("#event-display-location")[0].hidden = true;
    }
    $("#event-display-description")[0].innerHTML = d_event["description"];

    var current_event_element = $("#" + d_event["id"])[0];

    //if previously selected element, clear
    if (previous_selection) {
        previous_selection.style.background = "";
    }

    //set the class of the current event element in table to active
    current_event_element.style.background = "rgba(255, 83, 83, 0.18)";

    //scroll to event element in table
    current_event_element.scrollIntoViewIfNeeded();

    previous_selection = current_event_element;
}

function set_listeners() {
    $(".event-entry-container").click(function(ev) {
        var lookup_id = ev.currentTarget.id.split("event_")[1];
        var current_event = event_data[lookup_id];
        populate_event_display(current_event);
    })

    //on click for only today button
    $("#show-today").click(function(ev) {
        filter.today = !(filter.today);
        if (filter.today) {
            $("#show-today")[0].className = "btn-active";
        } else {
            $("#show-today")[0].className = "";
        }
        console.log($("#show-today")[0].className);
        filterEntries();
    })

    //on click for show pas button
    $("#show-past").click(function(ev) {
        filter.past = !(filter.past);
        if (!(filter.past)) {
            $("#show-past")[0].className = "btn-active";
        } else {
            $("#show-past")[0].className = "";
        }
        console.log($("#show-past")[0].className);
        filterEntries();
    })

    // set listener for search
    $("#events-search").on("input", function(e) {
        if ($(this).data("lastval") != $(this).val()) {
            $(this).data("lastval", $(this).val());
            //change action
            filter.query = $(this).val()
            filterEntries()
        };
    });
}

function filterToday() {
    var curr_entries = document.getElementsByClassName("event-entry-container");
    var dateObj = new Date();
    var day = dateObj.getDate();
    var month = dateObj.getMonth();
    var today = new Date(dateObj.getFullYear(), month, day);
    for (i in curr_entries) {
        if (!(curr_entries[i].children)) {
            continue;
        }
        var ev_id = curr_entries[i].id.split("event_")[1];
        // console.log(ev_id, event_data[ev_id]);
        curr_event = event_data[ev_id];
        if (curr_event["date"].toDateString() != today.toDateString()) {
            curr_entries[i].hidden = true;
        }
    }

}

function filterEntries() {
    console.log(filter)
        // Hides entries iff !(query subset of entry name)
    var curr_entries = document.getElementsByClassName("event-entry-container");
    var dateObj = new Date();
    var day = dateObj.getDate();
    var month = dateObj.getMonth();
    var today = new Date(dateObj.getFullYear(), month, day);
    for (i in curr_entries) {
        if (!(curr_entries[i].children)) {
            continue;
        }
        var name = curr_entries[i].children[0].innerHTML.toLocaleLowerCase();
        var ev_id = curr_entries[i].id.split("event_")[1];
        curr_event = event_data[ev_id];
        //if filter.today, check if event time is today, else if hidden show it.
        //this may be overridden by the query filter
        if (filter.today) {
            if (curr_event["date"].toDateString() != today.toDateString()) {
                curr_entries[i].hidden = true;
                continue;
            }
        } else {
            curr_entries[i].hidden = false;
        }

        //if filter.past, check if event time + 24 hours is < today, else if hidden show it.
        //this may be overridden by the query filter
        if (filter.past) {
            if (curr_event["date_tomorrow"] < today) {
                curr_entries[i].hidden = true;
                continue;
            }
        } else {
            curr_entries[i].hidden = false;
        }

        if (filter.query) {
            //if query not in entry, hide this li element.
            if (name.indexOf(filter.query.toLocaleLowerCase()) == -1) {
                curr_entries[i].hidden = true;
            } else {
                curr_entries[i].hidden = false;
            }
        }
    }
}
