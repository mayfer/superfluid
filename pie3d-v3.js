define(['libs/three.min.js', 'wavelib.js'], function (THREE, wavelib) {


    // stats.js - http://github.com/mrdoob/stats.js
var Stats=function(){function h(a){c.appendChild(a.dom);return a}function k(a){for(var d=0;d<c.children.length;d++)c.children[d].style.display=d===a?"block":"none";l=a}var l=0,c=document.createElement("div");c.style.cssText="position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000";c.addEventListener("click",function(a){a.preventDefault();k(++l%c.children.length)},!1);var g=(performance||Date).now(),e=g,a=0,r=h(new Stats.Panel("FPS","#0ff","#002")),f=h(new Stats.Panel("MS","#0f0","#020"));
if(self.performance&&self.performance.memory)var t=h(new Stats.Panel("MB","#f08","#201"));k(0);return{REVISION:16,dom:c,addPanel:h,showPanel:k,begin:function(){g=(performance||Date).now()},end:function(){a++;var c=(performance||Date).now();f.update(c-g,200);if(c>e+1E3&&(r.update(1E3*a/(c-e),100),e=c,a=0,t)){var d=performance.memory;t.update(d.usedJSHeapSize/1048576,d.jsHeapSizeLimit/1048576)}return c},update:function(){g=this.end()},domElement:c,setMode:k}};
Stats.Panel=function(h,k,l){var c=Infinity,g=0,e=Math.round,a=e(window.devicePixelRatio||1),r=80*a,f=48*a,t=3*a,u=2*a,d=3*a,m=15*a,n=74*a,p=30*a,q=document.createElement("canvas");q.width=r;q.height=f;q.style.cssText="width:80px;height:48px";var b=q.getContext("2d");b.font="bold "+9*a+"px Helvetica,Arial,sans-serif";b.textBaseline="top";b.fillStyle=l;b.fillRect(0,0,r,f);b.fillStyle=k;b.fillText(h,t,u);b.fillRect(d,m,n,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d,m,n,p);return{dom:q,update:function(f,
v){c=Math.min(c,f);g=Math.max(g,f);b.fillStyle=l;b.globalAlpha=1;b.fillRect(0,0,r,m);b.fillStyle=k;b.fillText(e(f)+" "+h+" ("+e(c)+"-"+e(g)+")",t,u);b.drawImage(q,d+a,m,n-a,p,d,m,n-a,p);b.fillRect(d+n-a,m,a,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d+n-a,m,a,e((1-f/v)*p))}}};"object"===typeof module&&(module.exports=Stats);
    
			var renderer, scene, camera, stats;
			var pointclouds;
			var raycaster;
			var mouse = new THREE.Vector2();
			var intersection = null;
			var spheres = [];
			var spheresIndex = 0;
			var clock;

			var threshold = 0.1;
			var pointSize = 0.3;
			var width = 50;
			var length = 80;
			var cameraRotation = new THREE.Matrix4().makeRotationY( 0.005 ).makeRotationX(0.001);
            var counter = 0;
            var incr = 0.10;

            var phase = 0;

            var numRings = 6;

            var container = document.getElementById( 'main' );

			init();
            render();
            setTimeout(function() {
				clock = new THREE.Clock();
                animate();
            }, 1000);

    
			function init() {

				scene = new THREE.Scene();

				clock = new THREE.Clock();


                var camwidth = container.clientWidth/100;
                var camheight = container.clientHeight/100;
				//camera = new THREE.OrthographicCamera( camwidth / - 2, camwidth / 2, camheight / 2, camheight / - 2, 1, 100 );
                camera = new THREE.PerspectiveCamera( 45, camwidth / camheight, 1, 1000 );
				camera.position.set( 0, 0, 20 );
				camera.lookAt( scene.position );
				camera.updateMatrix();
                


				//
                //
                pointclouds = [  ];

                var num_groups = 6;

                for(var j=0; j<num_groups; j++) {
                    var group = new THREE.Group();
                    for(var i=0; i<numRings; i++) {


                        var pcBuffer = new THREE.CircleBufferGeometry( 1, 6 );
                        var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
                        material.side = THREE.DoubleSide;
                        var circle = new THREE.Mesh( pcBuffer, material );

                        circle.position.set(0*Math.cos(j*Math.PI*2/num_groups) + 2*Math.cos(i*Math.PI*2/numRings), 0*Math.sin(j*Math.PI*2/num_groups) + 2*Math.sin(i*Math.PI*2/numRings),   0)

                        group.add( circle );


                    }
                    scene.add(group);
                    pointclouds.push(group);
                
                }

                renderer = new THREE.WebGLRenderer( { antialias: true } );
                renderer.setPixelRatio( window.devicePixelRatio );
                renderer.setSize( container.offsetWidth, container.offsetHeight );
                container.appendChild( renderer.domElement );


                const color = 0x000000;  // white
                const near = 0;
                const far = 60 ;
                scene.fog = new THREE.Fog(color, near, far);
				//

				stats = new Stats();
				container.appendChild( stats.dom );

				//

				window.addEventListener( 'resize', onWindowResize, false );

                console.log(scene)

			}

			function onWindowResize() {

				camera.aspect = container.offsetWidth / container.offsetHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( container.offsetWidth, container.offsetHeight );

			}

			function animate() {

				requestAnimationFrame( animate );

				render();
				stats.update();

			}

			var toggle = 0;


            function get_rotation_period(counter) {
                return Math.abs(Math.pow(Math.sin(counter/200), 2))
            }

			function render() {

                //var camera_rotation = new THREE.Matrix4().makeRotationY(Math.sin(counter/800)/100 ).makeRotationX(-Math.sin(counter/800)/100);
//				camera.applyMatrix( camera_rotation );
				//camera.updateMatrixWorld();

                var speed = 3;

                var delta = clock.getDelta() * speed;
                var rawtime = clock.getElapsedTime() * speed;

                var mod_time = rawtime % Math.PI
                var step = 1 + Math.round( (rawtime - mod_time) / (Math.PI) )

                var freq = 1;
                var progress = step/2 - 1 + Math.sin( mod_time/2);

                if(step >= 14) {
                    if(step >= 20) {
                        clock = new THREE.Clock();
                        window.revert_clock = undefined;
                        window.revert_clock_start = undefined;
                    } else {
                        if(!window.revert_clock) {
                            window.revert_clock = new THREE.Clock();
                            window.revert_clock_start = window.revert_clock.getElapsedTime();
                        }
                        for ( var i = 0; i < pointclouds.length; i ++ ) {

                            var group = pointclouds[i];

                            //group.rotation.y += delta
                            group.position.x = (6 - (speed*window.revert_clock.getElapsedTime()/Math.PI))
                                * Math.cos(i*Math.PI*2 / pointclouds.length)
                            ;
                            group.position.y = (6 - (speed*window.revert_clock.getElapsedTime()/Math.PI))
                                * Math.sin(i*Math.PI*2 / pointclouds.length)
                            ;
                            for ( var j = 0; j < group.children.length; j ++ ) {
                                var object = group.children[j];
                                object.rotation.z = 0

                            }
                        }
                        
                    }
                } else {

                    for ( var i = 0; i < pointclouds.length; i ++ ) {

                        var group = pointclouds[i];


                        if(step % 2 == 0) {
                            //group.rotation.y += delta
                            group.position.x = 
                                    progress
                                // circular position
                                * Math.cos(i*Math.PI*2 / pointclouds.length)
                            ;
                            group.position.y = 
                                    progress
                                // circular position
                                * Math.sin(i*Math.PI*2 / pointclouds.length)
                            ;
                            for ( var j = 0; j < group.children.length; j ++ ) {
                                var object = group.children[j];

                                //debugger;
                                //object.geometry.center();
                                object.rotation.z = Math.PI*((step)/2);

                            }
                        } else {

                            for ( var j = 0; j < group.children.length; j ++ ) {
                                var object = group.children[j];

                                //debugger;
                                //object.geometry.center();
                                object.rotation.z = Math.PI*((step-1)/2) + mod_time/3

                            }
                        }


                    }
                }



                //geometry.attributes.position.needsUpdate = true;

				renderer.render( scene, camera );

			}
});

