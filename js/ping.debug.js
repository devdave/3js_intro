//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#Polyfill
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

  Array.prototype.forEach = function(callback, thisArg) {

    var T, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as the this value and
        // argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}


if (!Array.prototype.every) {
  Array.prototype.every = function(callbackfn, thisArg) {
    'use strict';
    var T, k;

    if (this == null) {
      throw new TypeError('this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the this
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method
    //    of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callbackfn) is false, throw a TypeError exception.
    if (typeof callbackfn !== 'function') {
      throw new TypeError();
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0.
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method
        //    of O with argument Pk.
        kValue = O[k];

        // ii. Let testResult be the result of calling the Call internal method
        //     of callbackfn with T as the this value and argument list
        //     containing kValue, k, and O.
        var testResult = callbackfn.call(T, kValue, k, O);

        // iii. If ToBoolean(testResult) is false, return false.
        if (!testResult) {
          return false;
        }
      }
      k++;
    }
    return true;
  };
}

if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}
/**
@fileoverview Main script file, set's up the ping namespace.
*/

/**
 *Global Application logic collection, should hold only instances
 *@namespace
 *@type Object
 */
var ping = { "Lib" : {}};


/**
 *Namespace utility
 *
 @deprecated Cool idea once, breaks JsDoc as you can't document namespaces with it
 *@param ns {String} An array or string of namespaces to create or verify exist
 *@param toApply {Function} Adds
 *@returns {Object} Last element in a NS
 */
ping.namespace = function(ns, toApply){
    var elements = ns.split(".");
    var root = window[elements[0]] = window[elements[0]] || {};

    for(var i = 1; i < elements.length; i++){
        root = root[elements[i]] = root[elements[i]] || {};
    }
    return root;
}

/**
 *With Namespace/object extension helper

 @deprecated maybe?  I was big into ExtJS when I was writing this.
 *Provides a namespace safe mechanism for extending a functions prototype or decorating an object
 */
ping.w = function(target, toApply){
    toApply.call(target.prototype);
}

/**
 *Application exception implementation
 *
 *@constructor
 *@param {string} Error message
 *@param {Object} A reference/copy of the local this variable for debugging purposes
 */
ping.Exception = function(message, scope){
    this.message = message;
    this.scope = scope;
}

ping.Exception.prototype.toString = function(){
    return  "ping.Exception( " + this.message + ", ... );"
}

/**
 *@static Global reference to the Canvas 2d context
 *@deprecated
 */
ping.CTX = null;
/**
@fileoverview Provides a fly-weight light caching for canvas objects as well
as overloading/monkey patching the default CanvasRenderingContext2d class
to provide some additional features.
*/
/**
 *Canvas additions library
 *
 *Adds some useful new methods and helpers to the canvas
 *Instance
 *@namespace
 *
 */
ping.Lib = ping.Lib || {};

/**
 *A canvas instance manager
 *
 *@classdesc It's pretty rare to create & destroy canvas's from the DOM
 *so it make sense to an extent to try and cache the reference
 *to the 2d Rendering context...thereby avoiding continual
 *DOM getElementBy Id calls.
 *
 *This is considered an internal library utility and shouldn't
 *be called directly
 *
 *@constructor
 */
ping.Lib.CnvMan = function(){
     /**
     *Holds references of known canvas elements
     *@member {object}
     **/
     this.refs = {};
}

/**
Internal setter to assign a element to the ref's property
@Private
@method */
ping.Lib.CnvMan.prototype._set = function(id, ref){
   this.refs[id] = ref;
}

/**
Returns a valid canvas element by it's id, if it exists.
@method
@param {string} id A valid canvas element id
@returns {CanvasRenderingContext2D}
*/
ping.Lib.CnvMan.prototype.get = function(id){
    if( typeof this.refs[id]  == "undefined"){
         this._set(id, ping.Lib.$C(id));
    }
    return this.refs[id];
}

/**
Add's a canvas element to the list of cached elements.
@method
@param {string} id A valid id for a canvas element.
@param {HTMLCanvasElement} reference
@returns {CanvasRenderingContext2D}
*/
ping.Lib.CnvMan.prototype.set = function(id, reference){
    if( typeof this.refs[id] == "undefined"){
         this._set(id, reference);
    }
    return this.refs[id];
}
/**
@method
@param {string} id A valid id for a canvas element.
@returns {Boolean}
*/
ping.Lib.CnvMan.prototype.exists = function(id){
   return typeof this.refs[id] != "undefined";
}


/**
Keeps a record of every extended canvas made
@memberof ping
@type {ping.Lib.CnvMan}
@instance
 */
ping.cMngr = new ping.Lib.CnvMan();


/**
 *Utility to instantiate/retrieve the 2d Rendering context of canvas tags
 *
 *This is also a future safe measure in case the 2d Rendering context should ever change,
 *all of the add on methods can be bound at run time instead of compile time.
@function
@param {string} elemId A valid canvas html id
@returns {CanvasRenderingContext2D}
 */
ping.$C = function(elemId){
   if(ping.cMngr.exists(elemId)){
       return ping.cMngr.get(elemId);
   }
   var element = document.getElementById(elemId);
   var ref = element.getContext("2d");
   return ping.cMngr.set(elemId, ref);
}

if (typeof CanvasRenderingContext2D != "undefined") {


/**
@class CanvasRenderingContext2D
*/

/**
 *@deprecated
 *Initially was meant to be a utility to ensure
 *drawing sections of code were always wrapped with a begin..end path calls
 *
 *Unfortunately this turned out to be an amazing nightmare performance
 *killing swamp.  Closures and very high performance DO NOT mix!
@method
 */
CanvasRenderingContext2D.prototype.render = function(block){
                        this.beginPath();
                        //@TODO add try/catch here?
                        block.call(this);
                        this.closePath();
                        return this;
}





/**
 *Given a Radi & angle value, return points on a circle
 *
 *This is heavily used by the PingGame itself so should be considered stable
 *
 *@param {inter} Radius is the radius of the circle
 *@param {float} angle should be a sane degree value from 0-360
 *@param {float} x the x coordinate for the circle origin
 *@param {float} y the y coordinate for the circle origin
 *
 */
CanvasRenderingContext2D.prototype.rayGen = function(Radius, angle, x, y){
                       var radian = angle * Math.PI/180;
                        var lx = Radius * (Math.cos(radian)) + x;
                        var ly = Radius * (Math.sin(radian)) + y;
                        return [lx, ly];
                };

/**
 *Draws an elliptical circle on the canvas.
 *Ratio reflects on warped the circle gets
 *
 *@see Solar
 @todo Damn if I remember how this works
 *
 */
CanvasRenderingContext2D.prototype.elipGen = function(Radius, angle, originX, originY, ratio ){
                        ratio = /*ratio ||*/ 1.8;
                        var radian = angle * Math.PI/180;
                        var lx = (Radius * (Math.cos(radian)* ratio) + originX) ;
                        var ly = Radius * (Math.sin(radian) * .5) + originY;
                        return [lx, ly];
};

/**
 *A utility to take ping Point classes and render out a line.
 *
 *Currently not used anywhere
 @method
 @param {Object} p1 The starting point if a line
 @param {Object} p2 The end point of a line
 */
CanvasRenderingContext2D.prototype.line = function(p1, p2){
                    this.moveTo(p2.x, p2.y);
                    this.lineTo(p1.x, p1.y);
                };

/**

@deprecated Duplicate of line and adds 1 more call to stack
@see CanvasRenderingContext2D#line
@function
 */
CanvasRenderingContext2D.prototype.drawLine = CanvasRenderingContext2D.prototype.line

/**
Utility to draw a circle
@function
@param {float} x Origin x
@param {float} y Origin y
@param {float} radius
@deprecated Waste of cycles
*/
CanvasRenderingContext2D.prototype.circle = function(x, y, radius) {
                        return this.arc(x, y, radius, 0, Math.PI* 2, true);
                        };

/**
Utility to draw a circle with begin & close path (equiv to stroke)
@function
@param {float} x Origin x
@param {float} y Origin y
@param {float} radius
@deprecated Waste of cycles
*/
CanvasRenderingContext2D.prototype.drawCircle = function(x, y, radius){
                        this.beginPath();
                        this.circle(x,y,radius);
                        this.closePath();
}
/**
Draw a pixel at the specific point that is 1x1 in size
@function
@param {object} point {x:#,y:#} object
@param {string} color a valid HTML color code
*/
CanvasRenderingContext2D.prototype.pixel    = function(point, color){
                        this.save();
                        this.moveTo(point[0],point[1]);
                        this.fillStyle = color;
                        this.fillRect(point[0],point[1],1,1);
                        this.restore();
}

/**
Draw a pixel at the specific point that is 1x1 in size
@function
@param {object} point {x:#,y:#} object
@param {string} color a valid HTML color code
@deprecated Waste of a stack call for conveniance
*/
CanvasRenderingContext2D.prototype.putPixel = function(x,y, color){
                        if(arguments.length == 1){
                          var point = x;
                        }else{
                          var point = [x,y];
                        }
                        color = color || "white";
                        this.pixel(point, color)
    }

/**
Flood the entire canvas with the specified color

This is an alternative to using clearRect
@function
@param {string} color a valid HTML color code
*/
CanvasRenderingContext2D.prototype.floodFill = function(color){
                        this.save();
                        this.fillStyle  = color;
                        this.fillRect(0,0, this.canvas.clientWidth, this.canvas.clientHeight);
                        this.restore();
                        }

/**
Shortcut to clear the entire canvas
@function
*/
CanvasRenderingContext2D.prototype.clearAll = function(color){
                        this.clearRect(0,0,this.canvas.width, this.canvas.height );
                        }

/**
Shortcut to get the canvas height
@function
@deprecated
*/
CanvasRenderingContext2D.prototype.maxHeight = function(){
     return this.canvas.clientHeight;
}

/**
Shortcut to get the canvas width
@function
@deprecated
*/
CanvasRenderingContext2D.prototype.maxWidth = function(){
     return this.canvas.clientWidth;
}


//To allow for documentation detection
/**
Reference to the
@see {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D|Mozilla Canvas docs} for further information
*/
ping.Lib.CanvasRenderingContext2D = CanvasRenderingContext2D;
};


//ping.namespace("ping.Lib")
ping.Lib = ping.Lib || {};
//ping.namespace("ping.Lib.intersects")
/**
@namespace
*/
ping.Lib.intersects = ping.Lib.intersects || {};
ping.i = ping.Lib.intersects;

/**
Terrible name but it's self-documenting atleast
*/
ping.Lib.intersects.BoxesNoOverlap = function(a, b) {

    return (
    ping.Lib.intersects.bIsInsideA(a, b)
    ||
    ping.Lib.intersects.bIsInsideA(b, a)
    );
}

/**
Is b inside of a?

@param {Object} a Outer box to test
@param {number} a.x
@param {number} a.y
@param {number} a.sx
@param {number} a.sy

@param {Object} b Outer box to test
@param {number} b.x
@param {number} b.y
@param {number} b.sx
@param {number} b.sy
*/


ping.Lib.intersects.bIsInsideA = function(a,b){
    return (
            b.x >= a.x && b.y >= a.y
            && (b.x + b.sx) <= (a.x + a.sx)
            && (b.y + b.sy) <= (a.y + a.sy)
           );
}


/**
  This isn't labeled right, I want to know if any given point
  on box b's corners is inside A

  //Sourced from
  http://gamedev.stackexchange.com/questions/586/what-is-the-fastest-way-to-work-out-2d-bounding-box-intersection
  @TODO test!
*/
ping.Lib.intersects.boxContainsBox = function(a, b) {
    return (Math.abs(a.x - b.x) * 2 < (a.sx + b.sx)) &&
            (Math.abs(a.y - b.y) * 2 < (a.sy + b.sy));
}

ping.Lib.intersects.boxContainsBox2 = function(a, b) {
    return (Math.abs(a.x - b.x) * 2 <= (a.sx + b.sx)) &&
            (Math.abs(a.y - b.y) * 2 <= (a.sy + b.sy));
}

/**

@param {object} a should be {x:#,y:#,sx:#,sy#} where s vars are short for (s)ize
@param {object} b should be {x:#,y:#,sx:#,sy#} where s vars are short for (s)ize
@returns {Boolean}
@function
@deprecated
*/
ping.Lib.intersects.box = function(a,b){
    return!( (b.x > (a.x+a.sx)) ||
             ((b.x + b.sx) < a.x) ||
             (b.y > (a.y + a.sy) ||
             (b.y + b.sy) < a.y)
    );
}

ping.Lib.intersects.pointInsideBox = function(p, box){
    return (p.x >= box.x && p.x <= box.x + box.sx) &&
           (p.y >= box.y && p.y <= box.y + box.sy);
}
//ping.Lib.intersects.box = function(a,b){
//                return ping.Lib.intersects.boxContainsBox(a,b);
//                //b = 1 - 4
//               //a = A
//               //AUa upper left corner
//               if(a.x >= b.x && a.x <= b.x + b.sx && a.y >= b.y && a.y <= b.y + b.sy) return true;
//               //AUb upper right corner
//               if(a.x + a.sx >= b.x && a.x + a.sx <= b.x + b.sx  && a.y >= b.y && a.y <= b.y + b.sy ) return true;
//               //AUc lower right corner
//               if(a.x + a.sx >= b.x && a.x + a.sx <= b.x + b.sx && a.y + a.sy >= b.y && a.y + a.sy <= b.y + b.sy) return true;
//               //AUd lower left corner
//               if(a.x >= b.x && a.x <= b.x + b.sx && a.y + a.sy >= b.y && a.y + a.sy <= b.y + b.sy) return true;
//
//               if(b.x >= a.x && b.x <= a.x + a.sx && b.y >= a.y && b.y <= a.y + a.sy) return true;
//               //AUb upper right corner
//               if(b.x + b.sx >= a.x && b.x + b.sx <= a.x + a.sx  && b.y >= a.y && b.y <= a.y + a.sy ) return true;
//               //AUc lower right corner
//               if(b.x + b.sx >= a.x && b.x + b.sx <= a.x + a.sx && b.y + b.sy >= a.y && b.y + b.sy <= a.y + a.sy) return true;
//               //AUd lower left corner
//               if(b.x >= a.x && b.x <= a.x + a.sx && b.y + b.sy >= a.y && b.y + b.sy <= a.y + a.sy) return true;
//
//               return false;
//
//            }

/**
@todo Come back to these
*/
//ping.Lib.Point.prototype.dist = function(o){
//    var tX = Math.pow(this.x - o.x, 2);
//    var tY = Math.pow(this.y - o.y, 2);
//    return Math.sqrt((tX) + (tY))
//}
//
//ping.Lib.Point.prototype.slope = function(o){
//    (this.y - o.y) / (this.x - o.x);
//}
//
//
//
//ping.Lib.Line.prototype.COINCIDENT   = 0x1 << 1;
//ping.Lib.Line.prototype.PARALLEL     = 0x1 << 2;
//ping.Lib.Line.prototype.NO_INTERSECT = 0x1 << 3;
//ping.Lib.Line.prototype.INTERSECT    = 0x1 << 4;
//
//ping.Lib.Line.prototype.slope = function(firstForm){
//
//    return this.begin.slope(this.end);
//}
//
//ping.Lib.Line.prototype.dist = function(){
//    return this.begin.dist(this.end);
//}
//
//
//ping.Lib.Line.prototype.intersect = function (a,b) {
//
//    //TODO - recyle slopes to cut down expressions
//    var denom =   ((o.end.y - o.begin.y) * (this.end.x - this.begin.x)) - ((o.end.x - o.begin.x) * (this.end.y - this.begin.y));
//    var nume_a =  ((o.end.x - o.begin.x) * (this.begin.y - o.begin.y)) - ((o.end.y  - o.begin.y) * (this.begin.x - o.begin.x));
//    var nume_b =  ((this.end.x - this.begin.x) * (this.begin.y - o.begin.y)) - ((this.end.y - this.begin.y) * (this.begin.x - o.begin.x));
//
//    if (denom == 0) {
//        if (nume_a == 0 && nume_b == 0) {
//            return [this.COINCIDENT];
//        } else {
//            return [this.PARALLEL];
//        }
//
//    }
//    var ua = nume_a / denom;
//    var ub = nume_b / denom;
//
//    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
//        var x = this.begin.x + ua * (this.end.x - this.begin.x);
//        var y = this.begin.y + ua * (this.end.y - this.begin.y);
//        return [this.INTERSECT, x, y];
//    }
//
//    return [this.NO_INTERSECT];
//
//};
/**
@namespace
*/
/**
@function
@deprecated
*/
ping.Lib.MainLoop = function(){
                var self = this;
                var tickTime = 10; //How many times to rerun through the game loop in MS

                // Constant function queue
                self.constantList = [];

                //List of functions to be run per tick as needed
                self.runQueue = [];
                /**
                 *The logic loop's interval ID
                 */
                var runnerHandle = null;
                self.logicLoop = function(){
                    $.each(self.constantList, function(index, handler){
                        try{
                            handler();
                        }catch(err){
                            console.debug(err);
                            self.stop();
                        }
                    });

                    if(self.runQueue.length > 0){
                        var func = runQueue.shift();
                        func();
                    }
                }

                self.start = function(){
                    runnerHandle = setInterval(self.logicLoop, tickTime);
                }
                self.stop = function(){
                    clearInterval(runnerHandle);
                }
            };

/**
@namespace
*/
ping.Lib = ping.Lib || {};
ping.Shapes = ping.Shapes || {};
//ping.namespace("ping.Lib");




/**
  Return the distance between two points
*/
ping.Lib.pointDistance = function(x1,y1,x2,y2){
        var tX = Math.pow(x1 - x2, 2);
        var tY = Math.pow(y1 - y2, 2);
        return Math.sqrt((tX) + (tY));
}

/**
A point object
@class
*/
ping.Lib.Point = function (x, y) {
        this.x = x;
        this.y = y;
    };



/**
Distance between two points
@function
*/
ping.Lib.Point.prototype.dist = function (o) {
    return ping.Lib.pointDistance(this.x,o.x,this.y,o.y);
};


/**
 *Bad design choice
 *@deprecated */
ping.Lib.Point.prototype.slope = function (o) {
    return (this.y - o.y) / (this.x - o.x);
};



/**
A line class
@class
*/
ping.Lib.Line = function (begin, end) {
        this.begin = begin;
        this.end = end;
    };

//ping.Lib.Line.prototype =
ping.Lib.Line.prototype.COINCIDENT   = 0x1 << 1;
ping.Lib.Line.prototype.PARALLEL     = 0x1 << 2;
ping.Lib.Line.prototype.NO_INTERSECT = 0x1 << 3;
ping.Lib.Line.prototype.INTERSECT    = 0x1 << 4;

/**
@function
*/
ping.Lib.Line.prototype.slope = function (firstForm) {
    return this.begin.slope(this.end);
};

/**
Length of a line
@function
*/
ping.Lib.Line.prototype.dist = function () {
    return this.begin.dist(this.end);
};

/**
Given two lines, do they intersect?
@function
*/
ping.Lib.Line.prototype.intersect = function (o) {

        //TODO - recyle slopes to cut down expressions
        var denom =   ((o.end.y - o.begin.y) * (this.end.x - this.begin.x)) - ((o.end.x - o.begin.x) * (this.end.y - this.begin.y));
        var nume_a =  ((o.end.x - o.begin.x) * (this.begin.y - o.begin.y)) - ((o.end.y  - o.begin.y) * (this.begin.x - o.begin.x));
        var nume_b =  ((this.end.x - this.begin.x) * (this.begin.y - o.begin.y)) - ((this.end.y - this.begin.y) * (this.begin.x - o.begin.x));

        if (denom == 0) {
            if (nume_a == 0 && nume_b == 0) {
                return [this.COINCIDENT];
            } else {
                return [this.PARALLEL];
            }

        }
        var ua = nume_a / denom;
        var ub = nume_b / denom;

        if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
            var x = this.begin.x + ua * (this.end.x - this.begin.x);
            var y = this.begin.y + ua * (this.end.y - this.begin.y);
            return [this.INTERSECT, x, y];
        }

        return [this.NO_INTERSECT];

};

