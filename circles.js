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

            for(var i=0; i<pm.circles.length; i++) {
                var circle = pm.circles[i];
                ctx.beginPath();
                var distance = pm.distance({x: circle.center.x, y: circle.original_center.y}, circle.original_center);
                var opacity = distance/circle.radius;
                ctx.arc(circle.center.x, circle.center.y, (circle.radius), 0, Math.PI*2, false);
                ctx.fill();

                //ctx.fillStyle = 'rgba(0, 250, 000, '+(0.5+opacity)+')';
            }
        };

        pm.animate = function(iter) {

            iter += 3;
            var iter_x = Math.sin(iter/2007) * 100 + Math.cos(Math.PI/3 + iter/2000)*50;
            var iter_y = Math.sin(iter/4040) * 100 + Math.cos(iter/2100 + iter/6300) * 100;
            var iter_cycle = Math.cos(iter/2830)*50 + Math.sin(iter/2300) * 20 + Math.sin(iter/1000) * 100;

            window.requestAnimationFrame(function() {

                var pos = {
                    x: iter_x,
                    y: iter_y,
                }
                pm.disrupt(pos, iter_cycle);
            
                pm.render();
                if(pm.animating == true) {
                    pm.animate(iter);
                }
            });

            pm.iter = iter;
        };

        pm.stop = function() {
            pm.animating = false;
        };


        pm.circle = function(center, radius, layer) {
            this.center = center;
            this.original_center = {
                x: center.x,
                y: center.y,
            };
            this.radius = radius;
            this.layer = layer;
        };

        pm.resize = function() {
            pm.cells = [];

            var size = 10;
            var mid = size / 2;

            pm.circles = [];

            canvasText = document.createElement("canvas");
            canvasText.width = ctx.width;
            canvasText.height = ctx.height;

            pm.middle = {
                x: ctx.width/2,
                y: ctx.height/2,
            };
            var maxlen = Math.min(pm.middle.y, pm.middle.x); 
            
            for(i = 0; i<maxlen-30; i+=10) {
                for(rad = 0; rad<Math.PI*2-0.01; rad+=Math.PI/i*4) {
                    var circle = new pm.circle({
                        x: pm.middle.x + i* Math.sin(rad+i),
                        y: pm.middle.y + i* Math.cos(rad+i),
                    }, 4, i);
                    pm.circles.push(circle);
                }
            }

        };

        pm.distance = function(pos1, pos2) {
            var diff = {
                x: (pos1.x - pos2.x),
                y: (pos1.y - pos2.y),
            }

            return Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
        }


        pm.disrupt = function(pos, iter) {
            for(var i=0; i<pm.circles.length; i++) {
                var circle = pm.circles[i];
                
                var compare = {
                    x: Math.sin(circle.original_center.x * iter/10000 + i/1000)*5,
                    y: Math.sin(circle.original_center.y * iter/10000 + i/1000)*5,
                }
                var distance = pm.distance(pos, compare);
                var push_x = Math.sin(distance)*4;
                var push_y = Math.cos(distance)*4;

                circle.center.y = circle.original_center.y - push_y;
                circle.center.x = circle.original_center.x - push_x;
            }
            pm.render();
            
        };

        pm.init = function() {

            pm.resize();
            pm.reset();

            pm.ctx.fillStyle = '#000';

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

            document.addEventListener('keydown', function(e){
                if(e.keyCode == 32) {
                    if(pm.animating) {
                        pm.stop();
                    } else {
                        pm.animating = true;
                        pm.animate(pm.iter);
                    }
                }
            });

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
        };

        pm.init();
        return pm;
    };
});
