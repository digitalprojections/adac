/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var database_url = "https://www.jjinventorysystem.com/test/ajphp_v41.php"; //JJpurchase
var username = Boolean(localStorage.username) ? localStorage.username : "";
var password = Boolean(localStorage.password) ? localStorage.password : "";
;
var pager = !Boolean(localStorage.getItem("pager")) ? 10 : localStorage.getItem("pager");
var startPage = 0; //pager value is the number of items/request results from this point onwards (indices of uniqunique_array) 
var today;
var big_data = [];
var page_data = [];
var big_string = "";
var sort_type;
var session;
var count_array = [];
var unique_array = [];
var current_array = [];
var new_entries = [];
var updated_entries = [];
var ind_lot_active;
var ind_lot_index;
var ind_lot_lotno;
var ind_lot_stack = []; //for raw data
var ind_lot_array = []; //for the sorted array
var indexName = "lot_no";
var visited;
var visdetObject = {};
var company_name;
var row_count; //row count for the currently selected auction
var btn_clicked; //auction btn clicked, to diff between automated action
var refresh_btn;
var rows;
var startIndex = 1;
var endIndex = 99999;
var xmlDoc;
var app_language = "jp";
var price_adjuster = !Boolean(sessionStorage.getItem("priceadjuster")) ? 0 : sessionStorage.getItem("priceadjuster");//first time use
var time_adjuster = !Boolean(localStorage.getItem("timeadjuster")) ? 1 : localStorage.getItem("timeadjuster"); //first time use
var normalprice = localStorage.getItem("normalprice");
var speed_dial_content = `
  <ons-speed-dial position="bottom right" direction="left">
    <ons-fab style="width:0;">
      <ons-icon icon="md-flag"></ons-icon>
    </ons-fab>    
    <ons-speed-dial-item style="background-color: #cdfdcd;">
      <ons-icon icon="md-check" value="Done" onclick="lot_kanri(event)"></ons-icon>
    </ons-speed-dial-item>
    <ons-speed-dial-item style="background-color: #ffd280;">
      <ons-icon icon="md-help" value="ASK" onclick="lot_kanri(event)"></ons-icon>
    </ons-speed-dial-item>
    <ons-speed-dial-item style="background-color: #ffd4db;">
      <ons-icon icon="md-close-circle" value="Cancel" onclick="lot_kanri(event)"></ons-icon>
    </ons-speed-dial-item>    
    <ons-speed-dial-item style="background-color: #24ff79;"  onclick="lot_kanri(event)" value="whatsapp">
      <ons-icon icon="md-whatsapp" ></ons-icon>
    </ons-speed-dial-item>    
    <ons-speed-dial-item style="background-color: ##24a7ff;"  onclick="lot_kanri(event)" value="group">
      <ons-icon icon="md-layers" ></ons-icon>
    </ons-speed-dial-item>    
  </ons-speed-dial>`;

var speed_dial_ind = `
  <ons-speed-dial position="bottom right" direction="left" style="bottom:-50px">
    <ons-fab style="width:0;">
      <ons-icon icon="md-flag"></ons-icon>
    </ons-fab>    
    <ons-speed-dial-item style="background-color: #cdfdcd;">
      <ons-icon icon="md-check" value="Done" onclick="lot_kanri(event)"></ons-icon>
    </ons-speed-dial-item>
    <ons-speed-dial-item style="background-color: #ffd280;">
      <ons-icon icon="md-help" value="ASK" onclick="lot_kanri(event)"></ons-icon>
    </ons-speed-dial-item>
    <ons-speed-dial-item style="background-color: #ffd4db;">
      <ons-icon icon="md-close-circle" value="Cancel" onclick="lot_kanri(event)"></ons-icon>
    </ons-speed-dial-item>    
    <ons-speed-dial-item style="background-color: #24ff79;"  onclick="lot_kanri(event)" value="whatsapp">
      <ons-icon icon="md-whatsapp" ></ons-icon>
    </ons-speed-dial-item>        
  </ons-speed-dial>`;

var curcar = `<ons-carousel-item>     
  </ons-carousel-item>`;

var carousel_content = "";

init_car_cont();

function init_car_cont()
{
    carousel_content = `
<ons-carousel style="height: 100%; width: 100%" initial-index="1" swipeable overscrollable auto-scroll auto-refresh class="maincarousel">
  <ons-carousel-item>     
  </ons-carousel-item>
  ${curcar}
    <ons-carousel-item>     
  </ons-carousel-item>
</ons-carousel>
<script>
$("ons-carousel.maincarousel").on("postchange", function(){
carousel_change(event);
}
);
</script>
`;
}

function getcurcardetails()
{
    var et = event.target;
    var curcardetails = $(et).parent().parent().parent().parent();
    ind_lot_lotno = curcardetails.find(".lotno")[0].getAttribute("stupidlot").trim();
    ind_lot_index = current_array.indexOf(ind_lot_lotno);
    fn.load('details_page.html', {data: {title: 'Detail Page'}});
    //console.log(et, ind_lot_index, curcardetails);    
}

