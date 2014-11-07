$(document).ready(initialize_events);

var event_data = {}
var previous_selection;

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
        time = curr_day + ", " + m_names[curr_month] + " " + curr_date;
        event_data[i] = {
            "name": name,
            "category": category,
            "description": description,
            "link": link,
            "source": source,
            "time": time,
            "date": date,
            "location": location
        }
    }
    console.log(event_data, "!");
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
            continue;
        }
        //if curr event is ever today, it wins!
        if (curr_event["date"].toISOString() == today.toISOString()) {
            display_event = curr_event;
            continue;
        }
        //otherwise, if curr_event is closer to today than display
        //event, replace display event with curr event
        if ((curr_event["date"] - today) < (display_event["date"]) - today) {
            display_event = curr_event;
        }

    }
    // set on click listeners
    set_on_click();

    // set listener for search
    $("#events-search").on("input", function(e) {
        if ($(this).data("lastval") != $(this).val()) {
            $(this).data("lastval", $(this).val());
            //change action
            filterEntries($(this).val())
        };
    });

    //populate event display with either today's event or if not
    //today's then the closest event to today (looking forwards)
    populate_event_display(display_event);
}

function populate_event_display(d_event) {
    //populates the event display area with the event data given
    $("#event-display-title")[0].innerHTML = d_event["name"];
    $("#event-display-time")[0].innerHTML = d_event["time"];
    if (d_event["link"]) {
        $("#event-display-link")[0].innerHTML = "Read on " + d_event["source"];
        $("#event-display-link")[0].href = d_event["link"];
    }
    $("#event-display-category")[0].innerHTML = d_event["category"];
    $("#event-display-location")[0].innerHTML = d_event["location"];
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

function set_on_click() {
    $(".event-entry-container").click(function(ev) {
        var lookup_id = ev.currentTarget.id.split("event_")[1];
        var current_event = event_data[lookup_id];
        populate_event_display(current_event);
    })
}

function filterEntries(query) {
    // Hides entries iff !(query subset of entry name)
    var curr_entries = document.getElementsByClassName("event-entry-container");
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
