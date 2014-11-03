//on page load, initialize
$(document).ready(initialize_directory)

var all_entries;

function initialize_directory() {
    get_directory();
}

//ajax request to api to get json
function get_directory() {
    var data = $.getJSON("http://104.131.29.221/api/directory", function(res) {
        if (!(res)) {
            return {};
        } else {
            //once we get the data, call the callback
            //function to put it into the html page.
            return directory_callback(res);
        }
    })
}

//handles successful fetch of directory
function directory_callback(res) {
    var result_count = res["Result Count"];
    var results = res["Results"];

    var dirlist = $("#directory-list")[0]

    //display results
    for (i in results) {
        var name = results[i]["name"];
        var raw_data = results[i]["data"];
        var data_ul = document.createElement("ul");
        for (d in raw_data) {
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
            if (typeof(data) == "object") {
                for (j in data) {
                    var tmp = data[j] + "<br>"
                    field_data.innerHTML += tmp;
                }
            } else {
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
        dirlist.appendChild(newEntry);

        //set 'all_entries'
        all_entries = dirlist;

        //set listener for searching
        $("#directory-search").on("input", function(e) {
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


// function checkScrollBars() {
//     var b = $('body');
//     var normalw = 0;
//     var scrollw = 0;
//     if (b.prop('scrollHeight') > b.height()) {
//         normalw = window.innerWidth;
//         scrollw = normalw - b.width();
//         $("body").css({
//             marginRight: '-' + scrollw + 'px'
//         });
//     }
// }


// $(document).ready(function() {
//     if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
//         checkScrollBars()
//     }
// })