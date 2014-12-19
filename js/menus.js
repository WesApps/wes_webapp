$(document).ready(initialize_menus)

var all_entries;

function intialize_menus (){
	get_menus();
}

function get_menus () {
	var data = $.getJSON("http://104.131.29.221/api/menus/all?maxresults=", function(res){
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
function menu_callback(res){
	var result_count = res["Result Count"];
	var results = res["Results"];

	var menulist = $("#menu-list")[0]

	for (i in results){
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
    menulist.appendChild(newEntry);

	//set 'all_entries'
        all_entries = menulist;

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