/**
@namespace
*/
ping.Lib = ping.Lib || {};
//ping.namespace("ping.lib.box");

//ping.lib.box.Intersect =

/**
@function
*/
ping.Lib.boxfactory = function (){
        var oP, size;
        switch(arguments.length){
                case 3:
                        oP = new ping.Lib.Point(arguments[0], arguments[1]);
                        size = arguments[2]
                        break;
                case 2:
                       oP = arguments[0];
                        size = arguments[1];
                        break;
                default:
                        throw new ping.Exception("ping.Lib.boxFactory expects (point, size) or (x, y, size) only");

        }

        var p1 = new ping.Lib.Point(oP.x, oP.y);
        var p2 = new ping.Lib.Point(oP.x + size, oP.y);
        var p3 = new ping.Lib.Point(oP.x + size, oP.y + size);
        var p4 = new ping.Lib.Point(oP.x, oP.y + size );

        var l1  = new ping.Lib.Line(p1, p2)
        var l2 = new ping.Lib.Line( l1.end, p3 );
        var l3 = new ping.Lib.Line( l2.end, p4);
        var l4 = new ping.Lib.Line( l3.end, l1.begin );
        return [l1,l2,l3,l4];
}

/**
@namespace
*/
ping.Lib = ping.Lib || {};

