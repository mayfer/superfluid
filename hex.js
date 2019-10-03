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
			var length = 50;
			var rotateY = new THREE.Matrix4().makeRotationY( 0.005 );
            var geometry = new THREE.BufferGeometry();

			init();
			animate();

			function generatePointCloudGeometry( color ) {

                var size = 20;
				var positions = new Float32Array( 3*Math.pow(size, 3) );
				var colors = new Float32Array(  3*Math.pow(size, 3) );
				var velocities = new Float32Array( 3*Math.pow(size, 3)  );

				var k = 0;

				var i = 0;

                var center_x = 0;
                var center_y = 0;


                for(var depth = -1; depth < 1; depth += 2/size) {
                    for(var height = -1; height < 1; height += 2/size) {
                        for(var width = -1; width < 1; width += 2/size) {

                            positions[ 3 * k ] = width;
                            positions[ 3 * k + 1 ] = height;
                            positions[ 3 * k + 2 ] = depth;

                            //var intensity = ( y + 0.5 ) * 5;
                            colors[ 3 * k ] =  0.5
                            colors[ 3 * k + 1 ] = 0.7
                            colors[ 3 * k + 2 ] = 0.9

                            k ++;
                        }
                    }
                }
                                        
				geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
				geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
				geometry.computeBoundingBox();

				return geometry;

			}

			function generatePointcloud( color ) {

				var geometry = generatePointCloudGeometry( color );

				var material = new THREE.PointsMaterial( { size: 0.5, vertexColors: THREE.VertexColors } );
				var pointcloud = new THREE.Points( geometry, material );

				return pointcloud;

			}

    
			function init() {

				var container = document.getElementById( 'main' );

				scene = new THREE.Scene();

				clock = new THREE.Clock();

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
				camera.position.set( 0, 20, 20 );
				camera.lookAt( scene.position );
				camera.updateMatrix();

				//

				var pcBuffer = generatePointcloud( new THREE.Color( 1, 1, 1 ) );
				pcBuffer.scale.set( 10, 10, 10 );
				pcBuffer.position.set( 0, 0, 0 );
				scene.add( pcBuffer );


				pointclouds = [ pcBuffer, ];


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
            var counter = 0;

			function render() {

				camera.applyMatrix( rotateY );
				camera.updateMatrixWorld();

				//raycaster.setFromCamera( mouse, camera );

				//var intersections = raycaster.intersectObjects( pointclouds );
				//intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;

                /*
				for ( var i = 0; i < geometry.attributes.position.array.length/3; i ++ ) {

					//var sphere = spheres[ i ];

                    geometry.attributes.position.array[3 * i + 0] = 0.5*Math.sin(i * counter/1000)
                    geometry.addAttribute( 'position', new THREE.BufferAttribute( geometry.attributes.position.array, 3 ) );

				}
                */

				toggle += clock.getDelta();
                counter += 1;

				renderer.render( scene, camera );

			}
});

