//EXAMPLE!

//on page load, initialize
$(document).ready(initialize_events)

function initialize_events() {
    get_events_today();
}

//ajax request to api to get json
function get_events_today() {
    var data = $.getJSON("http://104.131.29.221/api/events/today", function(res) {
        if (!(res)) {
            return {};
        } else {
            //once we get the data, call the callback
            //function to put it into the html page.
            return events_callback(res);
        }
    })
}

//handles successful fetch of today's events
function events_callback(res) {
    console.log(res);
    result_count = res["Result Count"];
    results = res["Results"];

    //dumping the JSON data to a string
    results_str = JSON.stringify(results);
    $("#events_result_count")[0].innerHTML = "Result Count: " + res["Result Count"];
    $("#events_results")[0].innerHTML = "Result: " + results_str;
}