var myIndex = function (x)
{
    var arr = [];
    for (i = 0; i < this.length; i++)
    {
        if (this[i].lot_no == x)
        {
            arr.push(this[i]);
        }
    }

    arr.sort(function (a, b) {
        return Number(a.lot_no.substr(a.lot_no.indexOf("//") + 2)) - Number(b.lot_no.substr(b.lot_no.indexOf("//") + 2)) || getRealNumber(Number(b.bid_price)) - getRealNumber(Number(a.bid_price));
    });
    return arr;
}

var populate_data = function ()
{
    var br = "<br>";

    this.data = big_data.myIndexOf(ind_lot_lotno); //is an array of JSON objects
    var caritem = this.getElementsByTagName("ons-carousel-item")[1];

    caritem.setAttribute("class", this.data[0].lotid);
    //img START
    var imgcarousel = document.createElement("ons-carousel");
    imgcarousel.setAttribute("initial-index", 1);
    imgcarousel.setAttribute("swipeable", "true");
    imgcarousel.setAttribute("auto-scroll", "true");
    imgcarousel.setAttribute("class", "img");

    var imgcarouselitem0 = document.createElement("ons-carousel-item");
    var imgcarouselitem1 = document.createElement("ons-carousel-item");
    var imgcarouselitem2 = document.createElement("ons-carousel-item");
    imgcarousel.appendChild(imgcarouselitem0);
    imgcarousel.appendChild(imgcarouselitem1);
    imgcarousel.appendChild(imgcarouselitem2);
    var indimg = document.createElement("img");
    indimg.style = "height:269px; width:100%";
    indimg.src = getOldURL(this.data[0].auction_sheet);
    var indimgf = document.createElement("img");
    indimgf.style = "width:100%;";
    indimgf.src = getOldURL(this.data[0].front_image);
    var indimgr = document.createElement("img");
    indimgr.style = "width:100%;";
    indimgr.src = getOldURL(this.data[0].rear_image);
    imgcarouselitem0.appendChild(indimg);
    imgcarouselitem1.appendChild(indimgf);
    imgcarouselitem2.appendChild(indimgr);

    //indimg.style = "width:100%;";
    //var imgdiv = document.createElement("div");
    //imgdiv.setAttribute("class", "center-content");
    //imgdiv.appendChild(indimg);
    var indpagecol = document.createElement("ons-col");
    indpagecol.setAttribute("style", "height:30%")
    var indpagerow = document.createElement("ons-row");
    indpagerow.appendChild(imgcarousel);
    indpagerow.appendChild(indpagecol);
    caritem.appendChild(indpagerow);
    imgcarousel.refresh();
    //img END

    //info section wrappers
    var indpagerow2 = document.createElement("ons-row");
    var indpagecol21 = document.createElement("ons-col");
    var indpagecol22 = document.createElement("ons-col");
    indpagerow2.appendChild(indpagecol21);
    indpagerow2.appendChild(indpagecol22);
    //info section wrappers END

    //aucname lot
    var company_name = document.createElement("h2");
    company_name.innerHTML = this.data[0].company_name;
    indpagecol21.appendChild(company_name);
    var exlot_no = document.createElement("h3");
    exlot_no.innerHTML = this.data[0].exlot_no;
    indpagecol21.appendChild(exlot_no);
    //aucname lot END
    caritem.appendChild(indpagerow2);

    //bid price
    var bid_price = document.createElement("h2");
    bid_price.innerHTML = this.data[0].bid_price != "" ? this.data[0].bid_price : "how much?";
    indpagecol22.appendChild(bid_price);
    var remarks = document.createElement("h4");
    remarks.innerHTML = this.data[0].remarks;
    indpagecol22.appendChild(remarks);

    //remaining details
    var remaining_details_row = document.createElement("ons-row");
    var remaining_details_col0 = document.createElement("ons-col");
    var remaining_details_col1 = document.createElement("ons-col");
    var remaining_details_col2 = document.createElement("ons-col");

    remaining_details_col0.innerHTML = this.data[0].car_name + br + this.data[0].type + br + this.data[0].grade;
    remaining_details_col1.innerHTML = this.data[0].year + br + this.data[0].shift + br + this.data[0].mileage;
    remaining_details_col2.innerHTML = "検：" + this.data[0].inspect + br + "評：" + this.data[0].condition + " (" + this.data[0].ext_grade + "/" + this.data[0].int_grade + ")";

    remaining_details_row.appendChild(remaining_details_col0);
    remaining_details_row.appendChild(remaining_details_col1);
    remaining_details_row.appendChild(remaining_details_col2);
    caritem.appendChild(remaining_details_row);
    //remaining details END

    var ind_remark_row = document.createElement("ons-row");
    var ind_remarkcol = document.createElement("ons-col");
    var ind_input = document.createElement("div");
    ind_input.id = "indinput";
    ind_input.setAttribute("class", "buyer_remark");
    ind_input.attachMessageData = attach_message_data;
    ind_input.getByLotid = get_by_lotid;
    ind_input.idbAddLot = idb_add_lot;
    ind_input.updateLot = update_entry;
    ind_input.saveStatus = save_status;
    ind_input.getByLotid(); //also get the status?
    ind_input.setAttribute("lotid", this.data[0].lotid);

    ind_remark_row.appendChild(ind_remarkcol);
    ind_remarkcol.appendChild(ind_input);
    caritem.appendChild(ind_remark_row);

    //control&&management
    var ind_contolpanel_row = document.createElement("ons-row");
    var ind_conpancol = document.createElement("ons-col");
    ind_contolpanel_row.appendChild(ind_conpancol);
    ind_conpancol.innerHTML = speed_dial_ind;
    caritem.appendChild(ind_contolpanel_row);
    //control&&management END

    document.querySelector("ons-speed-dial").showItems();
    $(".fab--bottom__right").css("bottom", "0");
    //
    //logging
    console.log(this.data[0], this.data);

    $(".buyer_remark")[0].getByLotid();
}
function get_auction_names() {
    current_array = [];
    startPage = 0;
    big_string = "";

    var data = {
        action: "auction_names",
        auction_date: today
    };
    ajax(data);
}

