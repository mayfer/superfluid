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
                if(circle.type == 'outside') ctx.fillStyle = '#000';
                else ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, 2 * Math.PI, false);
                ctx.fill();
            }
        };

        pm.animate = function(iter) {

            iter += 1;
            var iter_y = ctx.height/2 + Math.sin(iter/4000) * 300;
            var iter_x = ctx.width/2 + Math.sin(iter/4000) * 300;

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


        pm.stop = function() {
            pm.animating = false;
        };
        

        pm.circle = function(options) {
            this.center = {x: options.x, y: options.y};
            this.original_center = {
                x: options.x,
                y: options.y,
            };
            this.radius = options.radius;
            this.type = options.type;
        };

        pm.resize = function() {
            pm.cells = [];

            var size = 10;
            var mid = size / 2;

            pm.circles = [];

            canvasText = document.createElement("canvas");
            canvasText.width = ctx.width;
            canvasText.height = ctx.height;

            contextText = canvasText.getContext("2d");
            contextText.font = "300px Helvetica";
            contextText.fillStyle = "rgb(255, 0, 0)";
            contextText.textAlign = "center";

            var offset_x = 2;
            contextText.fillText("teaorbit", ctx.width/2, ctx.height/2);
            imageText = contextText.getImageData(0, 0, ctx.width, ctx.height);
            dataText = imageText.data;

            let skip = 14;
            for(y = 0; y < ctx.height; y+=skip) {
                for(x = 0; x < ctx.width; x+=skip) {
                    if (true){//dataText[(x + y * ctx.width) * 4] > 0) {
                        var circle = new pm.circle({
                            type: 'inside',
                            x: x,
                            y: y,
                            radius: 2.4,
                        });
                        pm.circles.push(circle);
                    } else {
                    
                        var circle = new pm.circle({
                            type: 'outside',
                            x: x,
                            y: y,
                            radius: 1.4,
                        });
                        pm.circles.push(circle);
                    }
                }
            }

        };

        pm.distance = function(pos1, pos2, iter) {
            var diff = {
                x: (pos1.x - pos2.x),
                y: (pos1.y - pos2.y),
            }

            return Math.sin(diff.y) * Math.cos(diff.x) + Math.sin(diff.x*iter/300) + Math.sin(diff.y*iter/300);
        }

        pm.disrupt = function(pos, iter) {
            for(var i=0; i<pm.circles.length; i++) {
                var circle = pm.circles[i];
                
                var distance = pm.distance(pos, circle.original_center, iter);
                var push_x = 1 + Math.sin(distance);
                var push_y = 1 + Math.cos(distance);

                circle.radius = Math.sin(distance)+1 + (circle.type == 'inside' ? 1 : 0);
                //circle.center.x = circle.original_center.x + push_x;
                //circle.center.y = circle.original_center.y + push_y;
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
