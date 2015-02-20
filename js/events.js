$(document).ready(initialize_events);
$(window).resize(on_resize);

var event_data = [];
var categories = [];
var color_array = [];
var previous_selection;
var display_event;
var current_sort = "date";
var filters = {};
filters.today = false;
filters.past = true;
filters.query = "";
var mobile = false;
var width;


function on_resize() {
    mobile = is_mobile();
    // hide the event display if mobile
    // if mobile display, hide the list, create the back button, show the event display
    if (mobile) {
        // prevents things from resetting during transition
        // from iOS safari full screen row click -> display
        if ($(window).width() === width) {
            return;
        }
        $('#event-display-container').hide();
        $("#events-list-container").show();
        $(".back-btn").show();
    } else {
        $(".back-btn").hide();
        $('#event-display-container').show();
    }
    adjust_table_heights();
}

function is_mobile() {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth;
    return (x < 875);
}

function adjust_table_heights() {
    if (mobile) {
        $("#events-table-scroll").height("100%");
        $("#event-display-container").height("100%");
    } else {
        var viewport_height = $(window).height();
        var element_top = $("#events-table-scroll")[0].getBoundingClientRect().top;
        var new_height = viewport_height - element_top - 75;
        $("#events-table-scroll").height(new_height);

        var target_height = $("#events-list-container").height();
        $("#event-display-container").height(target_height);
    }
}

function initialize_events() {
    mobile = is_mobile();
    get_events();
    document.querySelector(".calSpan").addEventListener("click", function() {
        var c = document.querySelector('.cal-options-holder');
        c.hidden = !(c.hidden);

    });
    document.querySelector(".back-btn").addEventListener("click", function() {
        $('#event-display-container').hide();
        $('#events-list-container').show();
        if (display_event) {
            display_event.scrollIntoView();
        }
    });
    width = $(window).width();
    // hide the event display if mobile
    if (mobile) {
        $('#event-display-container').hide();
        $('.search')[0].autofocus = false;
    } else {
        $(".back-btn").hide();
        $('.search')[0].autofocus = true;
    }
}

function get_events() {
    $.getJSON("http://wesapi.org/api/events/latest", function(res) {
        if (!(res)) {
            return {};
        } else {
            return events_callback(res);
        }
    });
}