/**
Likely keep this around as I can't remember how it works.
As for what it does, it provided a way to track
the arrow keys to see if they were pressed or unpressed (up or down);

@deprecated
@lends
*/
ping.Lib.initInput = function(){
    /**
    @function
    */
    ping.Lib.Input = new function(){
        var self = this;
        var map    = { 38: "U", 40: "D", 37: "L", 39: "R" };
        self.state = { U: false, D: false, L: false, R: false };
        self.keydown = function(evnt){
            var mKey = map[evnt.which];
            if(mKey != "undefined"){
                self.state[mKey] = true;
            }
        }

        self.keyup = function(evnt){
            var mKey = map[evnt.which];
            if(mKey){
                self.state[mKey] = false;
            }
        }

        $(document).keydown(self.keydown);
        $(document).keyup(self.keyup);
    }
}
/**
@file One of two impelementations of the Quadtree class.  TODO is consolidate
them both.
*/
/**
@namespace
*/
ping.q = {}

ping.q.Quadtree = (function(){
    "use strict";

    /**
    @typedef {Object} MaxTree Tree limit behavior limits
    @property {integer} level Maximum nodes per quadrant
    @property {integer} objects How many objects before splitting a node
    @property {|integer} nodes How many nodes ARE their in the tree
    */



    /**
    @public
    @constructs

    @param {BoundingBox} bounds Boundary of this tree
    @param {MaxTree} max Defines tree limits/behavior
    @param {Integer} level Current depth or 0
    @param {String} name For debugging, backtracking

	*/
	function Quadtree( bounds, max, level, name, objects ) {

        //Bounds
        this.bounds = bounds;

        //Limits
        this.max = max || {objects:5,levels:6,nodes:0};
        if (this.max['nodes'] == undefined) {
            this.max.nodes = 0;
        }
        this.max['nodes'] += 1;

        this.level = level || 0;

        this.name = name || 'root';


		this.objects = objects || [];
		this.nodes 	 = [];

        //helper data
        this.middle = {
            vert: this.bounds.x + (this.bounds.width / 2),
            horz: this.bounds.y + (this.bounds.width / 2)
        };
	};


	/*
	 * Split the node into 4 subnodes
	 */
	Quadtree.prototype.split = function() {

		var max = this.max,
            B = this.bounds,
            new_level = this.level + 1,
			width	= Math.round( B.width / 2 ),
			height 	= Math.round( B.height / 2 ),
			x 		= Math.round( B.x ),
			y 		= Math.round( B.y ),
            new_name = this.name + "->";

        function nb(x,y, append){
            return new Quadtree(
                {
                    "x":x,
                    "y":y,
                    "width":width,
                    "height":height
                },
                max,
                new_level, new_name + append);
        }

        this.nodes = [
            nb(x,         y,           "UL"),
            nb(x + width, y,           "UR"),
            nb(x+width,   y + height,  "LR"),
            nb(x,         y + height,   "LL")
        ]
	};


	/*
	 Determine which node the box belongs to
	 @param {Object} box
     @param {Number} box.x
     @param {Number} box.y
     @param {Number} box.width
     @param {Number} box.height
	 */
	Quadtree.prototype.getIndex = function( box ) {

		var index = -1,
            //box is in L* nodes
            isTop = (box.y < this.middle.horz && box.y + box.height < this.middle.horz ),
			isBottom = (box.y > this.middle.horz);

        //Box is on left side
        if (box.x < this.middle.vert && box.x + box.width < this.middle.vert) {
            if (isTop) {
                index = 0;//this.UL;
            } else if(isBottom) {
                index = 3;//this.LL;
            }
        } else
        //Box is on the RIGHT
        if (box.x > this.middle.vert) {
            if (isTop) {
                index = 1;//this.UR;
            } else
            if (isBottom) {
                index = 2;//this.LR;
            }
        }

		return index;
	};


	/**
     @public

    Inserts a new BoundingBox like object into the tree

	 @param {BoundingBox} box
	 */
	Quadtree.prototype.insert = function( box ) {

		var index = -1;

        if (this.nodes.length > 0) {
            index = this.getIndex(box);
            if (index !== -1) {
                this.nodes[index].insert(box);
                //Asume this point in tree has already been split
                return;
            }
        }

        //Didn't fit, keep it at this level
	 	this.objects.push( box );

        /** @TODO After a split, there are going to be things
        that just don't fit below the current node
        Seems excess to perpetually try to push them
        down if its not going to happen? */

        if ((this.objects.length > this.max.objects)
            && (this.level < this.max.levels)
           )
        {
            if (this.nodes.length == 0) {
                this.split();
            }

			//Push objects that can fit down
            var index, remainder = [], obj;

            for(var i = 0; i < this.objects.length; i++){
                obj = this.objects[i];
                index = this.getIndex(obj);
                if (index > -1) {
                    this.nodes[index].insert(obj);
                } else {
                    remainder.push(obj);
                }
            }

            this.objects = remainder;

		}
	 };

     Quadtree.prototype.__overlaps = function(box, target) {
        //http://tekpool.wordpress.com/2006/10/11/rectangle-intersection-determine-if-two-given-rectangles-intersect-each-other-or-not/
        return !(box.x >= target.bounds.x + target.bounds.width
                || box.x + box.width <= target.bounds.x
                || box.y >= target.bounds.y + target.bounds.height
                || box.y + box.height <= target.bounds.y);
     }


	/**
    @public

    @param {BoundingBox} box
    @returns {Array} Any/all objects found

	*/
	Quadtree.prototype.collides = function(box, depth) {
        "use strict";

        if (depth == undefined) {
            depth = 1;
            var is_sane = [box.height >= 0,
                    box.width >= 0,
                    box.x >= 0,
                    box.y >= 0];
            if (is_sane.indexOf(false) != -1) {
                throw new Error("Panic, bounding box is insane " + is_sane);
            }

        }

		var index = this.getIndex( box ),
            returnObjects = this.objects;


		//if we have subnodes ...
        if (this.nodes.length > 0) {

			//if box fits into a subnode ..
			if( index !== -1 ) {
				returnObjects = returnObjects.concat( this.nodes[index].collides( box, depth + 1 ) );

            }

            //else see what collides with it.
			else {
                for(var i = 0; i < this.nodes.length; i++){
                    if (this.__overlaps(box, this.nodes[i])) {
                        returnObjects = returnObjects.concat(
                            this.nodes[i].collides(box)
                        );
                    }
                }
			}
		}

		return returnObjects;
	};


	/**
	 @public

     Wipes out the tree
	 */
	Quadtree.prototype.clear = function() {

		this.objects = [];
        function visit(node, pos) {
            if (node) node.clear();
            delete this.nodes[pos];
        };

        this.nodes.slice(0).forEach(visit);
        this.max.count = 0;
	};

    return Quadtree



})();


