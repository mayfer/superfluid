define([], function () {
    return function(elem, options) {
        var pm = this;

        pm.canvas = Canvas(elem);
        pm.ctx = pm.canvas.getContext("2d");
        pm.iter = 0;

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

                var radius = circle.radius;
                var radians = (i+pm.iter/20) /20;
                var grad= ctx.createLinearGradient(circle.center.x-radius*Math.cos(radians), circle.center.y-radius*Math.sin(radians), circle.center.x+radius*Math.cos(radians), circle.center.y+radius*Math.sin(radians));
                grad.addColorStop(0, "#ffffff");
                grad.addColorStop(1, "#000000");
                ctx.fillStyle = grad;
                ctx.fill();

                //ctx.fillStyle = 'rgba(0, 250, 000, '+(0.5+opacity)+')';
            }
        };

        pm.animate = function(iter) {

            iter += 4;
            pm.iter = iter;

            window.requestAnimationFrame(function() {
            
                pm.render();
                if(pm.animating == true) {
                    pm.animate(iter);
                }
            });

            
        };

        pm.stop = function() {
            pm.animating = false;
        };


        pm.circle = function({center, radius, radians, layer}) {
            this.center = center;
            this.original_center = {
                x: center.x,
                y: center.y,
            };
            this.radius = radius;
            this.radians = radians;
            this.layer = layer;
        };

        pm.resize = function() {
            pm.cells = [];

            var size = 30;
            var mid = size / 2;

            pm.circles = [];

            pm.middle = {
                x: ctx.width/2,
                y: ctx.height/2,
            };
            var maxlen = Math.min(pm.middle.y, pm.middle.x); 
            
            var layer = 0;
            for(i = 0; i<maxlen+30; i+=30) {
                for(rad = 0; rad<Math.PI*2-0.01; rad+=Math.PI/6) {
                    var circle = new pm.circle({
                        center: {
                            x: pm.middle.x + i* Math.sin(rad+i+pm.iter/100),
                            y: pm.middle.y + i* Math.cos(rad+i+pm.iter/100),
                        }, 
                        radius: 10,
                        radians: rad,
                        layer: layer,
                    });
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

            $(document).on('click', '#wrapper', function(e){
                if(pm.animating) {
                    pm.stop();
                } else {
                    pm.animating = true;
                    pm.animate(pm.iter);
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
