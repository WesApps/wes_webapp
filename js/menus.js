$(document).ready(intialize_menus);

var all_entries;
var menus_container;

function intialize_menus() {
    menus_container = $("#menu-list-container")[0];
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

    var latenight = results["latenight"];
    var redandblack = results["redandblack"];
    var weswings = results["weswings"];
    var starandcrescent = results["starandcrescent"];
    var summerfields = results["summerfields"];
    var usdan = results["usdan"];

    // usdan, summies, weswings, latenight, red and black
    process_usdan(usdan);
    process_summerfields(summerfields);
    process_latenight(latenight);
    process_weswings(weswings);
    process_redandblack(redandblack);
}

function process_type0(data, title, id) {
    // Process Usdan data type
    var menu_element = document.createElement("div");
    menu_element.setAttribute("id", id);
    var menu_break = document.createElement("br");
    var title_element = document.createElement("span");
    title_element.setAttribute("class", "title");

    // append title to menu element
    menu_element.appendChild(title_element);
    menus_container.appendChild(menu_element);
    menus_container.appendChild(menu_break);

    var data_title = title;
    title_element.innerHTML = data_title;

    var usdan_day = (data.length > 0) ? data[0] : "";

    // remove the timestamp from the object, don't need it.
    delete usdan_day["time"];

    if (!usdan_day) {
        var item_title_element = document.createElement("span");
        item_title_element.innerHTML = "No Usdan Menu Today";
        item_title_element.setAttribute("class", "item-title");
        menu_element.appendChild(item_title_element);
        return;
    }
    for (i in usdan_day) {
        if (!(usdan_day[i])) {
            continue;
        }
        var meal_title_element = document.createElement("div");
        var title = i;
        meal_title_element.innerHTML = title;
        meal_title_element.setAttribute("class", "meal-title");
        menu_element.appendChild(meal_title_element);

        for (j in usdan_day[i]) {
            var category_title_element = document.createElement("div");
            category_title_element.innerHTML = j;
            category_title_element.setAttribute("class", "category-title");
            menu_element.appendChild(category_title_element);
            var category_items = usdan_day[i][j]

            for (k in category_items) {
                var item_title_element = document.createElement("div");
                var item_title = category_items[k]["title"].replace(";","");
                item_title_element.innerHTML = item_title;
                item_title_element.setAttribute("class", "item-title");
                menu_element.appendChild(item_title_element);

                var item_description_element = document.createElement("div");
                var description = category_items[k]["extra"];
                item_description_element.innerHTML = description;
                item_description_element.setAttribute("class", "item-description");
                menu_element.appendChild(item_description_element);
            }
        }
    }
}


function process_type1(data, title, id) {
    // Processes Late Night and Summerfields data types.
    var menu_element = document.createElement("div");
    menu_element.setAttribute("id", id);
    var menu_break = document.createElement("br");
    var title_element = document.createElement("span");
    title_element.setAttribute("class", "title");

    // append title to menu element
    menu_element.appendChild(title_element);
    menus_container.appendChild(menu_element);
    menus_container.appendChild(menu_break);

    var data_title = title;
    title_element.innerHTML = data_title;
    for (i in data) {
        var item_title_element = document.createElement("span");
        var title = data[i]["title"];
        item_title_element.innerHTML = title;
        item_title_element.setAttribute("class", "item-title");
        menu_element.appendChild(item_title_element);

        var item_price_element = document.createElement("span");
        var price = data[i]["price"];
        item_price_element.innerHTML = price;
        item_price_element.setAttribute("class", "item-price");
        menu_element.appendChild(item_price_element);

        var item_description_element = document.createElement("div");
        var description = data[i]["description"];
        item_description_element.innerHTML = description;
        item_description_element.setAttribute("class", "item-description");
        menu_element.appendChild(item_description_element);
    }
}

function process_type2(data, title, id) {
    var menu_element = document.createElement("div");
    menu_element.setAttribute("id", id);
    var menu_break = document.createElement("br");
    var name_element = document.createElement("span");
    name_element.setAttribute("class", "title");

    // append title to menu element
    menu_element.appendChild(name_element);
    menus_container.appendChild(menu_element);
    menus_container.appendChild(menu_break);

    var data_name = title;
    name_element.innerHTML = data_name;
    for (i in data) {
        var item_name_element = document.createElement("span");
        var name = data[i]["name"];
        item_name_element.innerHTML = name;
        item_name_element.setAttribute("class", "name-description");
        menu_element.appendChild(item_name_element);

        var item_data = data[i]["data"];

        var item_price_element = document.createElement("span");
        var price = item_data["price"][0];
        item_price_element.innerHTML = price;
        item_price_element.setAttribute("class", "item-price");
        menu_element.appendChild(item_price_element);

        var item_info_element = document.createElement("div");
        var info = item_data["info"] ? item_data["info"][0] : "";
        item_info_element.innerHTML = info;
        item_info_element.setAttribute("class", "item-description")
        menu_element.appendChild(item_info_element);

    }

}


function process_latenight(data) {
    process_type1(data, "Late Night", "latenight")
}

function process_summerfields(data) {
    process_type1(data, "Summerfields", "summerfields")
}

function process_usdan(data) {
    process_type0(data, "Usdan Daily Menu", "usdan")
};

function process_redandblack(data) {
    process_type2(data, "Red and Black", "redandblack")
}

function process_weswings(data) {
    process_type2(data, "Wes Wings", "weswings")
}