//handles successful fetch of events
function events_callback(res) {
    var results = res["Results"];
    var m_names = new Array("January", "February", "March",
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December");
    //display results
    for (var i in results) {
        var name = results[i]["name"];
        var category = results[i]["category"];
        var description = results[i]["description"];
        var link = results[i]["link"];
        var source = results[i]["source"];
        var time = results[i]["time"];
        var location = results[i]["location"];

        //Add category to set of categories
        if (categories.indexOf(category) === -1) {
            categories.push(category);
        }

        //Process time/date
        var tmp_date = new Date(Date.parse(time));
        var date = new Date(tmp_date.getUTCFullYear(),
            tmp_date.getUTCMonth(), tmp_date.getUTCDate(),
            tmp_date.getUTCHours(), tmp_date.getUTCMinutes(),
            tmp_date.getUTCSeconds());

        var curr_day = date.toString().split(" ")[0];
        var curr_date = date.getDate();
        var curr_month = date.getMonth();
        var time_str = date.toLocaleString().split(" ");
        time_str.splice(0, 1);
        var tmp_time = time_str[0];
        tmp_time = tmp_time.split(":");
        tmp_time.splice(2, 1);
        time_str[0] = tmp_time.join(":");
        time = curr_day + ", " + m_names[curr_month] + " " +
            curr_date + ", " + time_str.join(" ");
        var date_tomorrow = new Date(date);
        date_tomorrow.setDate(date.getDate() + 1);

        event_data[i] = {
            "name": name,
            "category": category,
            "description": description,
            "link": link,
            "source": source,
            "time": time,
            "date": date,
            "date_tomorrow": date_tomorrow,
            "location": location
        };
    }
    color_array = coloring(categories.length).sort();
    populate_list(event_data);
    // set listeners
    set_listeners();


    //populate event display with either today's event or if not
    //today's then the closest event to today (looking forwards)
    if (!mobile) {
        populate_event_display(display_event);
    }
}

function create_header(inner) {
    var hdr_tr = document.createElement("tr");
    hdr_tr.setAttribute("class", "header-tr");
    var hdr_td = document.createElement("td");
    hdr_td.setAttribute("colspan", 2);
    hdr_td.innerHTML = inner;
    hdr_tr.appendChild(hdr_td);
    return hdr_tr;
}

function populate_list(events) {
    //Populates list with events and initializes
    //events display with an event
    var events_list = $("#events-list")[0];
    var dateObj = new Date();
    var day = dateObj.getDate();
    var month = dateObj.getMonth();
    var today = new Date(dateObj.getFullYear(), month, day);
    var prev_header;

    for (var i in events) {

        var curr_event = events[i];

        //set category/date header
        if (current_sort === "date") {
            var tmp = curr_event["date"];
            var day = tmp.getDate();
            var month = tmp.getMonth();
            var year = tmp.getFullYear();
            var tmpDate = new Date(year, month, day);
            if (!(prev_header) || (prev_header.toString() !== tmpDate.toString())) {
                //Display new header if appropriate
                prev_header = tmpDate;
                events_list.appendChild(create_header(prev_header.toString().split(" ").splice(0, 3).join(" ")));
            }
        }

        if (current_sort === "category") {
            var curr_category = curr_event["category"];
            if (!(prev_header) || (prev_header !== curr_category)) {
                //Display new header if appropriate
                prev_header = curr_category;
                events_list.appendChild(create_header(prev_header));
            }
        }


        var tr = document.createElement("tr");
        tr.setAttribute("class", "event-tr");
        // var cat_td = document.createElement("td");

        // cat_td.setAttribute("class", "cat_color");
        // tr.appendChild(cat_td);
        // Set color by category


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

        var time = document.createElement("span");
        time.setAttribute("class", "event-entry-time");
        time.innerHTML = curr_event["time"];
        entry.appendChild(time);

        //if we're date sorted, need to display the categories in the table
        if (current_sort === "date") {
            var category = document.createElement("span");
            category.setAttribute("class", "event-entry-category");
            category.innerHTML = curr_event["category"];
            entry.appendChild(category);

            // give it some color
            var cat_index = categories.indexOf(curr_event["category"]);
            var b_color;
            if (cat_index === -1) {
                b_color = color_array[0];
            } else {
                b_color = color_array[cat_index];
            }
            category.style.background = "#" + b_color;
        }


        //Grab first event
        if (!(display_event)) {
            display_event = curr_event;
        }

        //If curr event is more than a day old, hide it.
        if (curr_event["date_tomorrow"] < today) {
            entry.parentElement.hidden = true;
        }

        //if curr event is ever today, it wins!
        if (curr_event["date"].toDateString() === today.toDateString()) {
            display_event = curr_event;
            continue;
        }
        //otherwise get the closest event
        if ((curr_event["date"] - today) >= 0) {
            if (Math.abs((curr_event["date"] - today)) < (Math.abs((display_event["date"]) - today))) {
                display_event = curr_event;
            }
        }
    }
    filter_headers();
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
    cal_options_holder.hidden = "true";
}

function populate_event_display(d_event) {
    //init cal data
    var cal_title;
    var cal_start;
    var cal_end;
    var cal_duration;
    var cal_address;
    var cal_description;

    //populates the event display area with the event data given
    $("#event-display-title")[0].innerHTML = d_event["name"];
    cal_title = d_event["name"];
    $("#event-display-time")[0].innerHTML = "<b>When: </b>" + d_event["time"];
    cal_start = d_event["date"];
    cal_duration = 120;
    if (d_event["link"]) {
        $("#event-display-link")[0].hidden = false;
        $("#event-display-link")[0].innerHTML = "Read original";
        $("#event-display-link")[0].href = d_event["link"];
        cal_description = d_event["source"] + ": " + d_event["link"];
    } else {
        $("#event-display-link")[0].hidden = true;
        $("#event-display-link")[0].href = "";
        $("#event-display-link")[0].innerHTML = "";
        cal_description = d_event["source"];
    }
    $("#event-display-category")[0].innerHTML = "<b>Category: </b>" + d_event["category"];

    if (d_event["location"]) {
        $("#event-display-location")[0].hidden = false;
        $("#event-display-location")[0].innerHTML = "<b>Where: </b>" + d_event["location"];
        cal_address = d_event["location"];
    } else {
        $("#event-display-location")[0].hidden = true;
        cal_address = "";
    }
    $("#event-display-description")[0].innerHTML = d_event["description"];

    var current_event_element = $("#" + d_event["id"])[0];

    //if previously selected element, clear
    if (previous_selection) {
        previous_selection.style.background = "";
    }

    //set the class of the current event element in table to active
    current_event_element.style.background = "rgba(198, 198, 198, 0.32)";
    // current_event_element.style.background = "rgba(238, 92, 92, 0.51);";

    previous_selection = current_event_element;

    //repopulate calendar
    makeCal(cal_title, cal_start, cal_duration, cal_end, cal_address, cal_description);

    //if mobile display, hide the list, create the back button, show the event display
    if (mobile) {
        $("#events-list-container").hide();
        $("#event-display-container").show();
    }
}

function get_event_by_id(id) {
    //returns an event by it's event id
    for (var i = 0; i < event_data.length; i++) {
        if (event_data[i]["id"] === id) {
            return event_data[i];
        }
    }
}

function set_row_click() {
    $(".event-entry-container").click(function(ev) {
        var lookup_id = ev.currentTarget.id;
        var current_event = get_event_by_id(lookup_id);
        populate_event_display(current_event);
    });
}

function set_listeners() {
    set_row_click();

    //on click for only today button
    $("#show-today").click(function() {
        filters.today = !(filters.today);
        if (filters.today) {
            $("#show-today")[0].className = "btn btn-active";
        } else {
            $("#show-today")[0].className = "btn btn-inactive";
        }
        filter_entries();
    });

    //on click for show past button
    $("#show-past").click(function() {
        filters.past = !(filters.past);
        if (!(filters.past)) {
            $("#show-past")[0].className = "btn btn-active";
        } else {
            $("#show-past")[0].className = "btn btn-inactive";
        }
        filter_entries();
    });

    //on click for sort date button
    $("#sort-date").click(function() {
        if (current_sort === 'date') {
            return;
        }
        current_sort = 'date';
        $("#sort-date")[0].className = "btn btn-active";
        $("#sort-category")[0].className = "btn btn-inactive";
        sort_entries('date');
    });

    //on click for sort category button
    $("#sort-category").click(function() {
        if (current_sort === 'category') {
            return;
        }
        current_sort = 'category';
        $("#sort-category")[0].className = "btn btn-active";
        $("#sort-date")[0].className = "btn btn-inactive";
        sort_entries('category');
    });

    // set listener for search
    $("#events-search").on("input", function() {
        if ($(this).data("lastval") !== $(this).val()) {
            $(this).data("lastval", $(this).val());
            //change action
            filters.query = $(this).val();
            filter_entries();
        }
    });
}

function filter_entries() {
    // Hides entries iff !(query subset of entry name)
    var curr_entries = document.getElementsByClassName("event-entry-container");
    var dateObj = new Date();
    var day = dateObj.getDate();
    var month = dateObj.getMonth();
    var today = new Date(dateObj.getFullYear(), month, day);
    for (var i = 0; i < curr_entries.length; i++) {
        if (!(curr_entries[i].children)) {
            continue;
        }
        var name = curr_entries[i].children[0].innerHTML.toLocaleLowerCase();
        var ev_id = curr_entries[i].id;
        var curr_event = get_event_by_id(ev_id);
        //if filters.today, check if event time is today, else if hidden show it.
        //this may be overridden by the query filters
        if (filters.today) {
            if (curr_event["date"].toDateString() !== today.toDateString()) {
                curr_entries[i].parentElement.hidden = true;
                continue;
            }
        } else {
            curr_entries[i].parentElement.hidden = false;
        }

        //if filters.past, check if event time + 24 hours is < today, else if hidden show it.
        //this may be overridden by the query filters
        if (filters.past) {
            if (curr_event["date_tomorrow"] < today) {
                curr_entries[i].parentElement.hidden = true;
                continue;
            }
        } else {
            curr_entries[i].hidden = false;
        }

        if (filters.query) {
            //if query not in entry, hide this li element.
            if (name.indexOf(filters.query.toLocaleLowerCase()) === -1) {
                curr_entries[i].parentElement.hidden = true;
            } else {
                curr_entries[i].parentElement.hidden = false;
            }
        }
    }
    filter_headers();
}

function filter_headers() {
    //Now filter out any section headers that have no real rows in them
    var headers = document.getElementsByClassName("header-tr");
    for (var i = 0; i < headers.length; i++) {
        var curr_header = headers[i];
        var next = curr_header.nextElementSibling;
        //go through all next siblings until they are no longer
        //events or one of them is not hidden 
        var hide = true;
        while (next.className === "event-tr") {
            if (!(next.getElementsByClassName('event-entry-container')[0].parentElement.hidden)) {
                hide = false;
            }
            next = next.nextElementSibling;
            if (!(next)) {
                break;
            }
        }
        curr_header.hidden = hide;
    }
}

function sort_entries(type) {
    //sorts entries by:
    //'category' or 'date'
    if (type === "category") {
        event_data.sort(function(a, b) {
            var textA = a.category.toUpperCase();
            var textB = b.category.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });

    } else if (type === "date") {
        event_data.sort(function(a, b) {
            var textA = a.date;
            var textB = b.date;
            return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
        });
    }
    //Remove old events list 
    $("#events-list")[0].innerHTML = "";

    //populate table
    populate_list(event_data);

    //set table row listeners
    set_row_click();

    //re-apply filter
    filter_entries();

}

function coloring(num_colors) {
    // Uses color-scheme.js to output a color scheme of length
    // num_colors to color-code categories.
    // Since we have an arbitrary number of categories but are limited to 16 colors 
    // by the ColorScheme lib, we'll assume we only have <= 16 categories,
    // which is a fair assumption. 
    // Constraint: want to match num_colors with color scheme closest in size.

    var starting_hue = 50;
    var scheme;
    var variation = 'pastel';
    var num_colors = 4;

    if (num_colors <= 12) {
        scheme = 'triade';
    } else if (num_colors <= 16) {
        scheme = 'tetrade';
    }


    var scm = new ColorScheme();
    scm.from_hue(starting_hue)
        .scheme(scheme)
        .distance(0.2)
        .add_complement(false)
        .variation(variation)
        .web_safe(true);

    var colors = scm.colors();
    return colors;
}
