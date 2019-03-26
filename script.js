
function printFilms(data,voto){

  var fList = $(".filmList")
  var template = $("#film-template").html();
  var comp = Handlebars.compile(template);
  var film = comp(data);
  var item = $(film);

  // riempimento stelle
  
  var stars = item.find("li.stars").children(".fa-star");

  for (var i = 0; i < voto; i++) {
    stars.eq(i).addClass("accesa");
  }

  item.appendTo(fList);

}

function getFlag(lang){

  switch (lang) {
    case "en":
      return "img/Great Britain.svg";

    case "ja":
      return "img/Japan.svg";

    case "it":
      return "img/Italy.svg";

    case "zh":
      return "img/China.svg";

    default:
    return "";
  }
}

// la funzione mi prepara i dati da passare a handlebars nei vari casi per
// tv/movie - poster - bandiera/codice-lingua

function getResults(list,type){

  for (var i = 0; i < list.length; i++) {

    var item = list[i];
    var voto = Math.ceil(item.vote_average/2);
    var dati = {

      rating: voto,
    }

    //gestione poster

    if (item.poster_path != null){

      dati.poster = "https://image.tmdb.org/t/p/w154/" + item.poster_path;
    }
    else{

      dati.poster = "img/no-image.jpg"
    }


    //caso movie

    if(type == "movie"){

      dati.titolo = item.title;
      dati.ogTitolo = item.original_title;
      dati.tipo = "film"
    }
    // caso tv
    else if(type == "tv"){

      dati.titolo = item.name;
      dati.ogTitolo = item.original_name;
      dati.tipo = "tv-show"
    }

    // gestione bandiere

    var flagUrl = getFlag(item.original_language);

    if( flagUrl != ""){

      dati.lingua = "";
      dati.flag = flagUrl;
    }

    else{

      dati.lingua = item.original_language;
      dati.flag = "";
    }

    printFilms(dati,voto);
  }
}

// chiamata api con in il type (tv, movie) in ingresso
// per estrarre le serie tv , richiamo apiCall con type = tv se:
// non è la prima chiamata (page = ""), se sono nell'ultima pagina dei movie  o se le pagine del movie è solo una

function apiCall(search,page,type){

 var outData = {

   api_key: "be7a5b068bb701d40ef499c039960c53",
   language: "it-IT",
   query: search,
   page: page,
  }

  var url = "https://api.themoviedb.org/3/search/" + type;

  $.ajax({

    url: url,
    data: outData,
    method: "GET",

    success: function(inData, stato){

      if(page == "" &&  inData.total_pages > 1 && type == "movie"){
        genPages(inData.total_pages);
      }

      if (type == "movie" && ( page == inData.total_pages  || inData.total_pages == 1 || inData.total_results == 0 )){
        apiCall(search,"","tv");
      }

      console.log(inData.results);
      if(inData.total_results > 0){

        getResults(inData.results,type);
      }
    },
    error: function(request, stato ,error){

      console.log("error");
    }
  })
}

function genPages(pageNum){

  var pages = $(".pages");

  console.log(pageNum);
  for (var i = 1; i <= pageNum; i++) {

    var dati = {
      number: i,
    }

    var template = $("#pages-template").html();
    var comp = Handlebars.compile(template);
    var pNum = comp(dati);

    pages.append(pNum);
  }
  pages.children(".page-num").eq(0).addClass("current")
}

function clickPage(){

  var pages = $(".pages");

  pages.on("click",".page-num",function(){

    var pag = parseInt($(this).text(),10);

    $(".filmList").empty()
    apiCall( $("#search-input").val(), pag , "movie");

    pages.children().removeClass("current");
    $(this).addClass("current");
  })

}

function getVal(elem){

  $(".filmList").empty();
  $(".pages").empty();
  apiCall(elem.val(),"","movie")
}

function init(){

  var srcImp = $("#search-input");
  var srcBtn = $("#search-button");

  srcImp.keyup(function(e){

    if(e.keyCode == 13 ){getVal(srcImp);}
  });

  srcBtn.click(function(){

    getVal(srcImp);
  })

  clickPage();
}

$(document).ready(init)
