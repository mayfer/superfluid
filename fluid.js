define([], function () {
    return function(elem, audioSamples, options) {
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
            ctx.fillStyle = '#a00';

            for(var i=0; i<pm.circles.length; i++) {
                var circle = pm.circles[i];
                ctx.beginPath();
                ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI*2, false);
                ctx.fill();
            }
        };

        pm.animate = function(iter) {

            iter += 1;
            var iter_x = Math.sin(iter/200) * 100;
            var iter_y = Math.sin(iter/200) * 100;

            window.requestAnimationFrame(function() {

                var pos = {
                    x: iter_x,
                    y: iter_y,
                }
                pm.disrupt(pos, iter);
            
                pm.render();
                if(pm.animating == true) {
                    pm.animate(iter);
                }
            });
        };

        pm.circle = function(center, radius) {
            this.center = center;
            this.original_center = {
                x: center.x,
                y: center.y,
            };
            this.radius = radius;
        };

        pm.resize = function() {
            pm.cells = [];

            var size = 10;
            var mid = size / 2;

            pm.circles = [];

            canvasText = document.createElement("canvas");
            canvasText.width = ctx.width;
            canvasText.height = ctx.height;

            for(y = 0; y < ctx.height; y+=6) {
                for(x = 0; x < ctx.width; x+=6) {
                    if(x % 48 == 0 || y % 48 == 0) {
                        var circle = new pm.circle({
                            x: x,
                            y: y,
                        }, 3, 0, 2*Math.PI);
                        pm.circles.push(circle);
                    }
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
                    x: Math.sin(circle.original_center.x * iter/2000)*5,
                    y: Math.cos(circle.original_center.y * iter/2000)*5,
                }
                var distance = pm.distance(pos, compare);
                var push_x = Math.sin(distance)*3;
                var push_y = Math.cos(distance)*3;

                circle.center.y = circle.original_center.y + push_y;
                circle.center.x = circle.original_center.x + push_x;
            }
            pm.render();
            
        };

        pm.init = function() {

            pm.resize();
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
        };

        pm.init();
        return pm;
    };
});
