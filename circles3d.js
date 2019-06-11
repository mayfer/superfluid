define(['libs/three.min.js'], function (THREE) {


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

            var numRings = 20;

			init();
            render();
            setTimeout(function() {
                animate();
            }, 1000);

			function generatePointcloud( width, numPoints, radius ) {
                var color = new THREE.Color( 1/radius, 0.5/radius, 1/radius );
                var geometry = new THREE.BufferGeometry();

				var positions = new Float32Array( numPoints * 3 );
				var colors = new Float32Array( numPoints * 3 );
				var velocities = new Float32Array( numPoints * 3 );


                var degree = Math.PI * 2 / (numPoints);
                var deg = 0;

				var k = 0;
                for ( var i = 0; i < numPoints; i ++) {
                        var x = Math.sin(deg) * radius;
                        var y = Math.cos(deg) * radius;
                        var z = Math.sin(deg*10)/4;

                        positions[ 3 * k ] = x;
                        positions[ 3 * k + 1 ] = y;
                        positions[ 3 * k + 2 ] = z;

                        //var intensity = ( y + 0.5 ) * 5;
                        colors[ 3 * k ] =  color.r
                        colors[ 3 * k + 1 ] = color.g
                        colors[ 3 * k + 2 ] = color.b

                        k ++;
                        deg = degree * i;
                }
                /*
                for ( var i = -length; i < length; i ++ ) {
                    for ( var j = -length; j < length; j ++ ) {

                        var u = i/10
                        var v = j / length;
                        var x = u
                        var y = (Math.sin(i/20))*(  Math.sin( v * Math.PI * 8 ) ) / 5;
                        var z = v

                        positions[ 3 * k ] = x;
                        positions[ 3 * k + 1 ] = y;
                        positions[ 3 * k + 2 ] = z;

                        //var intensity = ( y + 0.5 ) * 5;
                        colors[ 3 * k ] =  0.5
                        colors[ 3 * k + 1 ] = 0.7
                        colors[ 3 * k + 2 ] = 0.9

                        k ++;

                    }
                }
                */

				geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
				geometry.addAttribute( 'customRadius', radius);
				geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
				geometry.computeBoundingBox();


				var material = new THREE.LineBasicMaterial( { linewidth: 20, lights: false, vertexColors: THREE.VertexColors } );
				var pointcloud = new THREE.LineLoop( geometry, material );

				return pointcloud;

			}

    
			function init() {

				var container = document.getElementById( 'main' );

				scene = new THREE.Scene();

				clock = new THREE.Clock();

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
				camera.position.set( 0, 10, 25 );
				camera.lookAt( scene.position );
				camera.updateMatrix();


				//
                //
                pointclouds = [  ];

                for(var i=0; i<numRings; i++) {

                    var pcBuffer = generatePointcloud( width, 500, 0.1+i/20 );
                    pcBuffer.scale.set( 5, 5, 5);
                    pcBuffer.position.set( 0, 0, 0 );
                    scene.add( pcBuffer );

                    pointclouds.push(pcBuffer);
                
                }

                renderer = new THREE.WebGLRenderer( { antialias: true } );
                renderer.setPixelRatio( window.devicePixelRatio );
                renderer.setSize( window.innerWidth, window.innerHeight );
                container.appendChild( renderer.domElement );

				//

				stats = new Stats();
				container.appendChild( stats.dom );

				//

				window.addEventListener( 'resize', onWindowResize, false );
				document.addEventListener( 'mousemove', onDocumentMouseMove, false );

                console.log(scene)

			}

			function onDocumentMouseMove( event ) {

				event.preventDefault();

				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

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

                var camera_rotation = new THREE.Matrix4().makeRotationY(Math.sin(counter/800)/100 ).makeRotationX(-Math.sin(counter/800)/100);
//				camera.applyMatrix( camera_rotation );
				camera.updateMatrixWorld();

                for ( var i = 0; i < scene.children.length; i ++ ) {

					var object = scene.children[ i ];

					if ( object.isLine ) {

                        var multiplier
                        if(Math.sin(counter/200) > 0) {
                            multiplier = i;
                        } else {
                            multiplier = numRings - i;
                        }

                        var rotation = get_rotation_period(counter)
						object.rotation.z = Math.abs(Math.pow(Math.sin(counter/200), 2)) * ( multiplier/4 );
						object.rotation.y = Math.abs(Math.pow(Math.sin(counter/200), 2)) * ( multiplier );
						object.rotation.x = Math.abs(Math.pow(Math.sin(counter/200), 2)) * ( multiplier/10 );

					}

				}

                var degree = Math.PI * 2 / (500);
                var deg = 0
                for ( var jj = 0; jj < pointclouds.length; jj ++ ) {
                    var k = 0;
                    var pointcloud = pointclouds[jj];
                    for ( var i = 0; i < 500; i ++) {
                            var radius = pointcloud.geometry.attributes.customRadius.array;
                            var x = Math.sin(deg) * (radius)
                            var y = Math.cos(deg) * (radius);
                            var multiplier;
                            if(Math.sin(counter/200) > 0) {
                                multiplier = jj;
                            } else {
                                multiplier = numRings - jj;
                            }
                            var curvature = Math.sin(deg*10) * Math.pow(multiplier/2, 2) * Math.cos(counter/400) / 200;

                            var z = curvature * Math.cos(deg*10) * Math.pow(Math.abs(Math.pow(Math.sin(counter/200), 2)), 0.25);

                            pointcloud.geometry.attributes.position.array[ 3 * k ] = x;
                            pointcloud.geometry.attributes.position.array[ 3 * k + 1 ] = y;
                            pointcloud.geometry.attributes.position.array[ 3 * k + 2 ] = z;


                            k ++;
                            deg = degree * i;
                    }
                    pointcloud.geometry.attributes.position.needsUpdate = true;
                }

/*

				var positions = geometry.attributes.position.array;

				var k = 0;

                for ( var i = -length; i < length; i ++ ) {
                    for ( var j = -length; j < length; j ++ ) {

                        var u = i/20
                        var v = j / length;
                        var x = u
                        var y = Math.max(0, 
                            (Math.sin(counter/10 + i/3)
                            + Math.sin(counter/17 + j/10)
                            )
                        / 20) * 3;
                        var z = v

                        positions[ 3 * k ] = x;
                        positions[ 3 * k + 1 ] = y;
                        positions[ 3 * k + 2 ] = z;

                        k ++;

                    }
                }
*/

                //geometry.attributes.position.needsUpdate = true;

				toggle += clock.getDelta();

                if(incr < 1) {
                    counter += incr;
                    incr += incr/100
                } else {
                    counter += 1;
                }

				renderer.render( scene, camera );

			}
});