function set_password() {
    if ($("#new_password").val().length < 6)
    {
        ons.notification.alert(xmlDoc.getElementsByTagName(app_language)[0].getElementsByTagName("bad_password")[0].childNodes[0].nodeValue);
    } else {
        var data = {
            action: "password",
            username: $("#cur_username").val(),
            password: $("#cur_password").val(),
            new_password: $("#new_password").val()
        };
        ajax(data);
    }
}

function loadXMLDoc() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            xmlDoc = this.responseXML;
        }
    };
    xmlhttp.open("GET", "res/lang.xml", true);
    xmlhttp.send();
}


function ajax(d) {
    $.ajax({
        url: "https://ajpage.janjapanweb.com/ajphp_v41.php",
        type: "POST",
        data: d,
        beforeSend: function () {
            document.querySelector('#loading_circle').show();
        },
        success: function (data) {
            document.querySelector('#loading_circle').hide();
            if (data.indexOf("option>") > 0)
            {
                //auction_names
                //console.log(data);


                $(".select-input").html(data);
                if (company_name)
                {
                    $(".select-input").val(company_name);


                } else {
                    company_name = $("#auction_names").val();
                }

                try {
                    if (!row_count)
                    {
                        row_count = Number(document.querySelector("#auction_names")[document.querySelector("#auction_names").selectedIndex].getAttribute("count"));
                    }

                } catch (e)
                {
                    ons.notification.alert("Login required!");
                }
                big_data = undefined;
            } else if (data.indexOf("empty") > 0 || data.indexOf("No auction") >= 0)
            {
                console.log(data);
                $(".select-input").html("<option>No Data</option>");
                ons.notification.toast('No data for ' + today, {timeout: 1000, animation: 'fall'});
            } else if (data.indexOf("Password Updated") > 0)
            {
                //PASSWORD UPDATED
                localStorage.setItem("password", $("#new_password").val());
                ons.notification.alert("Success!");
            } else if (data.indexOf("password incorrect") > 0)
            {
                //
                ons.notification.alert(xmlDoc.getElementsByTagName(app_language)[0].getElementsByTagName("bad_password")[0].childNodes[0].nodeValue);
            } else
            {
                //document.getElementById("main_table").getElementsByTagName("tbody")[0].innerHTML = data;
                try {
                    big_data = data;
                    big_data = JSON.parse(big_data);
                    for (i in big_data)
                    {
                        big_data[i] = JSON.parse(big_data[i]);
                    }

                    startTransaction(big_data);
                    console.log("auction data ready to store");

                } catch (e)
                {

                }
            }

        }
    });
}

var login = function () {

    if (Boolean(localStorage.username))
    {
        username = localStorage.username;
        password = localStorage.password;
    } else {
        username = document.getElementById('username').value;
        password = document.getElementById('password').value;
    }


    //
    document.querySelector('#loading_circle').show();

    resetDate();

    var data = {
        action: "login",
        username: username,
        password: password
    };
    $.ajax({
        url: "https://ajpage.janjapanweb.com/ajphp_v41.php",
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        data: data,
        success: function (data) {
            document.querySelector('#loading_circle').hide();
            if (data.indexOf("incorrect") > 0 || data.indexOf("error") > 0)
            {
                ons.notification.alert('Incorrect username or password.');

            } else if (data.indexOf("Granted") > 0) {
                //ACCESS GRANTED
                localStorage.username = username;
                localStorage.password = password;
                session = true;
                ons.notification.toast('Login Success!', {timeout: 1000, animation: 'fall'});
                get_auction_names();
                fn.load('auctions.html');
            }
            //document.getElementById("main_table").getElementsByTagName("tbody")[0].innerHTML = data;
        }
    });

};

function next_page(d)
{
    big_string = "";



    if (d == "prev")
    {
        //go prev
        if (startPage > 0)
        {
            show_selected_chunk(startPage - Number(pager), startPage, indexName);
        }

    } else
    {
        if (current_array.length > startPage)
        {
            show_selected_chunk(startPage + Number(pager), startPage + Number(pager) * 2, indexName);
        }

    }

}

