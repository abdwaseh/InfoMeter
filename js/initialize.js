function filter(){
  let str = $("#filterInput").val()
  let type = $("#dropdown").val()
  let checkType = true
  let checkSoundex = true
  let _soundex = soundex(str)
  if(str.trim().length == ""){
    checkSoundex = false
  }
  if(type == "All"){
    checkType = false
  }
  let rows = $('tbody > tr')
  let hideList = [], showList = []
  for(let row of rows){
    let c1 = checkSoundex? $(row).attr('soundex') == _soundex || $(row).attr('content').indexOf(str) !== -1: true
    let c2 = checkType? $(row).attr('type') == type: true
    if(c1 && c2){
      $(row).show()
    }else{
      $(row).hide()
    }
  }
}

const soundex = function (s) {
     var a = s.toLowerCase().split(''),
         f = a.shift(),
         r = '',
         codes = {
             a: '', e: '', i: '', o: '', u: '',
             b: 1, f: 1, p: 1, v: 1,
             c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
             d: 3, t: 3,
             l: 4,
             m: 5, n: 5,
             r: 6
         };

     r = f +
         a
         .map(function (v, i, a) { return codes[v] })
         .filter(function (v, i, a) {
             return ((i === 0) ? v !== codes[f] : v !== a[i - 1]);
         })
         .join('');

     return (r + '000').slice(0, 4).toUpperCase();
}

function startProcess(url){
  $("#mainContainer").hide()
  $("#loader").show()

  const proxyurl = "https://cors-anywhere.herokuapp.com/";
  fetch(proxyurl + url) // https://cors-anywhere.herokuapp.com/https://example.com
  .then(response => response.text())
  .then(contents => {
    let wordIndex = {}, emailIndex = {}, mobileIndex = {}
    let emailList = contents.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)  ||  []
    contents = contents.replace(/\n/igm, '')
    contents = contents.replace(/<!--.*?-->/g,"")
    contents = contents.replace(/<script.*?>.*?<\/script>/ig, '')
    contents = contents.replace(/<link.*?\/>/ig, '')
    contents = contents.replace(/<{1}[^<>]{1,}>{1}/g," ")
    contents = contents.replace(/[^\w\s]/gi, '')
    contents = contents.replace(/ +/g, " ").trim()
    contents = contents.split(" ")
    for(let word of contents){
      word = word.trim()
      if(word == "" ){
        continue
      }

      if(word.length > 20){
        word = word.substr(0, 20)+"..."
      }

      if(!isNaN(word) && word.length > 5){
        if(mobileIndex[word]){
          mobileIndex[word]++
        }else{
          mobileIndex[word] = 1
        }
        continue
      }

      word = word.toLowerCase()
      if(wordIndex[word]){
        wordIndex[word]++
      }else{
        wordIndex[word] = 1
      }
    }

    for(let email of emailList){
      if(email.length  > 20){
        email = email.substr(0,20)+"..."
      }
      if(emailIndex[email]){
        emailIndex[email]++
      }else{
        emailIndex[email] = 1
      }
    }

    let sortable = [];
    for(let word in wordIndex) {
      sortable.push([word, wordIndex[word], "Words", "emp"]);
    }
    for(let mobile in mobileIndex){
      sortable.push([mobile, mobileIndex[mobile], "Mobile", "info"])
    }
    for(let email in emailIndex){
      sortable.push([email, emailIndex[email], "Email", "success"])
    }
    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });

    $("#wordscount").html(Object.keys(wordIndex).length)
    $("#emailcount").html(Object.keys(emailIndex).length)
    $("#mobilecount").html(Object.keys(mobileIndex).length)

    let str = ""
    let i = 1
    for(let arr of sortable){
      str += "<tr class='"+arr[3]+"' soundex="+soundex(arr[0])+" type="+arr[2]+" content="+arr[0]+"><td>"+i+"</td><td>"+arr[0]+"</td><td>"+arr[1]+"</td><td>"+arr[2]+"</td>"
      // str += "<tr  soundex="+soundex(arr[0])+" ><td>"+i+"</td><td>"+(arr[0]||"-")+"</td><td>"+(arr[1]||0)+"</td><td>Word</td></tr>"
      i++
    }
    $("#myTable > tbody").html(str)
    $("#loader").hide()
    $("#mainContainer").show()
  })
  .catch()
}

function start(){
  let url = $('#urlInput').val()
  let re = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
  if(!re.test(url)){
    alert("Invalid url")
  }else{
    startProcess(url)
  }
}

$(document).ready(function(){
  $('#filterInput').on('input',filter);
  // startProcess("https://stackoverflow.com/questions/14440444/extract-all-email-addresses-from-bulk-text-using-jquery")
  // startProcess("https://bothook.com")
  // startProcess("http://mjcollege.ac.in/")
})
