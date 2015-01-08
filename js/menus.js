$(document).ready(intialize_menus)

var all_entries;

function intialize_menus() {
    get_menus();
}

function get_menus() {
    var data = $.getJSON("http://wesapi.org/api/menus/all?maxresults=", function(res) {
        if (!(res)) {
            return {}
        } else {
            //once we get the data, call the callback
            //function to put it into the html page.
            return menu_callback(res);
        }
    })
}

//handles fetch of menus
function menu_callback(res) {
    console.log(res)
        var result_count = res["Result Count"];
        var results = res["Results"];

        var latenight = res["latenight"];
        var redandblack = res["redandblack"];
        var starandcrescent = res["starandcrescent"];
        var summerfields = res["summerfields"];
        var usdan = res["usdan"];

        // usdan, summies, weswings, latenight, red and black
        process_usdan(usdan);
        process_summerfields(usdan);
        process_weswings(weswings);
        process_latenight(usdan);
        process_redandblack(redandblack);



        // for (i in results) {
        //     var name = results[i]["name"];
        //     var raw_data = results[i]["data"];
        //     var filter = raw_data["filter"] ? raw_data["filter"][0] : "";
        //     var price = raw_data["price"] ? raw_data["price"][0] : "";
        //     var description = raw_data["description"] ? raw_data["description"][0] : "";
        //     var title = raw_data["title"] ? raw_data["title"][0] : "";
        // }
    }
    //var data_ul = document.createElement("ul");
    /*for (d in raw_data) {
            var data = raw_data[d];
            var field_li = document.createElement("li");
            var field_title = document.createElement("div");
            var field_data = document.createElement("div");
            field_title.setAttribute("class", "field-div");
            field_data.setAttribute("class", "field-data");
            field_li.appendChild(field_title);
            field_li.appendChild(field_data);
            data_ul.appendChild(field_li);
            field_title.innerHTML = d + ": ";
            if (typeof(data) == "object") 
            {
                for (j in data) 
                {
                    var tmp = data[j] + "<br>"
                    field_data.innerHTML += tmp;
                }
            } else 
                {
                field_data.innerHTML = data;
                }
        }
    var newEntry = document.createElement("li");
        newEntry.setAttribute("class", "entry-li")

    //name
    var entryName = document.createElement("div");
    entryName.setAttribute("class", "entry-name");
    entryName.innerHTML = name;

    //data
    var entryData = document.createElement("div");
    entryData.setAttribute("class", "entry-data");
    entryData.appendChild(data_ul);
    newEntry.appendChild(entryName);
    newEntry.appendChild(entryData);
    menlist.appendChild(newEntry);

    //set 'all_entries'
        all_entries = menlist;

        //set listener for searching
        $("#menu-search").on("input", function(e) {
            if ($(this).data("lastval") != $(this).val()) {
                $(this).data("lastval", $(this).val());
                //change action
                filterEntries($(this).val())
            };
        });
}
}


function filterEntries(query) {
    // Hides entries iff !(query subset of entry name)
    curr_entries = all_entries.getElementsByClassName("entry-li");
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




*/