function get_startPage()
{

    try {
        return current_array.indexOf($(".lotno").eq(0).attr("stupidlot").trim()) >= 0 ? current_array.indexOf($(".lotno").eq(0).attr("stupidlot").trim()) : 0;
    } catch (e)
    {
        console.log(e.message);
        return 0;
    }


}

function get_shortName(c)
{
    if (c.indexOf(" ") > 0 || c.length > 6)
    {
        console.log(c);
        c = c.split(" ");
        for (var i = 0; i < c.length; i++)
        {
            c[i] = c[i].substr(0, 3);
        }
        c = c.join("-");
    }
    return c;
}

function create_unique_list()
{
    unique_array = [];
    new_entries = [];
    updated_entries = [];

    try {
        big_data.sort(function (a, b) {
            return Number(a.exlot_no) - Number(b.exlot_no) || getRealNumber(Number(b.bid_price)) - getRealNumber(Number(a.bid_price));
        });
        for (i in big_data) {
            var lotno = big_data[i]["exlot_no"];
            if (Number(lotno) >= Number(startIndex) && Number(lotno) <= Number(endIndex))
            {
//big_data[i]["detail_link"]:
//big_data[i]["start_price"]:                
//big_data[i]["chassis_code"]:
//big_data[i]["extension"]:
//big_data[i]["auction_sheet"]:
//big_data[i]["rear_image"]:
                if (!findTheSame(big_data[i]["lot_no"]))
                {
                    if (!checkTime(big_data[i]["created_at"]))
                    {
                        new_entries.push(big_data[i]["lot_no"]);
                    }
                    if (!checkTime(big_data[i]["updated_at"]))
                    {
                        updated_entries.push(big_data[i]["lot_no"]);
                    }
                    unique_array.push(big_data[i]["lot_no"]);
                }
            }
        }
        //big_data = undefined;
        current_array = unique_array;
        show_selected_chunk(startPage, startPage + Number(pager), "lot_no");
    } catch (e)
    {
        ons.notification.alert("You must login first!");
    }
}


//page_data[i]["detail_link"]:
//page_data[i]["start_price"]:                
//page_data[i]["chassis_code"]:
//page_data[i]["extension"]:
//page_data[i]["auction_sheet"]:
//page_data[i]["rear_image"]:

function show_big_data(page_data) {

    page_data.sort(function (a, b) {
        return Number(a.lot_no.substr(a.lot_no.indexOf("//") + 2)) - Number(b.lot_no.substr(b.lot_no.indexOf("//") + 2)) || getRealNumber(Number(b.bid_price)) - getRealNumber(Number(a.bid_price));
    });
    for (i in page_data) {
        var lotno = page_data[i]["exlot_no"];
        //console.log(page_data[i]["exlot_no"], 'page_data[i]["exlot_no"]');
        if (Number(lotno) >= Number(startIndex) && Number(lotno) <= Number(endIndex))
        {


            if (i == 0)
            {
                //lazy image
                big_string += `<ons-list-item tappable class='top_bid ${page_data[i]["id"] } new_data_${checkTime(page_data[i]["created_at"]) } new_price_${ checkTime(page_data[i]["updated_at"]) }' onmousedown='toggle_children(event)'><div class='left'><ons-row><ons-col><img class='list-item__thumbnail' src='${ getOldURL(page_data[i]["front_image"]) }' onmousedown='getcurcardetails(event)'></ons-col></ons-row>`;
                //hiding images temporarily
                //big_string += "<tr class='top_bid new_data_" + checkTime(page_data[i]["created_at"]) + " new_price_" + checkTime(page_data[i]["updated_at"]) + "' onmousedown='toggle_children(event)'><td>";
                //unique_array.push(page_data[i]["lot_no"]);

            } else {

                big_string += `<ons-list-item tappable class='hidden ${page_data[i]["id"] } losing new_data_${ checkTime(page_data[i]["created_at"]) } new_price_${ checkTime(page_data[i]["updated_at"]) }'><ons-row><ons-col><span class='aucname'>${ page_data[i]["company_name"] }</span></ons-col></ons-row>`;

            }
            var bidprice = page_data[i]["bid_price"];

            if (normalprice && !isNaN(bidprice))
            {
                bidprice = get_fixed_price(bidprice);
                price_adjuster = get_fixed_price(price_adjuster);
                if (bidprice !== 0)
                {
                    bidprice = bidprice + price_adjuster;
                }

            } else if (!normalprice && !isNaN(bidprice)) {

                if (Number(bidprice) >= 500)
                {
                    //the price was crazy style
                    bidprice = get_fixed_price(bidprice) + get_fixed_price(price_adjuster);
                    bidprice = bidprice * 10000;
                } else {
                    if (Number(bidprice) !== 0)
                    {
                        bidprice = get_fixed_price(bidprice) + get_fixed_price(price_adjuster);
                    }
                }

            }
            ////console.log(bidprice);

            big_string += `
            <ons-row><ons-col><span class='list-item__title lotno'  lotid='
            ${page_data[i]["id"] }
            ' stupidlot='
            ${page_data[i]["lot_no"] }
            '>
            ${lotno }
            </span></ons-col></ons-row><ons-row><ons-col><span class='carname'>
            ${page_data[i]["car_name"] }
            </span></ons-col></ons-row></div>
            <div class='rightside-lm'><ons-row><ons-col><span class='bidprice'>
            ${bidprice }
            </span></ons-col></ons-row><ons-row><ons-col><span  class='remarks'>
            ${page_data[i]["remarks"] }
            </span></ons-col></ons-row><ons-row><ons-col class="center-content"><img class='buyer_remark hidden' src='img/glyphicons-188-more.png' lotid='
            ${page_data[i]["id"] }
            ' onmouseup='show_remarks()'></ons-col></ons-row><ons-row><ons-col class="center-content"><div class='buyer_remarks' onmousedown='show_remark_modal()'></div>
            </ons-col></ons-row></div><div class='typeshiftyear'><ons-row><ons-col><span>
            ${page_data[i]["type"] }
            </span></ons-col></ons-row><ons-row><ons-col><span class='atmt'>
            ${page_data[i]["shift"] }
            </span></ons-col></ons-row><ons-row><ons-col><span class='cyear'>
            ${page_data[i]["year"] }
            </span></ons-col></ons-row><ons-row><ons-col><span class='km'>
            ${page_data[i]["mileage"] }
            </span></ons-col></ons-row></div>
            ${speed_dial_content }
            <div class='conieac'><ons-row><ons-col><span>
            ${page_data[i]["condition"] }
            </span></ons-col></ons-row><ons-row><ons-col><span class='ccc'>
            ${page_data[i]["cc"]}
            </span></ons-col></ons-row><ons-row><ons-col><span class='purchase_country'>
            ${page_data[i]["purchase_country"]}
            </span></ons-col></ons-row><ons-row><ons-col><span class='loginid'>
            ${page_data[i]["login_id"]}
            </span></ons-col></ons-row><ons-row><ons-col></div></ons-list-item>`;
        }
    }

    rows = $(".lotno");
    if (Boolean(check_kaishusu(page_data)))
    {
        //console.log("old data found");
    }

    if (!Boolean(big_string))
    {
        fn.load("main.html");

    }


}


