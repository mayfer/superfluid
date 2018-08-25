define([], function () {

    return function(elem, options) {
        var pm = this;

        pm.canvas = Canvas(elem);
        pm.ctx = pm.canvas.getContext("2d");

        var ctx = pm.ctx; // shortcut

        if(options === undefined) { options = {}; }
        pm.options = extend({
            resizeWithWindow: true,
        }, options);

        pm.hover = function(percent) {
        };

        pm.reset = function() {
            ctx.clearRect(0, 0, ctx.width, ctx.height);
        };
        
        pm.render = function() {
            pm.reset();

            for(var i=0; i<pm.squares.length; i++) {
                var square = pm.squares[i];
                ctx.save();

                ctx.translate(pm.middle.x, pm.middle.y);
                ctx.rotate(square.phase);

                ctx.fillStyle = square.color;
                ctx.beginPath();
                ctx.rect(square.x, square.y, square.width, square.height);

                ctx.fill();
                ctx.restore();
                
            }
        };

        pm.animate = function(iter) {

            iter += 1;

            window.requestAnimationFrame(function() {

                pm.disrupt(iter);
            
                pm.render();
                if(pm.animating == true) {
                    pm.animate(iter);
                }
            });
        };

        pm.stop = function() {
            pm.animating = false;
        };

        pm.square = function(options) {
            for(var key in options) this[key] = options[key];
            this.original_center = {
                x: options.x,
                y: options.y,
            };
        };

        pm.resize = function() {
            pm.cells = [];

            var size = 10;
            var mid = size / 2;

            pm.squares = [];

            canvasText = document.createElement("canvas");
            canvasText.width = ctx.width;
            canvasText.height = ctx.height;

            function getRandomColor() {
              var letters = '0123456789ABCDEF';
              var color = '#';
              for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
              }
              return color;
            }

            var num_squares = parseInt(ctx.height / 50);
            for(i = num_squares+1; i>1; i-=1) {
                var skip = 50;
                var height = i * skip - ((i%2==0)?20:0);
                var width = i * skip - ((i%2==0)?20:0);
                var square = new pm.square({
                    x:  - width/2,
                    y:  - height/2,
                    width: width,
                    height: height,
                    color: i % 2 == 0 ? "#000" : "#fff",
                    id: num_squares-i+1,
                    phase: 0,
                })
                pm.squares.push(square);
            }

        };

        pm.distance = function(pos1, pos2) {
            var diff = {
                x: (pos1.x - pos2.x),
                y: (pos1.y - pos2.y),
            }

            return Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
        }


        pm.disrupt = function(iter) {
            for(var i=0; i<pm.squares.length; i++) {
                var square = pm.squares[i];
                square.phase = Math.pow(Math.cos(iter/200), 2) * (-Math.PI/8 + Math.PI * Math.sin(square.id * iter/600) - 0.5);
            }
            pm.render();
            
        };

        pm.init = function() {

            pm.reset();

            var getCoordinates = function(that, e) {
                if(e && e.changedTouches && e.changedTouches[0]) {
                    e = e.changedTouches[0];
                }

                var rect = that.getBoundingClientRect()
                var parentOffset = {
                    top: rect.top + document.body.scrollTop,
                    left: rect.left + document.body.scrollLeft
                }

                var x = e.pageX - parentOffset.left;
                var y = e.pageY - parentOffset.top;

                return {x: x, y: y};
            }

            var clickOrTap = function(e) {
                var pos = getCoordinates(this, e);
            };

            var hoverOrTouchMove = function(e) {
                var pos = getCoordinates(this, e);
                //pm.disrupt(pos);
                //pm.animating = false;
            };

            var mouseout = function(e){
            };

            elem.addEventListener('click', clickOrTap);
            elem.addEventListener('touchstart', hoverOrTouchMove);
            elem.addEventListener('mousemove', hoverOrTouchMove);
            elem.addEventListener('mouseout', mouseout);
            elem.addEventListener('touchend', mouseout);

            if(pm.options.resizeWithWindow === true) {
                var resizeHandler;
                window.addEventListener('resize', function(e){
                    clearTimeout(resizeHandler);
                    resizeHandler = setTimeout(function() {
                        setCanvasSize(pm.canvas, elem.offsetWidth, pm.canvas.offsetHeight);
                        pm.resize();
                    }, 300);
                });
            }

            pm.iter = 0;
            pm.animating = true;
            pm.animate(pm.iter);
            
            pm.middle = {
                x: ctx.width/2,
                y: ctx.height/2,
            };

            pm.resize();
        };

        pm.init();
        return pm;
    };
});