ping.q.Factory = function(width, height, max) {

    //How many times can we split the height or width in
    //half before it get's absurd?
    //var max_depth =
    //        Math.min(
    //            Math.floor(Math.log(width)/Math.log(2)),
    //            Math.floor(Math.log(height)/Math.log(2))
    //        );
        bounds = {x:0, y:0, width:width, height:height};
        max = null;

    return new ping.q.Quadtree(bounds);
}

ping.Math = ping.Math || {};
ping.m = ping.Math;

;(function(module){



    module.c2i = function(x,y, sw, sh) {
                        return (x * sw) + y;
                    }

    module.i2c = function(i, sw, sh) {
                        var x = Math.floor(i/sw),
                            y = i - (x*sh);
                        return [x, y];
                    }

    module.clamp = function(z, min, max) {
                        if (z < min) {
                            return min;
                        } else if (z > max){
                            return max;
                        }
                        return z;
                    }

    module.clock = function(start, pos, end) {
        if (pos >= end) {
            return start;
        } else if (pos <= start) {
            return start
        }
        return pos;
    }

})(ping.m);

ping.maze = ping.maze || {};

/**
@TODO move this to a ping.Array utility?
*/
function remove(list, value) {
    "use strict";
    if (!list instanceof Array) {
        debugger;
        console.log("How did we get here?");
    }
    var newList = [];
    for (var i = 0; i < list.length; i++) {
        if (list[i] != value) {
            newList.push(list[i]);
        }
    }
    return newList;
}