function toggle_children(event)
{

    //console.log(event.currentTarget);
    event.currentTarget.querySelector('ons-speed-dial').toggleItems();

    var item = $(event.target).parent().find(".lotno")[0];
    var s = $(event.target).parent().index();
    ////console.log(event.target, s);
    //
    //var sub_ar = [item];

    for (var i = s + 1; i < rows.length; i++)
    {
////console.log(rows[i]);
        try {
            if (item.getAttribute("stupidlot") == rows[i].getAttribute("stupidlot") && rows[i].getAttribute("lotid") != item.getAttribute("lotid"))
            {
//sub_ar.push(rows[i]);
//$(item).parent().parent().removeClass("top_bid");
                if ($(rows[i]).parent().parent().hasClass("hidden")) {
                    $(rows[i]).parent().parent().removeClass("hidden");
                } else {
                    $(rows[i]).parent().parent().addClass("hidden");
                }
                console.log("looping ", i);
            } else {
//check the next row as item                        
                console.log("loop end");
                break;
            }
        } catch (e)
        {

            console.log(e.message);
            break;
        }

    }
}

function close_modals() {
    $("#remarkModal").fadeOut(100);
}
function indlot_kanri(event)
{
    var et = event.currentTarget;
    etppp = et.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
    console.log();
}
function lot_kanri(event) {

    var et = event.currentTarget;
    try {
        var etppp = document.getElementsByClassName(et.parentElement.parentElement.parentElement.parentElement.getElementsByClassName("buyer_remark")[0].getAttribute("lotid"))[0];
    } catch (e)
    {
        var etppp = et.parentElement.parentElement.parentElement.parentElement.parentElement;
    }

    //console.log(et.parentElement.parentElement.parentElement.parentElement.getElementsByClassName("buyer_remark")[0]);
    var status = et.getAttribute("value"); //manage lot status task directive
    console.log(status);
    switch (status)
    {
        case "Done":
            etppp.classList.remove("ASK");
            etppp.classList.remove("Cancel");
            if (etppp.classList.contains("Done"))
            {
                etppp.classList.remove("Done");
                status = "";
            } else {
                etppp.classList.add("Done");
            }
            break;
        case "ASK":
            etppp.classList.remove("Done");
            etppp.classList.remove("Cancel");
            if (etppp.classList.contains("ASK"))
            {
                etppp.classList.remove("ASK");
                status = "";
            } else {
                etppp.classList.add("ASK");
            }
            break;
        case "Cancel":
            etppp.classList.remove("ASK");
            etppp.classList.remove("Done");
            if (etppp.classList.contains("Cancel"))
            {
                etppp.classList.remove("Cancel");
                status = "";
            } else {
                etppp.classList.add("Cancel");
            }
            break;
        case "whatsapp":
            //apply a whatsapp mark to distinguish
            var ect3p = event.currentTarget.parentElement.parentElement.parentElement;
            shareIt(ect3p);
            console.log("whatsapp");
            break;
    }
    etppp.getElementsByClassName("buyer_remark")[0].saveStatus(status);
}

