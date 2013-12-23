var p;
var density = 0.05;
var type = 2; //'Squares or diamonds - it will alternate between them at the moment
var rate = 5; //Number of squares to draw for each animation frame
var loop = true;

//Get jQuery

function getScript(url, success) {
  var script = document.createElement('script');
  script.src = url;
  var head = document.getElementsByTagName('head')[0],
      done = false;
  // Attach handlers for all browsers
  script.onload = script.onreadystatechange = function() {
    if (!done && (!this.readyState
          || this.readyState == 'loaded'
          || this.readyState == 'complete')) {
            done = true;
            success();
            script.onload = script.onreadystatechange = null;
            head.removeChild(script);
          }
  };
  head.appendChild(script);
}

//When jQuer is loaded, asynchronously run everything else

getScript('http://code.jquery.com/jquery-1.10.2.min.js',function() {

    //The percolator object - give it any canvas element and it will percolate all over it
    var percolator = function(initialdensity,element,type,rate){

      var width = element.width();
      var height = element.height();
      var square = 3;
      var gap = 1;
      var t = this;
      var nx = Math.round(width/(square+gap));
      var ny = Math.round(height/(square+gap));

      this.bgcol = 'rgba(255,255,255,1)';
      this.fgcol = 'rgba(0,0,0,0)';
      var ctx = element[0].getContext('2d');


      this.initialize = function(){
        //Initialize the s, the initial condition
        t.s = [];
        //type = (type+1)%2;
        for(var ii=0;ii<nx;ii++){
          t.s[ii] = [];
          for(var jj=0;jj<ny;jj++){
            t.s[ii][jj] = Math.random()<initialdensity ? 1 : 0;
          }
        }
        ctx.fillStyle = t.bgcol;
        ctx.fillRect(0,0,width,height);
        this.render();
      };

      this.arrayloop = function(f){
        for(var ii = 0; ii < nx; ii++){
          for(var jj = 0; jj< ny; jj++){
            f(ii,jj);    
          }
        }
      }


      var np = function(ii,jj){
        return t.s[(ii+nx)%nx][(jj+ny)%ny];
      }

      var updaterule = [function(ii,jj){
        var change = false;
        if (np(ii,jj) === 0){
          change = np(ii-1,jj-2) & np(ii-1,jj-1) & np(ii-1,jj) & np(ii-1,jj+1) & np(ii-1,jj+2);
          change = change |  np(ii+1,jj-2) & np(ii+1,jj-1) & np(ii+1,jj) & np(ii+1,jj+1) & np(ii+1,jj+2);
          change = change |  np(ii-1,jj-1) & np(ii-1,jj-1) & np(ii,jj-1) & np(ii+1,jj-1) & np(ii-1,jj-1);
          change = change |  np(ii-2,jj+1) & np(ii-1,jj+1) & np(ii,jj+1) & np(ii+1,jj+1) & np(ii+2,jj+1);
        }
        return change;
      },
          function(ii,jj){
            var change = false;
            if (np(ii,jj) === 0){
              change = np(ii,jj-1) & np(ii+1,jj);
              change = change | np(ii+1,jj) & np(ii,jj+1);
              change = change | np(ii,jj+1) & np(ii-1,jj);
              change = change | np(ii-1,jj) & np(ii,jj-1);
            }
            return change;
          },
          function(ii,jj){
            var change = false;
            if(np(ii,jj)===0){
            change = (np(ii,jj+1) + np(ii+1,jj) + np(ii-1,jj-1)) >=2;
            //change = change | (np(ii,jj+1) + np(ii-1,jj) + np(ii+1,jj-1)) >= 2;
            //change = change | (np(ii-1,jj) + np(ii,jj-1) + np(ii+1,jj+1)) >= 2;
            //change = change | (np(ii-1,jj+1) + np(ii+1,jj)) + np(ii,jj-1) >= 2;
            }
            return change;
          }
      ];


      this.update = function(){
        var changes = [];

        t.arrayloop(function(ii,jj){
          var change = updaterule[type](ii,jj);
          if(change){
            changes.push([ii,jj]);
          }
        });


        if(changes.length>0){

          var indices = [];
          for(var ll=0; ll<changes.length;ll++){
            indices.push(ll);
          }
          indices = shuffle(indices);

          var c;
          var mm = 0;

          var raf = function(step){
            for(var rateind = 0; rateind< rate; rateind++){
              if(mm < indices.length){
                c = indices[mm];
                drawSquare(changes[c][0],changes[c][1]);
                t.s[changes[c][0]][changes[c][1]] = 1;
                mm++;

              }
            }
            if (mm < indices.length){
              requestAnimationFrame(raf);
            } else {
              t.update();
            }
          }

          requestAnimationFrame(raf);

        } else {
          if (loop){
          t.initialize();
          t.update();
          }
        }

      };

      var drawSquare = function(ii,jj){
        ctx.clearRect(ii*(square+gap),jj*(square+gap),square,square);
      };

      this.render = function(){

        t.arrayloop(function(ii,jj){
          if(t.s[ii][jj] === 1) drawSquare(ii,jj);
        });
      }



      this.initialize();


    };



function shuffle(array) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function getUrlVars()
{
  var vars = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for(var i = 0; i < hashes.length; i++)
  {
    hash = hashes[i].split('=');
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}



$(function(){

  var urlobj = getUrlVars();
  if(urlobj.density){
    density = urlobj.density;
  }
  if(urlobj.type){
    type = urlobj.type;
  }
  if(urlobj.rate){
    rate = urlobj.rate;
  }
  if(urlobj.loop){
    loop = urlobj.loop ==='true' ;
  }

  //Sort out the DOM so other things aren't borked
  var $bg = $('.bg');
  var w = $bg.width();
  var h = $bg.height();
  $bg.css({'background-image':'none'});
  $bg.children().css({'position':'relative'});
  var $canv_wrap = $('<div>').attr('id','canv_wrap').css({position:'absolute',float:'left'});
  var $canv = $('<canvas>').attr('id','canvas').attr('width',w).attr('height',h);
  $canv_wrap.append($canv);
  $bg.prepend($canv_wrap);

  p = new percolator(density,$canv,type,rate);
  p.update(loop);
});

});