ping.maze._randVal = function(list){
    "use strict";
    var lcount = list.length;
    return list[Math.floor(lcount * Math.random())];
}

ping.maze._randCell = function(currentCell){
    "use strict";
    var neighbors = currentCell.findNeighbors(true),
        safeList = neighbors.list.slice(0),
        dir;

    while(safeList.length) {
        dir = ping.maze._randVal(safeList);
        if (ping.maze._isVirgin(neighbors[dir])) {
            return [neighbors[dir], dir];
        }
        safeList = remove(safeList,dir);
    }
    return false;
}

ping.maze._isVirgin = function(cell){
    "use strict";
    //There are no open sides/walls = 0;
    return cell.walls.indexOf(0) == -1;
}

ping.maze.GenerateMaze = function (grid) {
    "use strict";
    //create a CellStack (LIFO) to hold a list of cell locations
    var cellStack = [],
    //set TotalCells = number of cells in grid
        totalCells = grid.elements.length,
    //choose a cell at random and call it CurrentCell
        randIndex = Math.floor(Math.random() * totalCells),
        currentCell = grid.elements[randIndex],
    //set VisitedCells = 1
        visitedCells = 1,
        newCell, newDir,
        debugIds = [currentCell.index],
        result;

    //while VisitedCells < TotalCells
    while(visitedCells < totalCells){
        //find all neighbors of CurrentCell with all walls intact
        //choose one at random
        result = ping.maze._randCell(currentCell);

        //if one or more found
        if (result) {
            newCell = result[0];
            newDir  = result[1];
            //knock down the wall between it and CurrentCell
            currentCell.walls[newDir] = 0;
            switch(newDir){
                case GameTile.NORTH: newCell.walls[GameTile.SOUTH] = 0; break;
                case GameTile.SOUTH: newCell.walls[GameTile.NORTH] = 0; break;
                case GameTile.EAST: newCell.walls[GameTile.WEST] = 0; break;
                case GameTile.WEST: newCell.walls[GameTile.EAST] = 0; break;

                default:
                    debugger;
                    console.log("How did we get here?");
            }
            //push CurrentCell location on the CellStack
            cellStack.push(currentCell);
            //make the new cell CurrentCell
            currentCell = newCell;
            //add 1 to VisitedCells
            visitedCells += 1;
            if (debugIds.indexOf(currentCell.index) > -1) {
                debugIds.sort();
                debugger;
                //how did we get here?
            }
            debugIds.push(currentCell.index);

        } else {
            //pop the most recent cell entry off the CellStack
            //make it CurrentCell
            var temp = cellStack.pop();
            if (temp == undefined) {
                debugger; //how did we get here?
            }
            currentCell = temp;
        }


    }







}
/**
 Detect if we're running node

 Grand scheme of things, there IS NO reliable WAY to know.

 CommonJS could be present and if the case...well poop.
*/
if (typeof window === 'undefined') {
    if (typeof exports != "undefined") {
        exports['ping'] = ping;
    }
}