function shareIt(ect3p)
{
    try {
        window.plugins.socialsharing.shareViaWhatsApp(company_name + ", " + ect3p.getElementsByClassName("lotno")[0].getAttribute("stupidlot") + ", " + ect3p.getElementsByClassName("carname")[0].innerText, null /* img */, null /* url */, function ()
        {
            console.log('share ok')
        });
    } catch (e)
    {

        if (navigator.share) {
            try {
                navigator.share({
                    title: 'Check lot',
                    text: company_name + " " + ect3p.getElementsByClassName("lotno")[0].getAttribute("stupidlot") + " "  + big_data.myIndexOf(ect3p.getElementsByClassName("lotno")[0].getAttribute("stupidlot"))[0].auction_sheet + ", " + ect3p.getElementsByTagName("img")[0].src,
                    
                })
                        .then(() => console.log('Successful share'))
                        .catch((error) => console.log('Error sharing', error));
            } catch (e) {
                navigator.share({
                    title: $("#indinput").text(),
                    text: company_name + " " + $("h3")[0].innerText + " " + $("img")[0].src + " " + $("img")[1].src,
                })
                        .then(() => console.log('Successful share'))
                        .catch((error) => console.log('Error sharing', error));
            }
        }
    }

}

function manage_lots_status(lotid, status)
{
    switch (status)
    {
        case "Cancel":

            break;
    }
}

function  get_fixed_price(bidprice) {
    if (isNaN(bidprice))
    {
        return 0;
    } else {
        bidprice = Number(bidprice);
        if (bidprice >= 500 || bidprice <= -500)
        {
            bidprice = bidprice / 10000;
        }
    }

    return bidprice;
}

function show_calendar() {
    var options = {
        date: new Date(),
        mode: 'date'
    };
    function onSuccess(date) {
        //console.log('Selected date: ' + date.getFullYear(), date.getMonth(), date.getDate());
        today = format_my_date(date.getDate(), date.getMonth() + 1) + date.getFullYear();
        document.querySelector("#selected_date").innerHTML = today;
        get_auction_names();
        fn.load('auctions.html');
    }

    function onError(error) { // Android only
//alert('Error: ' + error);
    }

    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android)/i)) {
        console.log(navigator.userAgent);
        datePicker.show(options, onSuccess, onError);
    }
}

function format_my_date(d, m)
{
    var my_month = m;
    var my_date = d;
    if (m < 10)
    {
        my_month = "0" + String(m);
    }
    if (d < 10)
    {
        my_date = "0" + String(d);
    }

    return my_date + "/" + my_month + "/";
}

function resetDate() {
    var currentDate = new Date(new Date().getTime());
    var dd = currentDate.getDate();
    var mm = currentDate.getMonth() + 1;
    var yyyy = currentDate.getFullYear();
    //send_notifications(dd + "/" + mm + "/" + yyyy);

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }
    if (!today)
    {
        today = dd + '/' + mm + '/' + yyyy;
    }
    document.querySelector("#selected_date").innerHTML = today;
    $('#datepicker').val(today);
    document.addEventListener("deviceready", function () {
        window.FirebasePlugin.getToken(function (token) {
            // save this server-side and use it to push notifications to this device
            console.log("Device ready token", token);
        }, function (error) {
            console.error(error);
        });
        // Get notified when a token is refreshed
        window.FirebasePlugin.onTokenRefresh(function (token) {
            // save this server-side and use it to push notifications to this device
            console.log("Refresh to get new token: " + token);
        }, function (error) {
            alert(error);
        });
        // Get notified when the user opens a notification
        window.FirebasePlugin.onNotificationOpen(function (notification) {
            console.log(JSON.stringify(notification));
            ons.notification.alert(notification.body);
        }, function (error) {
            console.error(error);
        });
    }, false);
}



function check_kaishusu(d) {
    var bul = "";
    i = 0;
    while (i < d.length - 1)
    {
        if (d[i].lot_no.substr(0, d[i].lot_no.indexOf("//")) == d[i + 1].lot_no.substr(0, d[i + 1].lot_no.indexOf("//")))
        {
//console.log(d[i].lot_no.substr(0, d[i].lot_no.indexOf("//")));
        } else {
            bul = true;
            break;
        }
        i++;
    }
    return bul;
}

document.addEventListener('show', function (event) {
    var page = event.target;
    console.log(page.id); // can detect which page
    resetDate();
    switch (page.id)
    {
        case "main":
            $("#auction_but").show();
            $("#changeuser_but").show();
            $("#new_but").show();
            //$("#refresh_but").show();            
            $("ons-list-item.Done").show();
            $("ons-list-item.ASK").show();
            $("ons-list-item.Cancel").show();
            $("ons-list-item.New").show();
            show_final_result();
            break;
        case "auctions":
            $("#changeuser_but").show();
            //$("#refresh_but").show();            
            break;
        case "details_page":
            //load data from auction_data_module
            $("#carousel").html(carousel_content);
            var ind_page = document.querySelector("ons-carousel");
            ind_page.populate_data = populate_data;
            ind_page.populate_data();
            break;
        case "password":
            $("#changeuser_but").show();
            $("#auction_but").hide();
            $("#new_but").hide();
            //$("#refresh_but").hide();
            $("ons-list-item.Done").hide();
            $("ons-list-item.ASK").hide();
            $("ons-list-item.Cancel").hide();
            $("ons-list-item.New").hide();
            break;
        case "settings":
            $("#changeuser_but").show();
            $("#auction_but").show();
            $("#settings_but").hide();
            $("#new_but").hide();
            //$("#refresh_but").hide();
            $("ons-list-item.Done").hide();
            $("ons-list-item.ASK").hide();
            $("ons-list-item.Cancel").hide();
            $("ons-list-item.New").hide();
            break;
        default:
            $("#auction_but").hide();
            $("#changeuser_but").hide();
            $("#new_but").hide();
            //$("#refresh_but").hide();
            $("ons-list-item.Done").hide();
            $("ons-list-item.ASK").hide();
            $("ons-list-item.Cancel").hide();
            $("ons-list-item.New").hide();
            break;
    }

    if (document.getElementById('settings'))
    {
        switch (String(pager))
        {
            case "10":
                document.querySelectorAll("ons-radio")[0].checked = true;
                break;
            case "50":
                document.querySelectorAll("ons-radio")[1].checked = true;
                break;
        }

        $("#price_adjustment").val(price_adjuster);
        $("#timelimit_adjustment").val(time_adjuster);
        $("#price_display").prop("checked", get_true_false(normalprice));
    }



    try {
        var tester = memory_init();
    } catch (e) {
        loadXMLDoc();
        script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.setAttribute('onload', 'this.onload=function(){};memory_init_data()');
        script.setAttribute('onreadystatechange', 'if (this.readyState === "complete") this.onload()');
        script.src = 'auction_data_module.js';
        document.getElementsByTagName('body')[0].appendChild(script);
        scriptj = document.createElement('script');
        scriptj.type = 'text/javascript';
        scriptj.async = true;
        scriptj.setAttribute('onload', 'this.onload=function(){};memory_init()');
        scriptj.setAttribute('onreadystatechange', 'if (this.readyState === "complete") this.onload()');
        scriptj.src = 'local_data_mobid.js';
        document.getElementsByTagName('body')[0].appendChild(scriptj);
    }

});
function carousel_change(event)
{
    console.log(event.target);
    if (event.target.classList.contains("maincarousel"))
    {
        console.log(event.activeIndex);
        //temporary setup    
        if (event.activeIndex !== 1 && ind_lot_index > 0 && ind_lot_index < current_array.length)
        {
            curcar = $("ons-carousel ons-carousel-item")[event.activeIndex].outerHTML;
            init_car_cont();
            $("#carousel").html(carousel_content);
        }
    } else {
        //the other one
    }
}
function setRange()
{
    startIndex = $("#start_index").val();
    endIndex = $("#end_index").val();
    var bul;
    if (Number(startIndex) < Number(endIndex))
    {
        bul = true;
    }
    return bul;
}

function show_range()
{
    document.querySelector('#loading_circle').show();
    //local data first
    if (big_data)
    {
        create_unique_list();
        console.log("creating the list");
    } else {
        company_name = $("#auction_names").val();
        row_count = Number(document.querySelector("#auction_names")[document.querySelector("#auction_names").selectedIndex].getAttribute("count"));
        select_auction();
    }
}

function select_auction() {
    console.log("select_auction");
    if (Boolean(setRange()))
    {

        get_by_auction();
    } else {
        ons.notification.alert("Bad lot range");
    }
}

function  selectAll(event)
{
    event.target.getElementsByTagName("input")[0].select();
}

function set_price_display_style(event)
{
    localStorage.setItem("normalprice", get_true_false(event.target.checked));
    normalprice = get_true_false(event.target.checked);
}

function set_priceadjuster(event) {
    price_adjuster = event.target.value;
    sessionStorage.priceadjuster = price_adjuster;
}
function set_time_adjuster(event) {
    time_adjuster = event.target.value;
    localStorage.setItem("timeadjuster", time_adjuster);
}
function getRealNumber(n)
{
    if (n >= 500)
    {
        return n / 10000;
    } else {
        return n;
    }
}
function getOldURL(u)
{
    var piclink = u;
    piclink = piclink.replace(/iauc_pic\/[0-9]+/g, "pv/IMG_SVR_PASS");
    return piclink;
}

function fixDate(rd)
{
    var nd;
    var y;
    var m;
    var d;
    var hr;
    var min;
    var sec;
    nd = rd.split(" ");
    nd[0] = nd[0].split("-");
    nd[0] = nd[0][1] + "/" + nd[0][2] + "/" + nd[0][0];
    nd = nd.join(" ");
//nd = Date.parse(nd);
    return nd;
}

function checkTime(ct)
{

    var bul;
    //console.log(ct, ct != null);
    if (ct != "null")
    {
        ct = fixDate(ct);
        var today = new Date();
        today.getMonth();
        var morning = Date.parse(ct);
        var d = new Date();
        d.setTime(morning);
        //console.log(d);
        //CLEARING YEAR
        if (today.getFullYear() == d.getFullYear())
        {
//this or previous month OK    
            if (today.getMonth() == d.getMonth())
            {
//clearing date
                if (today.getDate() == d.getDate())
                {
//clearing hours
                    if (d.getHours() < time_adjuster)
                    {
                        bul = true;
                    }
                } else if (today.getDate() > d.getDate())
                {
                    bul = true;
                }
            } else if (today.getMonth() > d.getMonth())
            {
                bul = true;
            }
        } else if (today.getFullYear() > d.getFullYear())
        {
            bul = true;
        }
    } else {
        bul = true;
    }

    return bul;
}

function getRealCount()
{
    count_array = [];
    for (var i = 0; i < big_data.length; i++)
    {
        if (Boolean(sameLot(big_data[i].lot_no)))
        {

        } else {
            count_array.push(big_data[i].lot_no);
        }
    }
    return count_array.length;
}

function sameLot(item)
{
    var bul;
    for (var i = 0; i < count_array.length; i++)
    {
        if (count_array[i] == item) {
            bul = true;
        }

    }
    return bul
}


function findTheSame(element) {
    bul = "";
    for (var i = 0; i < unique_array.length; i++)
    {
        if (unique_array[i] === element)
        {
            bul = true;
        }
    }

    return bul;
}

function get_true_false(v)
{
    return String(v) == "true" ? "true" : "";
}

////////////////////////////////////////////

window.fn = {};
window.fn.open = function () {
    var menu = document.getElementById('menu');
    menu.open();
};
window.fn.load = function (page) {

    switch (arguments[0])
    {
        case "all":
            show_lists("all")
            break;
        case "done":
            show_lists("done");
            break;
        case "ask":
            show_lists("ask");
            break;
        case "cancel":
            show_lists("cancel");
            break;
        case "new":
            show_lists("new");
            break;
        case "updated":
            show_lists("updated");
            break;
        case "refresh":
            get_auction_names();
            fn.load("auctions.html");
            //show_lists("refresh");
            break;
        case "details":
            fn.load("details_page.html");
            //show details;            
            break;
        default:
            var content = document.getElementById('content');
            var menu = document.getElementById('menu');
            content.load(page)
                    .then(menu.close.bind(menu));
            show_data();
            break;
    }


};
function show_lists(listname)
{

    big_string = "";
    $("#main_table ons-list-item").addClass("hidden");
    switch (listname)
    {
        case "all":
            $("#main_table ons-list-item.top_bid").removeClass("hidden");
            $("#heading2").text(company_name + ": " + unique_array.length);
            //can potentially return to the last position in pager
            indexName = "lot_no";
            current_array = unique_array;
            show_selected_chunk(startPage, startPage + Number(pager), indexName);
            break;
        case "done":
            $("#main_table ons-list-item.Done").removeClass("hidden");
            $("#heading2").text(company_name + ": " + $("#main_table tr.Done").length);
            indexName = "lotid";
            get_by_status("Done"); //local_data_mobid

            break;
        case "ask":
            $("#main_table ons-list-item.ASK").removeClass("hidden");
            $("#heading2").text(company_name + ": " + $("#main_table tr.ASK").length);
            indexName = "lotid";
            get_by_status("ASK");
            break;
        case "cancel":
            $("#main_table ons-list-item.Cancel").removeClass("hidden");
            $("#heading2").text(company_name + ": " + $("#main_table tr.Cancel").length);
            indexName = "lotid";
            get_by_status("Cancel");
            break;
        case "new":
            $("#main_table ons-list-item.top_bid.new_data_undefined").removeClass("hidden");
            $("#main_table ons-list-item.top_bid.new_price_undefined").removeClass("hidden");
            $("#heading2").text(company_name + ": " + document.querySelectorAll(".top_bid:not(.hidden)").length);
            indexName = "lot_no";
            current_array = new_entries;
            show_selected_chunk(startPage, startPage + Number(pager), indexName);
            break;
        case "updated":
            $("#main_table ons-list-item.top_bid.new_data_undefined").removeClass("hidden");
            $("#main_table ons-list-item.top_bid.new_price_undefined").removeClass("hidden");
            $("#heading2").text(company_name + ": " + document.querySelectorAll(".top_bid:not(.hidden)").length);
            indexName = "lot_no";
            current_array = updated_entries;
            show_selected_chunk(startPage, startPage + Number(pager), indexName);
            break;
    }
}

function show_data() {
    try {
        document.querySelector("#main_table").innerHTML = big_string;
        big_string = "";
    } catch (e) {

    }
}

function set_radio_pager(v)
{
    pager = Number(v);
    localStorage.pager = v;
}